import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, unwrap } from '~/lib/api-client'
import { EmptyState, Skeleton } from '~/components/EmptyState'

function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'expirando'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${h} h ${m} m`
}

export default function Preview() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['preview-services'],
    queryFn: async () => unwrap(await api.GET('/api/preview-services')),
    refetchInterval: 30_000,
  })

  async function stop(id: string) {
    await api.DELETE('/api/preview-services/{serviceId}', {
      params: { path: { serviceId: id } },
    })
    await queryClient.invalidateQueries({ queryKey: ['preview-services'] })
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 640 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 20 }}>Apps corriendo</h1>
        <p className="jin-muted" style={{ fontSize: 13, margin: '4px 0 0' }}>
          dominio ajeno a la sesión · sufijo aleatorio · máx. 24 h
        </p>
      </header>

      {isLoading && <Skeleton height={120} />}

      {isError && (
        <EmptyState
          title="No se pudo cargar la lista"
          action={
            <button type="button" className="jin-btn" onClick={() => refetch()}>
              Reintentar
            </button>
          }
        />
      )}

      {data && data.length === 0 && (
        <EmptyState
          title="Ninguna app corriendo"
          detail="Nada expuesto en jinserver.com ahora mismo. Levantar una es una acción confirm."
        />
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <div
            className="jin-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'color-mix(in srgb, var(--risk-confirm) 15%, var(--surface))',
              fontSize: 13,
            }}
          >
            ⚠ GENERADO POR IA · AISLADO · NO CONFIABLE
          </div>
          {data.map((service) => (
            <div
              key={service.id}
              className="jin-card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <a href={service.url} target="_blank" rel="noreferrer noopener" className="mono">
                  {service.slug}.jinserver.com
                </a>
                <p className="jin-muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                  {service.status === 'running'
                    ? `vive ${timeLeft(service.expiresAt)} más`
                    : 'expirada'}
                </p>
              </div>
              <button type="button" className="jin-btn jin-btn--danger" onClick={() => stop(service.id)}>
                Detener
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
