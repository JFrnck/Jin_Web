import { Link } from 'react-router'
import { formatRemaining, MODE_LABEL, useAutonomy, useNow } from './useAutonomy'

/**
 * Visible desde CUALQUIER pantalla mientras el HITL esté relajado (mismo
 * criterio que el KillSwitchBanner): un modo que autoejecuta acciones no es
 * un detalle de una pestaña, tiene que verse siempre. En modo supervisado
 * (el default) no muestra nada.
 */
export function AutonomyBanner() {
  const { data } = useAutonomy()
  const now = useNow()
  if (!data || data.mode === 'supervised') return null

  return (
    <div
      role="status"
      style={{
        background: 'var(--risk-confirm)',
        color: '#fff',
        padding: 'var(--space-2) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span>
        MODO {MODE_LABEL[data.mode].toUpperCase()} — el agente ejecuta sin pedir aprobación
        <span className="mono" style={{ fontWeight: 400, opacity: 0.9 }}>
          {' '}
          · vuelve solo a supervisado en {formatRemaining(data.expiresAt, now)}
        </span>
      </span>
      <Link
        to="/autonomy"
        style={{ color: '#fff', textDecoration: 'underline', fontSize: 13, whiteSpace: 'nowrap' }}
      >
        VER
      </Link>
    </div>
  )
}
