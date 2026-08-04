import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { api, unwrap } from '~/lib/api-client'
import { EmptyState, Skeleton } from '~/components/EmptyState'

export default function Orchestrator() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orchestrator', 'runs'],
    queryFn: async () =>
      unwrap(
        await api.GET('/api/orchestrator/runs', {
          params: { query: { limit: 20 } },
        }),
      ),
  })

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 640 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Board de orquestación</h1>

      {isLoading && <Skeleton height={200} />}

      {isError && (
        <EmptyState
          title="No se pudo cargar el board"
          action={
            <button type="button" className="jin-btn" onClick={() => refetch()}>
              Reintentar
            </button>
          }
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          title="Ningún objetivo en marcha"
          detail="El board aparece cuando el orquestador parte un objetivo en tickets. Los objetivos se piden en el chat, no acá."
          action={
            <Link to="/chat" className="jin-btn jin-btn--primary">
              Ir al chat
            </Link>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {data.items.map((run) => (
            <Link
              key={run.id}
              to={`/orchestrator/${run.id}`}
              className="jin-card"
              style={{ display: 'block', color: 'inherit' }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{run.objective}</p>
              <p className="jin-dim mono" style={{ fontSize: 12, margin: '4px 0 0' }}>
                {run.status} · {new Date(run.createdAt).toLocaleString('es-PE')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
