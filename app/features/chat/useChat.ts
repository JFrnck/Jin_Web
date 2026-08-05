import { useCallback, useEffect, useRef, useState } from 'react'
import { getChatSocket } from '~/lib/ws-client'
import type { components } from '~/lib/api-types'

type AgentTurnResult = components['schemas']['AgentTurnResultDto_Output']

export interface ChatTurn {
  readonly objective: string
  readonly result: AgentTurnResult | null
  readonly error: string | null
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
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('chat:response', onResponse)
      socket.off('chat:error', onError)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  const send = useCallback((objective: string) => {
    setPending(true)
    setTurns((prev) => [...prev, { objective, result: null, error: null }])
    getChatSocket().emit('chat:message', {
      sessionId: sessionIdRef.current,
      objective,
    })
  }, [])

  return { turns, pending, send }
}
