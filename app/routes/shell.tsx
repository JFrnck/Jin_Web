import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ConnectionBadge } from '~/components/ConnectionBadge'
import { NavIcon } from '~/components/NavIcons'
import { NavItem } from '~/components/NavItem'
import { NavSheet } from '~/components/NavSheet'
import { AutonomyBanner } from '~/features/autonomy/AutonomyBanner'
import { KillSwitchBanner } from '~/features/budget/KillSwitchBanner'
import { useApprovals } from '~/features/hitl/useApprovals'

// Los 4 fijos del nav (más "Más" abajo) y los 6 del sidebar de escritorio +
// los 5 de la hoja móvil comparten esta única fuente: agregar una sección
// nueva no debe requerir tocar tres listas por separado.
const PRIMARY_NAV = [
  { to: '/', label: 'Overview', end: true, icon: 'overview', badged: false },
  { to: '/hitl', label: 'Aprobar', end: false, icon: 'approve', badged: true },
  { to: '/chat', label: 'Chat', end: false, icon: 'chat', badged: false },
  { to: '/budget', label: 'Gasto', end: false, icon: 'budget', badged: false },
] as const

const DESKTOP_EXTRA_NAV = [
  { to: '/autonomy', label: 'Autonomía', end: false, icon: 'autonomy' },
  { to: '/audit', label: 'Audit', end: false, icon: 'audit' },
  { to: '/orchestrator', label: 'Board', end: false, icon: 'board' },
  { to: '/preview', label: 'Apps', end: false, icon: 'apps' },
  { to: '/memory', label: 'Memoria', end: false, icon: 'memory' },
  { to: '/editor', label: 'Editor', end: false, icon: 'editor' },
] as const

export default function Shell() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const approvals = useApprovals()
  const pendingCount = approvals.data?.length ?? 0
  const location = useLocation()
  // Si la pantalla actual es una de las que vive en la hoja "Más" (o
  // Editor), ningún ítem fijo se marca activo — así que "Más" toma ese
  // lugar. Sin esto, estar en /audit deja el nav entero sin nada
  // resaltado, que es el mismo bug de "no sé dónde estoy" que el rediseño
  // vino a corregir.
  const onSecondaryScreen = [...DESKTOP_EXTRA_NAV].some((item) =>
    location.pathname.startsWith(item.to),
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <KillSwitchBanner />
      <AutonomyBanner />

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--glass-2)',
          backdropFilter: 'blur(28px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <span
          className="mono"
          style={{ fontWeight: 600, letterSpacing: '0.04em', color: '#FBF3F0' }}
        >
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
            borderRight: '1px solid var(--hairline)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
          className="jin-nav-desktop"
        >
          {PRIMARY_NAV.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.end}
              label={item.label}
              icon={item.icon}
              variant="desktop"
              badge={item.badged ? pendingCount : undefined}
            />
          ))}
          <div
            style={{
              height: 1,
              background: 'var(--hairline)',
              margin: 'var(--space-2) 0',
            }}
          />
          {DESKTOP_EXTRA_NAV.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.end}
              label={item.label}
              icon={item.icon}
              variant="desktop"
            />
          ))}
        </nav>

        <main style={{ flex: 1, minWidth: 0, padding: 'var(--space-4)' }}>
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Navegación principal (móvil)"
        className="jin-nav-mobile jin-nav-mobile-bar"
        style={{ display: 'none' }}
      >
        {PRIMARY_NAV.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            end={item.end}
            label={item.label}
            icon={item.icon}
            variant="mobile"
            badge={item.badged ? pendingCount : undefined}
          />
        ))}
        <button
          ref={moreButtonRef}
          type="button"
          className="jin-nav-item"
          aria-expanded={sheetOpen}
          aria-haspopup="dialog"
          aria-current={onSecondaryScreen ? 'page' : undefined}
          onClick={() => setSheetOpen((v) => !v)}
        >
          <NavIcon icon="more" active={onSecondaryScreen} />
          <span className="jin-nav-item-label">Más</span>
        </button>
      </nav>

      <NavSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        triggerRef={moreButtonRef}
      />
    </div>
  )
}
