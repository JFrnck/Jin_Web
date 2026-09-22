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
    // La forma del indicador (punto lleno / anillo / guion / rombo) la
    // dibuja `.jin-connection::before` en app.css — cada estado tiene
    // forma propia además de color, para no depender solo de discriminar
    // el color (diseño v4, primitivo 05).
    <span className="jin-connection" data-status={status}>
      {LABEL[status]}
    </span>
  )
}
