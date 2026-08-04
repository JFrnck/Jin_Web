import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, unwrap } from '~/lib/api-client'
import { EmptyState, Skeleton } from '~/components/EmptyState'

const TIPO_LABEL = {
  hecho: 'HECHO',
  preferencia: 'PREFERENCIA',
  leccion: 'LECCIÓN',
  episodio: 'EPISODIO',
} as const

export default function Memory() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['memory', 'recall', submitted],
    queryFn: async () =>
      unwrap(
        await api.POST('/api/memory/recall', {
          body: { query: submitted, k: 10 },
        }),
      ),
    enabled: submitted.length > 0,
  })

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 560 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Memoria</h1>
      <p className="jin-muted" style={{ margin: 0, fontSize: 14 }}>
        Búsqueda semántica — lo que el agente cree saber de vos, y de dónde lo sacó.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(query.trim())
        }}
        style={{ display: 'flex', gap: 'var(--space-2)' }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="cómo prefiero que me agenden las asesorías"
          style={{
            flex: 1,
            background: 'var(--sunken)',
            border: '1px solid var(--sunken)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: 'var(--space-3)',
          }}
        />
        <button type="submit" className="jin-btn jin-btn--primary">
          Buscar
        </button>
      </form>

      {isLoading || isFetching ? (
        <Skeleton height={160} />
      ) : isError ? (
        <EmptyState
          title="No se pudo buscar en memoria"
          action={
            <button type="button" className="jin-btn" onClick={() => refetch()}>
              Reintentar
            </button>
          }
        />
      ) : submitted && data && data.length === 0 ? (
        <EmptyState
          title="Nada parecido en memoria"
          detail={`Ningún recuerdo pasa el umbral de similitud para «${submitted}»`}
        />
      ) : (
        data && (
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {data.map((entry) => (
              <div key={entry.id} className="jin-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span className="mono jin-dim" style={{ fontSize: 12 }}>
                    {TIPO_LABEL[entry.tipo]}
                  </span>
                  {entry.distance !== undefined && (
                    <span className="mono jin-dim" style={{ fontSize: 12 }}>
                      {entry.distance.toFixed(2)}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0 }}>«{entry.content}»</p>
                <p className="jin-dim mono" style={{ fontSize: 11, margin: '8px 0 0' }}>
                  {entry.fuente} · {entry.fecha}
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  )
}
