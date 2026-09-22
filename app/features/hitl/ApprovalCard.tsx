import { useEffect, useState } from 'react'
import { RiskBadge, type RiskLevel } from '~/components/RiskBadge'
import { Button } from '~/components/Button'
import { getErrorMessage } from '~/lib/api-client'
import type { components } from '~/lib/api-types'

type PendingApproval = components['schemas']['PendingApprovalDto']

function toRiskLevel(level: string): RiskLevel {
  return level === 'confirm' || level === 'dual-confirm' ? level : 'confirm'
}

function timeUntil(iso: string | null): string | null {
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'expirando'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h} h ${m} m` : `${m} m`
}

/** Payload real, sin asumir un shape fijo — cada tool tiene el suyo (jsonb). */
function PayloadDump({ payload }: { payload: unknown }) {
  if (payload === null || payload === undefined) return null
  if (typeof payload !== 'object') {
    return <div className="mono jin-muted">{String(payload)}</div>
  }
  return (
    <dl style={{ margin: 0, display: 'grid', gap: 4 }}>
      {Object.entries(payload as Record<string, unknown>).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
          <dt className="mono jin-dim" style={{ flexShrink: 0 }}>
            {key}:
          </dt>
          <dd className="mono" style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: PendingApproval
  onApprove: (requestId: string) => Promise<unknown>
  onReject: (requestId: string) => Promise<unknown>
}) {
  const [pending, setPending] = useState<'approve' | 'reject' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  // Abierto por defecto (diseño v4 §7.3): es el "payload real", no un
  // detalle que hay que ir a buscar. El toggle existe para pantallas
  // chicas, no para esconder información por defecto.
  const [payloadOpen, setPayloadOpen] = useState(true)
  const [, forceTick] = useState(0)
  const isDual = approval.level === 'dual-confirm'
  const executing = approval.executingAt !== null
  const awaitingSecond = isDual && approval.firstApprovedAt !== null
  const secondAvailable =
    approval.availableAt !== null && new Date(approval.availableAt).getTime() <= Date.now()

  // Re-render cada segundo mientras haya un temporizador de lectura
  // forzado corriendo (dual-confirm) — el countdown es el punto del
  // componente, no un detalle cosmético (BLUEPRINT 9.2).
  useEffect(() => {
    if (!awaitingSecond || secondAvailable) return
    const id = window.setInterval(() => forceTick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [awaitingSecond, secondAvailable])

  async function handleApprove() {
    setPending('approve')
    setActionError(null)
    try {
      await onApprove(approval.requestId)
    } catch (err) {
      // docs/RECOMENDACIONES.md #17: sin este catch, un fallo acá (ej. el
      // 409 de "segunda confirmación demasiado pronto" en dual-confirm)
      // no se mostraba — el owner podía creer que aprobó algo que en
      // realidad no se ejecutó, el peor modo de falla posible en HITL.
      setActionError(getErrorMessage(err))
    } finally {
      setPending(null)
    }
  }

  async function handleReject() {
    setPending('reject')
    setActionError(null)
    try {
      await onReject(approval.requestId)
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setPending(null)
    }
  }

  const expiry = timeUntil(approval.escalatedAt ?? null)
  const isWaiting = awaitingSecond && !secondAvailable
  const secondWaitLabel =
    isWaiting && approval.availableAt ? timeUntil(approval.availableAt) : null

  // Relleno de progreso sobre el propio botón durante la espera de 30s
  // del dual-confirm (diseño v4 §7.3, primitivo del botón de aprobación):
  // deja ver cuánto falta sin un temporizador aparte.
  let waitProgressPct = 0
  if (isWaiting && approval.firstApprovedAt && approval.availableAt) {
    const start = new Date(approval.firstApprovedAt).getTime()
    const end = new Date(approval.availableAt).getTime()
    const total = end - start
    waitProgressPct =
      total > 0 ? Math.min(100, Math.max(0, ((Date.now() - start) / total) * 100)) : 0
  }

  return (
    <article
      className={isDual ? 'jin-card jin-card--dual' : 'jin-card'}
      style={{ display: 'grid', gap: 'var(--space-3)' }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <RiskBadge level={toRiskLevel(approval.level)} />
        <span className="mono jin-dim" style={{ fontSize: 12 }}>
          {approval.toolName}
        </span>
        <span style={{ flex: 1 }} />
        {expiry && (
          <span className="mono jin-dim" style={{ fontSize: 12 }}>
            expira en {expiry}
          </span>
        )}
      </header>

      <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
        {approval.planSummary ?? approval.toolName}
      </p>

      {(approval.actor ?? approval.externalInputsSummary) && (
        <div style={{ display: 'grid', gap: 2 }}>
          {approval.actor && (
            <p className="jin-dim" style={{ fontSize: 13, margin: 0 }}>
              Solicitado por: <span className="mono">{approval.actor}</span>
            </p>
          )}
          {approval.externalInputsSummary && (
            <div className="jin-callout-amber">
              <span className="jin-callout-amber-label">⚠ INFLUIDO POR</span>
              <span className="mono" style={{ fontSize: 13.5 }}>
                {approval.externalInputsSummary}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 'var(--space-2)' }}>
        <button
          type="button"
          onClick={() => setPayloadOpen((v) => !v)}
          style={{
            width: '100%',
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span className="mono jin-dim" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
            PAYLOAD REAL
          </span>
          <span style={{ flex: 1 }} />
          <span className="mono jin-muted" style={{ fontSize: 11.5 }}>
            {payloadOpen ? 'Plegar ▴' : 'Ver ▾'}
          </span>
        </button>
        {payloadOpen && (
          <div style={{ maxHeight: 186, overflow: 'auto', marginTop: 6 }}>
            <PayloadDump payload={approval.payload} />
          </div>
        )}
      </div>

      {isDual && (
        <p className="jin-muted" style={{ fontSize: 13, margin: 0 }}>
          irreversible · requiere 2 aprobaciones separadas por ≥30s
        </p>
      )}

      {/* Issue Jin_Core #36: la aprobación falló al EJECUTARSE. La acción NO
          ocurrió y no se reintenta sola: hay que decírselo, no dejar al owner
          creyendo que salió. */}
      {approval.executionError && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--accent-text)' }}>
          ⚠ La última aprobación NO se ejecutó: {approval.executionError}. No se reintenta
          sola — aprobala de nuevo si querés reintentar.
        </p>
      )}
      {executing && (
        <p className="jin-muted" style={{ margin: 0, fontSize: 13 }}>
          Ejecutándose ahora… (si esto dura más de 15 min, revisá el audit antes de rechazar).
        </p>
      )}

      {actionError && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--accent-text)' }}>
          ⚠ No se completó: {actionError}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={pending !== null || executing}
          data-pending={pending === 'reject' || undefined}
          style={{ flex: 1 }}
        >
          Rechazar
        </Button>
        <Button
          variant={isDual ? 'accent' : 'primary'}
          onClick={handleApprove}
          disabled={
            pending !== null || executing || (awaitingSecond && !secondAvailable)
          }
          data-pending={pending === 'approve' || undefined}
          style={{
            flex: 2,
            position: 'relative',
            overflow: 'hidden',
            // Mientras se espera el segundo paso, el botón muestra ámbar
            // (no el rojo de "listo para actuar" ni el verde de éxito) —
            // es una espera deliberada, no una confirmación ya lista.
            ...(isWaiting
              ? {
                  color: 'var(--amber)',
                  background: 'rgba(232,192,122,.10)',
                  borderColor: 'rgba(232,192,122,.45)',
                }
              : {}),
          }}
        >
          {isWaiting && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(232,192,122,.18)',
                width: `${waitProgressPct}%`,
                transition: 'width 1000ms linear',
              }}
            />
          )}
          <span style={{ position: 'relative' }}>
            {pending === 'approve'
              ? 'Aprobando…'
              : awaitingSecond
                ? secondAvailable
                  ? 'Confirmar (2/2)'
                  : `Espera ${secondWaitLabel}`
                : isDual
                  ? 'Aprobar (1/2)'
                  : 'Aprobar'}
          </span>
        </Button>
      </div>
      {isWaiting && (
        <p className="jin-amber" style={{ margin: 0, fontSize: 12.5, textAlign: 'center' }}>
          La espera es deliberada: relee el payload antes de confirmar.
        </p>
      )}
    </article>
  )
}
