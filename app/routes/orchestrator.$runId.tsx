import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api, unwrap } from '~/lib/api-client'
import { EmptyState, Skeleton } from '~/components/EmptyState'

const COLUMN_ORDER = ['pending', 'in-progress', 'done', 'failed', 'blocked'] as const
const COLUMN_LABEL: Record<(typeof COLUMN_ORDER)[number], string> = {
  pending: 'PENDIENTE',
  'in-progress': 'EN CURSO',
  done: 'HECHO',
  failed: 'FALLIDO',
  blocked: 'BLOQUEADO',
}

export default function OrchestratorRun() {
  const { runId } = useParams<{ runId: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orchestrator', 'run', runId],
    queryFn: async () =>
      unwrap(
        await api.GET('/api/orchestrator/runs/{runId}', {
          params: { path: { runId: runId! } },
        }),
      ),
    enabled: Boolean(runId),
  })

  if (isLoading) return <Skeleton height={320} />

  if (isError || !data) {
    return (
      <EmptyState
        title="No se pudo cargar este run"
        action={
          <button type="button" className="jin-btn" onClick={() => refetch()}>
            Reintentar
          </button>
        }
      />
    )
  }

  const { run, tickets } = data
  const byStatus = COLUMN_ORDER.map((status) => ({
    status,
    tickets: tickets.filter((t) => t.status === status),
  }))
  const agents = new Set(tickets.map((t) => t.assignedSubAgentId).filter(Boolean))
  const openConflicts = tickets.filter(
    (t) =>
      t.comments.some((c) => c.kind === 'conflict') &&
      !t.comments.some((c) => c.kind === 'resolution'),
  )

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <header>
        <Link to="/orchestrator" className="jin-dim" style={{ fontSize: 13 }}>
          ← Board
        </Link>
        <h1 style={{ margin: '4px 0 0', fontSize: 20 }}>Objetivo: {run.objective}</h1>
        <p className="jin-muted mono" style={{ fontSize: 12, margin: '4px 0 0' }}>
          {agents.size} agentes · {tickets.length} tickets
          {openConflicts.length > 0 && (
            <span style={{ color: 'var(--risk-confirm)' }}>
              {' '}
              · {openConflicts.length} conflicto{openConflicts.length > 1 ? 's' : ''} sin resolver
            </span>
          )}
        </p>
      </header>

      {openConflicts.map((ticket) => {
        const conflictComments = ticket.comments.filter((c) => c.kind === 'conflict')
        return (
          <div key={ticket.id} className="jin-card jin-card--dual">
            <p className="mono jin-dim" style={{ fontSize: 11, margin: '0 0 8px' }}>
              CONFLICTO ENTRE AGENTES · ESCALADO AL HUMANO — {ticket.description}
            </p>
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              {conflictComments.map((comment) => (
                <p key={comment.id} style={{ margin: 0, fontSize: 14 }}>
                  <strong>{comment.authorId ?? comment.authorType}</strong>: {comment.body}
                </p>
              ))}
            </div>
            <Link to="/hitl" className="jin-btn jin-btn--accent">
              Revisar en Aprobaciones
            </Link>
          </div>
        )
      })}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {byStatus.map(({ status, tickets: columnTickets }) => (
          <div key={status}>
            <p className="jin-dim mono" style={{ fontSize: 11, margin: '0 0 8px' }}>
              {COLUMN_LABEL[status]} {columnTickets.length}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {columnTickets.map((ticket) => (
                <div key={ticket.id} className="jin-card" style={{ padding: 'var(--space-3)' }}>
                  <p className="mono jin-dim" style={{ fontSize: 11, margin: '0 0 4px' }}>
                    {ticket.assignedSubAgentId ?? 'sin asignar'}
                  </p>
                  <p style={{ margin: 0, fontSize: 13 }}>{ticket.description}</p>
                  {ticket.comments.length > 0 && (
                    <p className="jin-dim mono" style={{ fontSize: 11, margin: '6px 0 0' }}>
                      {ticket.comments.length} comentario{ticket.comments.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
              {columnTickets.length === 0 && (
                <p className="jin-dim" style={{ fontSize: 12 }}>
                  —
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
