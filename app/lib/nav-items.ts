import type { NavIconKey } from '~/components/NavIcons'

/**
 * Única fuente de las secciones del nav: `shell.tsx` (sidebar de escritorio
 * + barra fija móvil) y `NavSheet.tsx` (hoja "Más" móvil) leen de acá.
 *
 * Antes NavSheet tenía su propia lista (`SHEET_ITEMS`) copiada a mano —
 * agregar una sección nueva a `DESKTOP_EXTRA_NAV` no la hacía aparecer en
 * "Más" pese a que el comentario de acá ya prometía "una única fuente".
 * Bug real, encontrado al agregar "Claude Code": pasaba el build/lint, solo
 * se notaba tocando la hoja en un teléfono de verdad.
 */

interface NavEntry {
  readonly to: string
  readonly label: string
  readonly end: boolean
  readonly icon: NavIconKey
}

export const PRIMARY_NAV: readonly (NavEntry & { readonly badged: boolean })[] = [
  { to: '/', label: 'Overview', end: true, icon: 'overview', badged: false },
  { to: '/hitl', label: 'Aprobar', end: false, icon: 'approve', badged: true },
  { to: '/chat', label: 'Chat', end: false, icon: 'chat', badged: false },
  { to: '/budget', label: 'Gasto', end: false, icon: 'budget', badged: false },
]

export const DESKTOP_EXTRA_NAV: readonly NavEntry[] = [
  { to: '/autonomy', label: 'Autonomía', end: false, icon: 'autonomy' },
  { to: '/audit', label: 'Audit', end: false, icon: 'audit' },
  { to: '/orchestrator', label: 'Board', end: false, icon: 'board' },
  { to: '/preview', label: 'Apps', end: false, icon: 'apps' },
  { to: '/memory', label: 'Memoria', end: false, icon: 'memory' },
  // Monaco no es usable en pantalla táctil -- NavSheet lo pinta deshabilitado
  // en vez de excluirlo (el owner tiene que ver que existe, no solo que
  // desapareció).
  { to: '/editor', label: 'Editor', end: false, icon: 'editor' },
  // Puente Claude Code ↔ owner (ADR 0012) — distinto de "Chat" (que habla
  // con el agente de Jin): acá del otro lado hay una sesión de Claude Code
  // corriendo en la VM, sin HITL ni ejecución de acciones, solo mensajería.
  { to: '/bridge', label: 'Claude Code', end: false, icon: 'bridge' },
]

/** Único ítem de `DESKTOP_EXTRA_NAV` sin uso táctil real (Monaco). */
export const DESKTOP_ONLY_PATH = '/editor'
