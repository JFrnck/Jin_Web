import type { ReactElement, ReactNode } from 'react'

/**
 * Set de iconos de la navegación — dibujados a mano, sin librería nueva.
 * El mock de Claude Design (`JinNavItem.dc.html`) usaba cuadrados y
 * círculos como PLACEHOLDER a propósito (nunca fue el icono final); acá
 * están los glifos reales.
 *
 * Un solo trazo por icono (stroke, `currentColor`), sin relleno salvo el
 * punto del toggle y los puntos de "Más" — así heredan color y opacidad
 * del texto circundante sin lógica aparte. El único cambio entre reposo y
 * activo es el grosor del trazo (ver `strokeWidth` más abajo); el color y
 * el fondo de la píldora ya los resuelve `.jin-nav-item` en app.css.
 */

export type NavIconKey =
  | 'overview'
  | 'approve'
  | 'chat'
  | 'budget'
  | 'autonomy'
  | 'audit'
  | 'board'
  | 'apps'
  | 'memory'
  | 'editor'
  | 'more'

function Svg({
  active,
  children,
}: {
  active: boolean
  children: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const ICONS: Record<NavIconKey, (props: { active: boolean }) => ReactElement> = {
  overview: ({ active }) => (
    <Svg active={active}>
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5" />
      <path d="M8 17v-4h4v4" />
    </Svg>
  ),
  approve: ({ active }) => (
    <Svg active={active}>
      <circle cx="10" cy="10" r="7" />
      <path d="M7 10.2 9 12.2 13.2 7.6" />
    </Svg>
  ),
  chat: ({ active }) => (
    <Svg active={active}>
      <path d="M3 5.8A1.8 1.8 0 0 1 4.8 4h10.4A1.8 1.8 0 0 1 17 5.8v5.4a1.8 1.8 0 0 1-1.8 1.8H9l-3.6 3v-3H4.8A1.8 1.8 0 0 1 3 11.2Z" />
    </Svg>
  ),
  budget: ({ active }) => (
    <Svg active={active}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v8" />
      <path d="M12.3 8.1c0-.9-1-1.6-2.3-1.6s-2.3.7-2.3 1.5c0 2 4.6.9 4.6 2.9 0 .9-1 1.6-2.3 1.6s-2.3-.7-2.3-1.6" />
    </Svg>
  ),
  autonomy: ({ active }) => (
    <Svg active={active}>
      <rect x="2.5" y="6.5" width="15" height="7" rx="3.5" />
      <circle cx="13" cy="10" r="2" fill="currentColor" stroke="none" />
    </Svg>
  ),
  audit: ({ active }) => (
    <Svg active={active}>
      <rect x="4" y="2.5" width="12" height="15" rx="1.5" />
      <path d="M7 7h6M7 10.2h6M7 13.4h3.5" />
    </Svg>
  ),
  board: ({ active }) => (
    <Svg active={active}>
      <rect x="2.5" y="3" width="15" height="14" rx="1.5" />
      <path d="M8 3v14M13.3 3v14" />
    </Svg>
  ),
  apps: ({ active }) => (
    <Svg active={active}>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.3" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.3" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.3" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.3" />
    </Svg>
  ),
  memory: ({ active }) => (
    <Svg active={active}>
      <ellipse cx="10" cy="5.2" rx="6.5" ry="2.4" />
      <path d="M3.5 5.2V15c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4V5.2" />
      <path d="M3.5 10.1c0 1.3 2.9 2.4 6.5 2.4s6.5-1.1 6.5-2.4" />
    </Svg>
  ),
  editor: ({ active }) => (
    <Svg active={active}>
      <path d="M7 5 3 10l4 5" />
      <path d="M13 5l4 5-4 5" />
    </Svg>
  ),
  more: () => (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="4.5" cy="10" r="1.6" />
      <circle cx="10" cy="10" r="1.6" />
      <circle cx="15.5" cy="10" r="1.6" />
    </svg>
  ),
}

export function NavIcon({
  icon,
  active = false,
}: {
  icon: NavIconKey
  active?: boolean
}) {
  const Icon = ICONS[icon]
  return <Icon active={active} />
}
