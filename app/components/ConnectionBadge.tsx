import { useConnectionStatus } from '~/lib/use-connection-status'

const LABEL = {
  live: 'EN VIVO',
  reconnecting: 'RECONECTANDO',
  stale: 'SIN TIEMPO REAL',
  offline: 'SIN CONEXIÓN',
} as const

export function ConnectionBadge() {
  const { status } = useConnectionStatus()
  return (
    <span className="jin-connection" data-status={status}>
      ● {LABEL[status]}
    </span>
  )
}
