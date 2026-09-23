import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router'
import { DESKTOP_EXTRA_NAV, DESKTOP_ONLY_PATH } from '~/lib/nav-items'
import { NavIcon } from './NavIcons'

/**
 * Hoja "Más" del nav móvil (diseño v4 §05): los destinos que no caben en
 * la barra fija, en grid de 2 columnas sin scroll. Lee de
 * `DESKTOP_EXTRA_NAV` (`~/lib/nav-items`) — antes tenía su propia copia a
 * mano (`SHEET_ITEMS`) que se desincronizó apenas se agregó una sección
 * nueva ahí sin tocar acá. Editor (`DESKTOP_ONLY_PATH`) es el único caso
 * especial: queda visible pero deshabilitado en móvil, Monaco no es usable
 * en pantalla táctil, no es solo una decisión estética.
 *
 * Sin librería de modales nueva: son links estáticos, así que el patrón se
 * resuelve a mano — backdrop-click y Escape cierran, el foco entra al
 * primer link al abrir y vuelve al botón "Más" al cerrar.
 */

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
          {DESKTOP_EXTRA_NAV.map((item, index) =>
            item.to === DESKTOP_ONLY_PATH ? (
              <span
                key={item.to}
                className="jin-nav-sheet-item"
                aria-disabled="true"
                role="link"
                aria-label={`${item.label}, solo disponible en escritorio`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
                <span className="jin-nav-sheet-item-sub">SOLO ESCRITORIO</span>
              </span>
            ) : (
              <NavLink
                key={item.to}
                ref={index === 0 ? firstItemRef : undefined}
                to={item.to}
                onClick={onClose}
                className="jin-nav-sheet-item"
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </NavLink>
            ),
          )}
        </div>
      </div>
    </>
  )
}
