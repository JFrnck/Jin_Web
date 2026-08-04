import { Link } from 'react-router'
import { useBudgetStatus } from './useBudgetStatus'

/**
 * Visible desde CUALQUIER pantalla (diseño v3 §4.5) — es una condición
 * de emergencia, no un detalle del panel de presupuesto.
 */
export function KillSwitchBanner() {
  const { data } = useBudgetStatus()
  if (!data?.killSwitchActive) return null

  return (
    <div
      role="alert"
      style={{
        background: 'var(--risk-dual)',
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
        KILL SWITCH ACTIVO — agentes congelados
        {data.killSwitch.currentHourTokens > 0 && (
          <span className="mono" style={{ fontWeight: 400, opacity: 0.85 }}>
            {' '}
            · consumo{' '}
            {(data.killSwitch.currentHourTokens / Math.max(1, data.killSwitch.avgHourlyTokens)).toFixed(1)}
            × lo normal
          </span>
        )}
      </span>
      <Link
        to="/budget"
        style={{
          color: '#fff',
          textDecoration: 'underline',
          fontSize: 13,
          whiteSpace: 'nowrap',
        }}
      >
        VER
      </Link>
    </div>
  )
}
