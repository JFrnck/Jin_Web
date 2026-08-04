import { useState } from 'react'
import { useAuditLog } from '~/features/audit/useAuditLog'
import { EmptyState, Skeleton } from '~/components/EmptyState'

export default function Audit() {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [history, setHistory] = useState<string[]>([])
  const { data, isLoading, isError, refetch } = useAuditLog({
    limit: 50,
    ...(cursor !== undefined ? { cursor } : {}),
  })

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 20 }}>Audit log</h1>
        <p className="jin-muted mono" style={{ margin: '4px 0 0', fontSize: 12 }}>
          cadena inmutable, más reciente primero
        </p>
      </header>

      {isLoading && <Skeleton height={320} />}

      {isError && (
        <EmptyState
          title="No se pudo cargar el audit log"
          action={
            <button type="button" className="jin-btn" onClick={() => refetch()}>
              Reintentar
            </button>
          }
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState title="Sin eventos en este rango" />
      )}

      {data && data.items.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="mono" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                <th style={{ padding: '6px 8px' }}>momento</th>
                <th style={{ padding: '6px 8px' }}>nivel</th>
                <th style={{ padding: '6px 8px' }}>herramienta</th>
                <th style={{ padding: '6px 8px' }}>actor</th>
                <th style={{ padding: '6px 8px' }}>estado</th>
                <th style={{ padding: '6px 8px' }}>hash</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((entry) => (
                <tr key={entry.id} style={{ borderTop: '1px solid var(--sunken)' }}>
                  <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                    {new Date(entry.timestamp).toLocaleTimeString('es-PE')}
                  </td>
                  <td style={{ padding: '6px 8px' }}>{entry.actionType}</td>
                  <td style={{ padding: '6px 8px' }}>{entry.toolName ?? '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{entry.actor}</td>
                  <td style={{ padding: '6px 8px' }}>{entry.approvalStatus}</td>
                  <td style={{ padding: '6px 8px', color: 'var(--dim)' }}>
                    {entry.currentHash.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-3)' }}>
            {history.length > 0 && (
              <button
                type="button"
                className="jin-btn"
                onClick={() => {
                  const prev = [...history]
                  const last = prev.pop()
                  setHistory(prev)
                  setCursor(last)
                }}
              >
                ← Anterior
              </button>
            )}
            {data.nextCursor && (
              <button
                type="button"
                className="jin-btn"
                onClick={() => {
                  setHistory((h) => [...h, cursor ?? ''])
                  setCursor(data.nextCursor!)
                }}
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
