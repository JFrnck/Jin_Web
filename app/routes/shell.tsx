import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ConnectionBadge } from '~/components/ConnectionBadge'
import { NavIcon } from '~/components/NavIcons'
import { NavItem } from '~/components/NavItem'
import { NavSheet } from '~/components/NavSheet'
import { AutonomyBanner } from '~/features/autonomy/AutonomyBanner'
import { KillSwitchBanner } from '~/features/budget/KillSwitchBanner'
import { useApprovals } from '~/features/hitl/useApprovals'
import { DESKTOP_EXTRA_NAV, PRIMARY_NAV } from '~/lib/nav-items'

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        // `height` fija + `overflow: hidden` a propósito, no `minHeight`
        // (lo que había antes): con minHeight, cualquier pantalla con más
        // contenido que el viewport hacía crecer la columna ENTERA más
        // allá de 100dvh, y todo el documento scrolleaba junto -- inclusive
        // el nav de abajo, que se iba con el resto. `position: fixed` en el
        // nav (primer intento) se ve bien en Chromium pero es un bug
        // conocido de iOS Safari/WebKit: un `position: fixed` dentro de un
        // documento que scrollea como un todo puede quedar mal ubicado tras
        // el scroll con inercia, sobre todo en PWA standalone -- confirmado
        // en un iPhone 16 Pro Max real, no reproducible en el navegador de
        // escritorio usado para probar el primer intento. Este patrón
        // (contenedor exacto, sin scroll propio; solo `main` scrollea
        // adentro) evita la clase entera de bugs: nada queda "fijo" porque
        // nada necesita estarlo.
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
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

        {/* Único elemento que scrollea de verdad -- header, sidebar y el
            nav móvil de abajo quedan pinneados porque el contenedor raíz
            (arriba) no tiene scroll propio. `-webkit-overflow-scrolling`
            es lo que le da inercia nativa al scroll interno en iOS. */}
        <main
          className="jin-main"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
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
