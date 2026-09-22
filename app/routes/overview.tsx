import { useApprovals } from '~/features/hitl/useApprovals'
import { PendingHero } from '~/features/hitl/PendingHero'
import { useBudgetStatus } from '~/features/budget/useBudgetStatus'
import { useAuditLog } from '~/features/audit/useAuditLog'
import { Skeleton } from '~/components/EmptyState'

function CardError({ onRetry }: { onRetry: () => void }) {
  return (
    <p className="jin-muted" style={{ margin: 0, fontSize: 13 }}>
      Sin conexión con la API.{' '}
      <button
        type="button"
        onClick={onRetry}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--link)',
          cursor: 'pointer',
          padding: 0,
          font: 'inherit',
        }}
      >
        Reintentar
      </button>
    </p>
  )
}

export default function Overview() {
  const approvals = useApprovals()
  const budget = useBudgetStatus()
  const activity = useAuditLog({ limit: 5 })

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 1100 }}>
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: '#FBF3F0' }}>
        Overview
      </h1>

      {approvals.isLoading ? (
        <Skeleton height={64} />
      ) : approvals.isError ? (
        <div className="jin-card">
          <CardError onRetry={() => approvals.refetch()} />
        </div>
      ) : (
        <PendingHero approvals={approvals.data ?? []} />
      )}

      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        <div className="jin-card">
          <p className="jin-dim mono" style={{ fontSize: 11, letterSpacing: '0.12em', margin: '0 0 8px' }}>
            PRESUPUESTO HOY
          </p>
          {budget.isLoading ? (
            <Skeleton height={24} />
          ) : budget.isError || !budget.data ? (
            <CardError onRetry={() => budget.refetch()} />
          ) : (
            <>
              <p className="mono" style={{ margin: 0, fontSize: 26, fontWeight: 600, color: 'var(--text)' }}>
                ${budget.data.dailyUsageUsd.toFixed(2)}{' '}
                <span className="jin-dim" style={{ fontSize: 13, fontWeight: 400 }}>
                  / ${budget.data.dailyLimitUsd.toFixed(2)}
                </span>
              </p>
              <div className="jin-progress-track" style={{ marginTop: 12 }}>
                <div
                  className="jin-progress-fill"
                  style={{ width: `${Math.min(100, Math.round(budget.data.dailyUsageRatio * 100))}%` }}
                />
              </div>
            </>
          )}
        </div>

        <div className="jin-card">
          <p className="jin-dim mono" style={{ fontSize: 11, letterSpacing: '0.12em', margin: '0 0 9px' }}>
            ACTIVIDAD RECIENTE
          </p>
          {activity.isLoading ? (
            <Skeleton height={80} />
          ) : activity.isError ? (
            <CardError onRetry={() => activity.refetch()} />
          ) : activity.data && activity.data.items.length > 0 ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
              {activity.data.items.map((entry) => (
                <li key={entry.id} className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {entry.toolName ?? entry.actionType}
                </li>
              ))}
            </ul>
          ) : (
            <p className="jin-muted" style={{ margin: 0 }}>
              Sin actividad todavía.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
