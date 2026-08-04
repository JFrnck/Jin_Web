import { ApprovalCard } from '~/features/hitl/ApprovalCard'
import { useApprovals, useApproveRejectMutations } from '~/features/hitl/useApprovals'
import { EmptyState, Skeleton } from '~/components/EmptyState'

export default function Hitl() {
  const { data, isLoading, isError, refetch } = useApprovals()
  const { approve, reject } = useApproveRejectMutations()

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 640 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 20 }}>Aprobaciones</h1>
        <p className="jin-muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
          {data ? `${data.length} pendientes` : '—'}
        </p>
      </header>

      {isLoading && (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Skeleton height={140} />
          <Skeleton height={140} />
        </div>
      )}

      {isError && (
        <EmptyState
          title="No se pudo cargar la bandeja"
          detail="Sin tiempo real — la lista puede estar incompleta."
          action={
            <button type="button" className="jin-btn" onClick={() => refetch()}>
              Refrescar ahora
            </button>
          }
        />
      )}

      {data && data.length === 0 && (
        <EmptyState
          title="Nada esperando por ti"
          detail="Los agentes siguen trabajando — volvé cuando algo necesite tu decisión."
        />
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {data.map((approval) => (
            <ApprovalCard
              key={approval.requestId}
              approval={approval}
              onApprove={approve}
              onReject={reject}
            />
          ))}
        </div>
      )}
    </section>
  )
}
