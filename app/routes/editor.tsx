import { useCallback, useRef, useState } from 'react'
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react'
import type * as MonacoNs from 'monaco-editor'
import { useAiCommentZoneWidgets, type AiComment } from '~/features/editor/AiCommentWidget'
import { api, getErrorMessage, unwrap } from '~/lib/api-client'
import { Button } from '~/components/Button'

const DEFAULT_CODE = `export function parseCsv(raw: string) {
  const rows = raw.split('\\n');
  const head = rows[0].split(',');
  return rows.slice(1).map(r => zip(head, r.split(',')));
}
`

// Formato pedido al modelo para poder anclar cada comentario a una línea
// real sin un endpoint dedicado (Jin_Core no tiene hoy una tool de
// "comentar código línea por línea" — ver nota en STATUS.md). Puente
// honesto sobre /api/chat, no una feature con contrato propio todavía.
const LINE_COMMENT_RE = /^L(\d+):\s*(.+)$/gm

function parseLineComments(text: string): AiComment[] {
  const comments: AiComment[] = []
  for (const match of text.matchAll(LINE_COMMENT_RE)) {
    const line = Number(match[1])
    const body = match[2]?.trim()
    if (Number.isFinite(line) && body) comments.push({ line, text: body })
  }
  return comments
}

export default function EditorPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [comments, setComments] = useState<AiComment[]>([])
  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const editorRef = useRef<MonacoNs.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  const handleAccept = useCallback((comment: AiComment) => {
    setComments((prev) => prev.filter((c) => c !== comment))
  }, [])
  const handleDiscard = useCallback((comment: AiComment) => {
    setComments((prev) => prev.filter((c) => c !== comment))
  }, [])

  useAiCommentZoneWidgets(
    editorRef.current,
    monacoRef.current,
    comments,
    handleAccept,
    handleDiscard,
  )

  async function requestComments() {
    setLoading(true)
    setComments([])
    setRequestError(null)
    try {
      const numbered = code
        .split('\n')
        .map((line, i) => `L${i + 1}: ${line}`)
        .join('\n')
      const data = unwrap(
        await api.POST('/api/chat', {
          body: {
            sessionId: `editor-${Date.now()}`,
            objective:
              'Actuás como revisor de código. Te paso un archivo con cada línea ' +
              'numerada como "Lx: <código>". Respondé SOLO con líneas en el ' +
              'formato "Lx: <comentario>" (una por observación real, máximo 4), ' +
              'sin texto adicional. Archivo:\n\n' +
              numbered,
          },
        }),
      )
      setComments(parseLineComments(data.finalResponse))
    } catch (err) {
      // docs/RECOMENDACIONES.md #17: sin catch, un fallo de /api/chat acá
      // (ej. kill switch activo, presupuesto agotado) quedaba mudo — el
      // botón volvía a "Comentarios de la IA" sin ninguna explicación.
      setRequestError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)', height: '100%' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 20 }} className="mono">
          parser.ts
        </h1>
        <Button variant="primary" onClick={requestComments} disabled={loading}>
          {loading ? 'Pensando…' : 'Comentarios de la IA'}
        </Button>
      </header>

      {requestError && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--risk-confirm)' }}>
          ⚠ No se pudieron pedir comentarios: {requestError}
        </p>
      )}

      <div
        className="jin-card"
        style={{ padding: 0, overflow: 'hidden', height: 480, minHeight: 320 }}
      >
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          onMount={handleMount}
          options={{
            fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
            fontSize: 13,
            minimap: { enabled: false },
          }}
        />
      </div>

      <p className="jin-dim" style={{ fontSize: 11, margin: 0 }}>
        los comentarios se piden vía /api/chat con un formato línea-a-línea —
        Jin_Core todavía no tiene una tool dedicada para esto (ver STATUS.md)
      </p>
    </section>
  )
}
