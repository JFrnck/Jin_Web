import { NavLink, Outlet } from 'react-router'
import { ConnectionBadge } from '~/components/ConnectionBadge'
import { KillSwitchBanner } from '~/features/budget/KillSwitchBanner'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/hitl', label: 'Aprobar', end: false },
  { to: '/chat', label: 'Chat', end: false },
  { to: '/budget', label: 'Gasto', end: false },
  { to: '/audit', label: 'Audit', end: false },
  { to: '/orchestrator', label: 'Board', end: false },
  { to: '/editor', label: 'Editor', end: false },
  { to: '/preview', label: 'Apps', end: false },
  { to: '/memory', label: 'Memoria', end: false },
]

export default function Shell() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <KillSwitchBanner />

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--sunken)',
        }}
      >
        <span className="mono" style={{ fontWeight: 700 }}>
          JIN
        </span>
        <ConnectionBadge />
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <nav
          aria-label="Navegación principal"
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid var(--sunken)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
          className="jin-nav-desktop"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text)' : 'var(--muted)',
                background: isActive ? 'var(--surface)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main style={{ flex: 1, minWidth: 0, padding: 'var(--space-4)' }}>
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Navegación principal (móvil)"
        className="jin-nav-mobile"
        style={{
          display: 'none',
          borderTop: '1px solid var(--sunken)',
          padding: 'var(--space-2) var(--space-2)',
          paddingBottom: 'calc(var(--space-2) + env(safe-area-inset-bottom))',
          justifyContent: 'space-around',
        }}
      >
        {[
          { to: '/', label: 'Overview', end: true },
          { to: '/hitl', label: 'Aprobar', end: false },
          { to: '/chat', label: 'Chat', end: false },
          { to: '/budget', label: 'Gasto', end: false },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              fontSize: 12,
              color: isActive ? 'var(--text)' : 'var(--muted)',
              padding: 'var(--space-1) var(--space-2)',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
