import type { ReactNode } from 'react'

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string
  detail?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="jin-empty">
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          border: '1px solid var(--hairline-strong)',
        }}
      />
      <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--muted)' }}>
        {title}
      </p>
      {detail && (
        <p className="jin-dim" style={{ margin: 0, fontSize: 13 }}>
          {detail}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

export function Skeleton({ height = 64 }: { height?: number }) {
  return <div className="jin-skeleton" style={{ height, width: '100%' }} />
}
