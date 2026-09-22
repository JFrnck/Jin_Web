import { useRef, useState } from 'react'
import { useBudgetStatus } from '~/features/budget/useBudgetStatus'
import { api, getErrorMessage, unwrap } from '~/lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { BUDGET_QUERY_KEY } from '~/features/budget/useBudgetStatus'
import { EmptyState, Skeleton } from '~/components/EmptyState'

const HOLD_MS = 3000

/**
 * "Reanudar" exige mantener pulsado 3s (diseño v3 §05) — fricción
 * deliberada para una acción que solo el humano puede iniciar. Nunca es
 * una tool del registry: si un input envenenado pudiera pedir el
 * unpause, el kill switch no serviría de nada.
 */
function UnpauseButton() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const startRef = useRef(0)

  function clear() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
    setProgress(0)
  }

  function start() {
    if (pending) return
    startRef.current = Date.now()
    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current
      setProgress(Math.min(1, elapsed / HOLD_MS))
      if (elapsed >= HOLD_MS) {
        clear()
        void confirmUnpause()
      }
    }, 50)
  }

  async function confirmUnpause() {
    setPending(true)
    setError(null)
    try {
      // docs/RECOMENDACIONES.md #17: sin `unwrap()`, un fallo real acá
      // (ej. el kill switch ya se había reactivado) pasaba desapercibido
      // — el hold de 3s "funcionaba" siempre a los ojos del owner.
      unwrap(await api.POST('/api/budget/unpause', {}))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPending(false)
      await queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY })
    }
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <button
        type="button"
        onMouseDown={start}
        onMouseUp={clear}
        onMouseLeave={clear}
        onTouchStart={start}
        onTouchEnd={clear}
        disabled={pending}
        data-pending={pending || undefined}
        style={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          minHeight: 52,
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(242,101,74,.5)',
          background: 'rgba(242,101,74,.10)',
          color: '#FFE3DB',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 14,
          cursor: pending ? 'wait' : 'pointer',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            background:
              'linear-gradient(90deg, rgba(242,101,74,.55), rgba(242,101,74,.85))',
            width: `${progress * 100}%`,
            transition: progress === 0 ? 'width 180ms ease-out' : 'none',
          }}
        />
        <span style={{ position: 'relative' }}>
          {pending ? 'Reanudando…' : 'Reanudar agentes — mantener pulsado 3 s'}
        </span>
      </button>
      {error && (
        <p style={{ margin: 0, fontSize: 13, color: '#FF8367' }}>
          ⚠ No se reanudó: {error}
        </p>
      )}
    </div>
  )
}

export default function Budget() {
  const { data, isLoading, isError, refetch } = useBudgetStatus()

  if (isLoading) {
    return <Skeleton height={280} />
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="No se pudo cargar el presupuesto"
        detail="Sin conexión con la API."
        action={
          <button type="button" className="jin-btn" onClick={() => refetch()}>
            Reintentar
          </button>
        }
      />
    )
  }

  const ratioPct = Math.round(data.dailyUsageRatio * 100)

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 480 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Presupuesto y kill switch</h1>

      <div className="jin-card">
        <p className="jin-dim mono" style={{ fontSize: 11, margin: '0 0 8px' }}>
          DÍA · {ratioPct}%{ratioPct >= 80 ? ' · umbral 80% cruzado' : ''}
        </p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
          ${data.dailyUsageUsd.toFixed(2)}{' '}
          <span className="jin-muted" style={{ fontSize: 16, fontWeight: 400 }}>
            / ${data.dailyLimitUsd.toFixed(2)}
          </span>
        </p>
        <p className="jin-muted mono" style={{ fontSize: 13, margin: '4px 0 0' }}>
          {data.dailyUsageTokens.toLocaleString('es-PE')} tokens · límite{' '}
          {data.dailyLimitTokens.toLocaleString('es-PE')}
        </p>
        <div
          className="jin-progress-track"
          data-level={ratioPct >= 100 ? 'danger' : ratioPct >= 80 ? 'warn' : 'normal'}
          style={{ marginTop: 12 }}
        >
          <div className="jin-progress-fill" style={{ width: `${Math.min(100, ratioPct)}%` }} />
        </div>
      </div>

      <div className="jin-card">
        <p className="jin-dim mono" style={{ fontSize: 11, margin: '0 0 8px' }}>
          ÚLTIMA HORA
        </p>
        <p style={{ margin: 0 }}>
          ${((data.killSwitch.currentHourTokens / Math.max(1, data.dailyUsageTokens)) * data.dailyUsageUsd).toFixed(2)}
          {' · '}
          {data.killSwitch.currentHourTokens.toLocaleString('es-PE')} tokens
        </p>
        <p className="jin-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
          vs. hora típica{' '}
          {data.killSwitch.avgHourlyTokens > 0
            ? `${(data.killSwitch.currentHourTokens / data.killSwitch.avgHourlyTokens).toFixed(1)}× lo normal`
            : 'sin historial suficiente'}
        </p>
      </div>

      {data.killSwitchActive && (
        <div className="jin-card jin-card--dual">
          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#FFE3DB' }}>
            KILL SWITCH ACTIVO
          </p>
          {data.killSwitch.reason && (
            <p className="jin-muted" style={{ fontSize: 13, margin: '0 0 16px' }}>
              {data.killSwitch.reason}
            </p>
          )}
          <UnpauseButton />
          <p className="jin-dim" style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}>
            solo lo inicia el humano y solo desde acá — ningún agente puede pedirlo
          </p>
        </div>
      )}
    </section>
  )
}
