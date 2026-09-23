import { useState } from 'react'
import { useBridgeMessages, useBridgeReply } from '~/features/bridge/useBridge'
import { Button } from '~/components/Button'
import { getErrorMessage } from '~/lib/api-client'

export default function Bridge() {
  const { data, isLoading, isError, error } = useBridgeMessages()
  const { reply } = useBridgeReply()
  const [input, setInput] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; body: string } | null>(
    null,
  )
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const messages = data?.messages ?? []

  async function send(body: string, answerTo?: string) {
    if (!body.trim() || sending) return
    setSending(true)
    setSendError(null)
    try {
      await reply(body, answerTo)
      setInput('')
      setReplyingTo(null)
    } catch (err) {
      setSendError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    void send(input, replyingTo?.id)
  }

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        maxWidth: 640,
        height: '100%',
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 20 }}>Claude Code</h1>
        <p className="jin-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
          Puente con la sesión de Claude Code de la VM — mensajería pura, sin
          HITL ni ejecución de acciones. También llega por Telegram.
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: 'var(--space-3)' }}>
        {isLoading && (
          <p className="jin-dim mono" style={{ fontSize: 12 }}>
            cargando…
          </p>
        )}
        {isError && (
          <div className="jin-callout-danger">{getErrorMessage(error)}</div>
        )}
        {!isLoading && messages.length === 0 && (
          <div className="jin-card">
            <p style={{ margin: 0 }}>Sin mensajes todavía.</p>
            <p className="jin-muted" style={{ margin: '8px 0 0', fontSize: 14 }}>
              Acá van a aparecer los mensajes que Claude Code te mande desde
              la VM, y podés responder directo sin salir del dashboard.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isClaude = message.direction === 'out'
          const alreadyAnswered =
            isClaude &&
            messages.some(
              (m) => m.direction === 'in' && m.answerTo === message.id,
            )
          return (
            <div
              key={message.id}
              style={{
                display: 'grid',
                gap: 6,
                justifyItems: isClaude ? 'start' : 'end',
              }}
            >
              <div
                className={isClaude ? 'jin-card jin-bridge-msg' : 'jin-card--sunken jin-bridge-msg'}
                style={{ maxWidth: '90%' }}
              >
                {/* bodyHtml viene sanitizado server-side (markdownToTelegramHtml,
                    relay.service.ts) -- mismo subconjunto cerrado de tags que ya
                    usa Telegram, seguro para inyectar tal cual. */}
                <div dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />

                {isClaude && message.options && message.options.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {message.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className="jin-btn"
                        disabled={sending || alreadyAnswered}
                        onClick={() => void send(option, message.id)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="jin-dim mono" style={{ fontSize: 11 }}>
                  {new Date(message.createdAt).toLocaleString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
                {isClaude && !alreadyAnswered && (
                  <button
                    type="button"
                    className="jin-dim mono"
                    style={{
                      fontSize: 11,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                    onClick={() => setReplyingTo({ id: message.id, body: message.body })}
                  >
                    Responder
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {replyingTo && (
        <div
          className="jin-card--sunken"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-2) var(--space-3)',
          }}
        >
          <span className="jin-muted" style={{ fontSize: 12 }}>
            Respondiendo: {replyingTo.body.slice(0, 80)}
            {replyingTo.body.length > 80 ? '…' : ''}
          </span>
          <button
            type="button"
            className="jin-dim"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
            onClick={() => setReplyingTo(null)}
            aria-label="Cancelar respuesta"
          >
            ×
          </button>
        </div>
      )}

      {sendError && <div className="jin-callout-danger">{sendError}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribí un mensaje…"
          style={{
            flex: 1,
            background: 'rgba(0,0,0,.32)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: 'var(--space-3)',
          }}
        />
        <Button variant="primary" type="submit" disabled={sending}>
          {sending ? '…' : 'Enviar'}
        </Button>
      </form>
    </section>
  )
}
