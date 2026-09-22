import { Link } from 'react-router'
import type { components } from '~/lib/api-types'

type PendingApproval = components['schemas']['PendingApprovalDto']

function nearestExpiryLabel(approvals: PendingApproval[]): string | null {
  const deadlines = approvals
    .map((a) => a.escalatedAt)
    .filter((iso): iso is string => iso !== null)
    .map((iso) => new Date(iso).getTime())
    .filter((ms) => ms > Date.now())

  if (deadlines.length === 0) return null
  const soonestMs = Math.min(...deadlines) - Date.now()
  const m = Math.round(soonestMs / 60_000)
  return m <= 1 ? 'la más urgente caduca en menos de 1 m' : `la más urgente caduca en ${m} m`
}

function levelSummary(approvals: PendingApproval[]): string {
  const dual = approvals.filter((a) => a.level === 'dual-confirm').length
  const rest = approvals.length - dual
  const parts: string[] = []
  if (dual > 0) parts.push(`${dual} dual-confirm`)
  if (rest > 0) parts.push(`${rest} confirm`)
  return parts.join(' · ')
}

/**
 * "¿Necesitan algo de mí?" en menos de un segundo (diseño v4 §7.2).
 *
 * Dos ramas deliberadamente distintas, no una sola tarjeta con un número
 * en cero: con pendientes es la única superficie de nivel 3 (cristal
 * crítico) del Overview; sin pendientes pierde el tinte rojo, el número
 * grande y el CTA, y baja a nivel 1 — cede el protagonismo al resto de
 * tarjetas en vez de fingir urgencia con un "0".
 */
export function PendingHero({ approvals }: { approvals: PendingApproval[] }) {
  const count = approvals.length

  if (count === 0) {
    return (
      <div className="jin-hero jin-hero--empty">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            className="mono"
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--dimmer)' }}
          >
            ESPERANDO TU DECISIÓN
          </span>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--muted)' }}>
            Nada esperando por ti
          </span>
        </div>
      </div>
    )
  }

  const expiry = nearestExpiryLabel(approvals)

  return (
    <div className="jin-hero" role="status">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          className="mono"
          style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: '#FFC9BB' }}
        >
          ESPERANDO TU DECISIÓN
        </span>
        <span
          style={{
            fontSize: 64,
            lineHeight: 1,
            fontWeight: 600,
            letterSpacing: '-0.04em',
            color: '#FBF3F0',
          }}
        >
          {count}
        </span>
      </div>
      <div style={{ flex: '1 1 180px', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 13.5, color: '#D6C3BD' }}>{levelSummary(approvals)}</span>
        {expiry && (
          <span className="mono jin-amber" style={{ fontSize: 12.5 }}>
            {expiry}
          </span>
        )}
      </div>
      <Link to="/hitl" className="jin-btn jin-btn--accent" style={{ flexShrink: 0 }}>
        Ir a la bandeja →
      </Link>
    </div>
  )
}
