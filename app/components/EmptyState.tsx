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
    <div className="jin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</p>
      {detail && (
        <p className="jin-muted" style={{ marginTop: 8 }}>
          {detail}
        </p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function Skeleton({ height = 64 }: { height?: number }) {
  return <div className="jin-skeleton" style={{ height, width: '100%' }} />
}
