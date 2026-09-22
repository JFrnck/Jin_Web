import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router'

/**
 * Hoja "Más" del nav móvil (diseño v4 §05): los 5 destinos que no caben en
 * la barra fija, en grid de 2 columnas sin scroll. Editor queda visible
 * pero deshabilitado en móvil — Monaco no es usable en pantalla táctil, no
 * es solo una decisión estética.
 *
 * Sin librería de modales nueva: son 6 links estáticos, así que el patrón
 * se resuelve a mano — backdrop-click y Escape cierran, el foco entra al
 * primer link al abrir y vuelve al botón "Más" al cerrar.
 */

const SHEET_ITEMS = [
  { to: '/autonomy', label: 'Autonomía', iconRadius: '3px' },
  { to: '/audit', label: 'Audit', iconRadius: '50%' },
  { to: '/orchestrator', label: 'Board', iconRadius: '3px' },
  { to: '/preview', label: 'Apps', iconRadius: '3px' },
  { to: '/memory', label: 'Memoria', iconRadius: '50%' },
] as const

export function NavSheet({
  open,
  onClose,
  triggerRef,
}: {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
  const firstItemRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return

    firstItemRef.current?.focus()
    // Copiado al setup, no leído en la cleanup: el botón "Más" es un nodo
    // estable (no cambia entre renders), pero leer `.current` recién en
    // cleanup apunta a lo que sea que sostenga el ref EN ESE MOMENTO, no
    // necesariamente al mismo botón que abrió esta hoja.
    const trigger = triggerRef.current

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // Vuelve el foco al botón "Más" que abrió la hoja — sin esto, un
      // usuario de teclado pierde el foco en el documento al cerrar.
      trigger?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="jin-nav-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="jin-nav-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Más secciones"
      >
        <div className="jin-nav-sheet-handle" aria-hidden="true" />
        <div className="jin-nav-sheet-grid">
          {SHEET_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              ref={index === 0 ? firstItemRef : undefined}
              to={item.to}
              onClick={onClose}
              className="jin-nav-sheet-item"
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: '1.5px solid currentColor',
                  borderRadius: item.iconRadius,
                }}
                aria-hidden="true"
              />
              {item.label}
            </NavLink>
          ))}
          <span
            className="jin-nav-sheet-item"
            aria-disabled="true"
            role="link"
            aria-label="Editor, solo disponible en escritorio"
          >
            <span
              style={{
                width: 14,
                height: 14,
                border: '1.5px solid currentColor',
                borderRadius: '3px',
              }}
              aria-hidden="true"
            />
            Editor
            <span className="jin-nav-sheet-item-sub">SOLO ESCRITORIO</span>
          </span>
        </div>
      </div>
    </>
  )
}
