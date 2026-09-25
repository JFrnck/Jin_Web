import { useCallback, useEffect, useRef, useState } from 'react'
import { getChatSocket } from '~/lib/ws-client'
import type { components } from '~/lib/api-types'
import type { AgentPlan, AgentProgressEvent } from './agent-progress.types'

type AgentTurnResult = components['schemas']['AgentTurnResultDto_Output']

export interface LiveToolCall {
  readonly toolCallId: string
  readonly toolName: string
  readonly status: 'running' | 'success' | 'error' | 'deferred'
  readonly summary?: string
}

export interface ChatTurnProgress {
  readonly plan: AgentPlan | null
  readonly liveText: string
  readonly liveIteration: number | null
  readonly toolCalls: readonly LiveToolCall[]
}

const EMPTY_PROGRESS: ChatTurnProgress = {
  plan: null,
  liveText: '',
  liveIteration: null,
  toolCalls: [],
}

export interface ChatTurn {
  readonly objective: string
  readonly result: AgentTurnResult | null
  readonly error: string | null
  /** Streaming en vivo del turno mientras corre — ver `chat:progress` en `ws-client.ts`. `onResponse`/`onError` NUNCA lo tocan: el texto/plan parcial queda visible aunque el turno termine en error, mismo criterio que ya usa `onDisconnect`. */
  readonly progress: ChatTurnProgress
}

/** Aplica un único evento de progreso sobre el `progress` de un turno. */
function applyProgressEvent(
  progress: ChatTurnProgress,
  event: AgentProgressEvent,
): ChatTurnProgress {
  switch (event.type) {
    case 'plan':
      return { ...progress, plan: event.plan }
    case 'tool-call-started': {
      const alreadyTracked = progress.toolCalls.some(
        (t) => t.toolCallId === event.toolCallId,
      )
      return {
        ...progress,
        toolCalls: alreadyTracked
          ? progress.toolCalls.map((t) =>
              t.toolCallId === event.toolCallId ? { ...t, status: 'running' } : t,
            )
          : [
              ...progress.toolCalls,
              {
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                status: 'running',
              },
            ],
      }
    }
    case 'tool-call-finished':
      return {
        ...progress,
        toolCalls: progress.toolCalls.map((t) =>
          t.toolCallId === event.toolCallId
            ? {
                ...t,
                status: event.outcome,
                // Spread condicional, no `summary: event.summary`: con
                // `exactOptionalPropertyTypes`, la clave debe estar
                // AUSENTE cuando no hay resumen, no presente-con-undefined.
                ...(event.summary !== undefined ? { summary: event.summary } : {}),
              }
            : t,
        ),
      }
    case 'text-delta':
      // Nueva iteración del loop del agente: el texto de la anterior
      // (ej. acompañaba una tool_use) ya no es la respuesta en curso —
      // se reemplaza, no se concatena. Misma iteración: `snapshot` ya
      // es el texto acumulado completo, se sobrescribe siempre.
      return event.iteration !== progress.liveIteration
        ? { ...progress, liveText: event.snapshot, liveIteration: event.iteration }
        : { ...progress, liveText: event.snapshot }
  }
}

const SESSION_STORAGE_KEY = 'jin.chat.sessionId'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, id)
  return id
}

/**
 * Sin persistencia de sesión server-side (ADR 0007 #7 — a diferencia de
 * Telegram): el historial vive acá, en memoria del tab. `sessionId` fijo
 * por pestaña (sessionStorage) para que el budget guard agrupe el
 * consumo del mismo hilo de conversación.
 */
export function useChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [pending, setPending] = useState(false)
  const sessionIdRef = useRef(getOrCreateSessionId())

  useEffect(() => {
    const socket = getChatSocket()

    const onResponse = (result: AgentTurnResult) => {
      setPending(false)
      setTurns((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last) next[next.length - 1] = { ...last, result }
        return next
      })
    }
    const onError = (payload: { message: string }) => {
      setPending(false)
      setTurns((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last) next[next.length - 1] = { ...last, error: payload.message }
        return next
      })
    }
    const onProgress = (event: AgentProgressEvent) => {
      setTurns((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last) {
          next[next.length - 1] = {
            ...last,
            progress: applyProgressEvent(last.progress, event),
          }
        }
        return next
      })
    }

    // docs/RECOMENDACIONES.md #16: sin esto, un turno que se cae a mitad
    // de camino (WS desconectado antes de chat:response/chat:error) deja
    // `pending` en true para siempre — el botón de enviar queda
    // deshabilitado y el turno muestra "trabajando…" sin fin. No se
    // reintenta el turno automáticamente al reconectar: pudo haber
    // ejecutado tools con efectos reales, reintentarlo a ciegas es peor
    // que dejar que el owner decida qué hacer.
    const onDisconnect = () => {
      setPending((wasPending) => {
        if (!wasPending) return wasPending
        setTurns((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last && !last.result && !last.error) {
            next[next.length - 1] = {
              ...last,
              error:
                'Se perdió la conexión antes de que llegara la respuesta. No sabemos si el turno se completó — revisá /hitl y /audit antes de reintentar.',
            }
          }
          return next
        })
        return false
      })
    }

    socket.on('chat:response', onResponse)
    socket.on('chat:error', onError)
    socket.on('chat:progress', onProgress)
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('chat:response', onResponse)
      socket.off('chat:error', onError)
      socket.off('chat:progress', onProgress)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  const send = useCallback((objective: string) => {
    setPending(true)
    setTurns((prev) => [
      ...prev,
      { objective, result: null, error: null, progress: EMPTY_PROGRESS },
    ])
    getChatSocket().emit('chat:message', {
      sessionId: sessionIdRef.current,
      objective,
    })
  }, [])

  return { turns, pending, send }
}
