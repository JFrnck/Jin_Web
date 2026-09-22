import { NavLink } from 'react-router'

/**
 * Puerto de `Jin/design/JinNavItem.dc.html` (diseño v4 §05) a React Router
 * real: en el mock el estado activo lo decidía una prop `active` comparada
 * a mano; acá lo decide `NavLink` contra la URL real, así que "activo" no
 * puede desincronizarse de la ruta.
 *
 * Dos layouts con el mismo componente (mismo estado, sin duplicar lógica):
 *  - `variant="mobile"`: la pastilla de 76×56 del nav inferior (icono +
 *    etiqueta apiladas).
 *  - `variant="desktop"`: la fila horizontal compacta del sidebar.
 */

export type NavItemVariant = 'mobile' | 'desktop'

export function NavItem({
  to,
  end = false,
  label,
  iconRadius,
  badge,
  variant,
  onClick,
}: {
  to: string
  end?: boolean
  label: string
  /** Forma del icono-placeholder: '50%' círculo, '2-4px' cuadrado redondeado. */
  iconRadius: string
  /** Contador de pendientes (p. ej. "Aprobar"). Ausente = sin badge. */
  badge?: number | undefined
  variant: NavItemVariant
  onClick?: () => void
}) {
  const itemClass =
    variant === 'mobile' ? 'jin-nav-item' : 'jin-nav-desktop-item'
  const badgeClass =
    variant === 'mobile' ? 'jin-nav-item-badge' : 'jin-nav-desktop-item-badge'

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={itemClass}
      aria-label={badge ? `${label}, ${badge} pendientes` : label}
    >
      <span
        className="jin-nav-item-icon"
        style={{ borderRadius: iconRadius }}
        aria-hidden="true"
      />
      {variant === 'mobile' ? (
        <span className="jin-nav-item-label">{label}</span>
      ) : (
        label
      )}
      {badge !== undefined && badge > 0 && (
        <span className={badgeClass}>{badge > 9 ? '9+' : badge}</span>
      )}
    </NavLink>
  )
}
