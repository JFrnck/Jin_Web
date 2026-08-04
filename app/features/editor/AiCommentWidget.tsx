import { useEffect, useRef } from 'react'
import type * as Monaco from 'monaco-editor'

export interface AiComment {
  readonly line: number
  readonly text: string
}

/**
 * Zone Widget real de Monaco (BLUEPRINT §8.1) — reserva espacio vertical
 * DEBAJO de la línea comentada (a diferencia de un tooltip, que tapa
 * código) e inserta un `<div>` React-controlado ahí mismo vía
 * `changeViewZones` + `overlayWidgets` combinados: la view zone reserva
 * el hueco, el overlay widget posiciona el contenido real encima.
 */
export function useAiCommentZoneWidgets(
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  monaco: typeof Monaco | null,
  comments: readonly AiComment[],
  onAccept: (comment: AiComment) => void,
  onDiscard: (comment: AiComment) => void,
) {
  const zoneIdsRef = useRef<string[]>([])
  const domNodesRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!editor || !monaco) return

    function render() {
      editor!.changeViewZones((accessor) => {
        for (const id of zoneIdsRef.current) accessor.removeZone(id)
        zoneIdsRef.current = []
        domNodesRef.current = []

        for (const comment of comments) {
          const domNode = document.createElement('div')
          domNode.className = 'jin-ai-comment'
          domNode.innerHTML = `
            <p class="jin-ai-comment-label">COMENTARIO DE IA</p>
            <p class="jin-ai-comment-body"></p>
            <div class="jin-ai-comment-actions">
              <button data-action="discard">Descartar</button>
              <button data-action="accept">Aceptar</button>
            </div>
          `
          domNode.querySelector('.jin-ai-comment-body')!.textContent = comment.text
          domNode
            .querySelector('[data-action="accept"]')!
            .addEventListener('click', () => onAccept(comment))
          domNode
            .querySelector('[data-action="discard"]')!
            .addEventListener('click', () => onDiscard(comment))

          const zoneId = accessor.addZone({
            afterLineNumber: comment.line,
            heightInPx: 92,
            domNode,
          })
          zoneIdsRef.current.push(zoneId)
          domNodesRef.current.push(domNode)
        }
      })
    }

    render()

    return () => {
      editor.changeViewZones((accessor) => {
        for (const id of zoneIdsRef.current) accessor.removeZone(id)
      })
      zoneIdsRef.current = []
    }
  }, [editor, monaco, comments, onAccept, onDiscard])
}
