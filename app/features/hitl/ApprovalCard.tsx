import { useEffect, useState } from 'react'
import { RiskBadge, type RiskLevel } from '~/components/RiskBadge'
import { Button } from '~/components/Button'
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
  const [, forceTick] = useState(0)
  const isDual = approval.level === 'dual-confirm'
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
    try {
      await onApprove(approval.requestId)
    } finally {
      setPending(null)
    }
  }

  async function handleReject() {
    setPending('reject')
    try {
      await onReject(approval.requestId)
    } finally {
      setPending(null)
    }
  }

  const expiry = timeUntil(approval.escalatedAt ?? null)
  const secondWaitLabel =
    awaitingSecond && !secondAvailable && approval.availableAt
      ? timeUntil(approval.availableAt)
      : null

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
            <p className="jin-dim" style={{ fontSize: 13, margin: 0 }}>
              Influido por: <span className="mono">{approval.externalInputsSummary}</span>
            </p>
          )}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--sunken)', paddingTop: 'var(--space-2)' }}>
        <p className="mono jin-dim" style={{ fontSize: 11, margin: '0 0 6px' }}>
          PAYLOAD REAL
        </p>
        <PayloadDump payload={approval.payload} />
      </div>

      {isDual && (
        <p className="jin-muted" style={{ fontSize: 13, margin: 0 }}>
          irreversible · requiere 2 aprobaciones separadas por ≥30s
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={pending !== null}
          style={{ flex: 1 }}
        >
          Rechazar
        </Button>
        <Button
          variant={isDual ? 'accent' : 'primary'}
          onClick={handleApprove}
          disabled={
            pending !== null || (awaitingSecond && !secondAvailable)
          }
          style={{ flex: 2 }}
        >
          {pending === 'approve'
            ? 'Aprobando…'
            : awaitingSecond
              ? secondAvailable
                ? 'Confirmar (2/2)'
                : `Espera ${secondWaitLabel}`
              : isDual
                ? 'Aprobar (1/2)'
                : 'Aprobar'}
        </Button>
      </div>
    </article>
  )
}
