import { Link } from 'react-router'
import { useApprovals } from '~/features/hitl/useApprovals'
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

  const pendingCount = approvals.data?.length ?? 0

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 720 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Overview</h1>

      <div className="jin-card">
        <p className="jin-dim mono" style={{ fontSize: 11, margin: '0 0 8px' }}>
          ESPERANDO TU DECISIÓN
        </p>
        {approvals.isLoading ? (
          <Skeleton height={24} />
        ) : approvals.isError ? (
          <CardError onRetry={() => approvals.refetch()} />
        ) : pendingCount === 0 ? (
          <p style={{ margin: 0 }}>Nada esperando por ti.</p>
        ) : (
          <>
            <p style={{ margin: '0 0 8px', fontSize: 15 }}>
              {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
            </p>
            <Link to="/hitl" className="jin-btn jin-btn--primary">
              Revisar bandeja
            </Link>
          </>
        )}
      </div>

      <div className="jin-card">
        <p className="jin-dim mono" style={{ fontSize: 11, margin: '0 0 8px' }}>
          PRESUPUESTO HOY
        </p>
        {budget.isLoading ? (
          <Skeleton height={24} />
        ) : budget.isError || !budget.data ? (
          <CardError onRetry={() => budget.refetch()} />
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              {Math.round(budget.data.dailyUsageRatio * 100)}%
            </p>
            <p className="jin-muted mono" style={{ margin: '4px 0 0', fontSize: 13 }}>
              ${budget.data.dailyUsageUsd.toFixed(2)} / ${budget.data.dailyLimitUsd.toFixed(2)}
              {' · '}
              {Math.round(budget.data.dailyUsageTokens / 1000)}k tokens
            </p>
          </>
        )}
      </div>

      <div className="jin-card">
        <p className="jin-dim mono" style={{ fontSize: 11, margin: '0 0 8px' }}>
          ACTIVIDAD RECIENTE
        </p>
        {activity.isLoading ? (
          <Skeleton height={80} />
        ) : activity.isError ? (
          <CardError onRetry={() => activity.refetch()} />
        ) : activity.data && activity.data.items.length > 0 ? (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
            {activity.data.items.map((entry) => (
              <li
                key={entry.id}
                style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}
              >
                <span>{entry.toolName ?? entry.actionType}</span>
                <span className="jin-dim mono">
                  {new Date(entry.timestamp).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="jin-muted" style={{ margin: 0 }}>
            Sin actividad todavía.
          </p>
        )}
      </div>
    </section>
  )
}
