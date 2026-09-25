import { useState } from 'react'
import { useChat } from '~/features/chat/useChat'
import { PlanProgress } from '~/features/chat/PlanProgress'
import { LiveToolCalls } from '~/features/chat/LiveToolCalls'
import { Button } from '~/components/Button'

const SUGGESTIONS = [
  'Revisa mi correo y arma mi agenda de mañana',
  'Qué entregas tengo esta semana',
]

export default function Chat() {
  const { turns, pending, send } = useChat()
  const [input, setInput] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const objective = input.trim()
    if (!objective || pending) return
    send(objective)
    setInput('')
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
      <h1 style={{ margin: 0, fontSize: 20 }}>Chat</h1>

      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: 'var(--space-3)' }}>
        {turns.length === 0 && (
          <div className="jin-card">
            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Pedí un objetivo, no una tarea</p>
            <p className="jin-muted" style={{ margin: '0 0 12px', fontSize: 14 }}>
              El orquestador arma el plan y te pasa a aprobar solo lo que tiene consecuencias.
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="jin-btn"
                  style={{ textAlign: 'left' }}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, index) => (
          <div key={index} style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <div className="jin-card--sunken">{turn.objective}</div>
            {turn.result ? (
              <>
                {turn.result.plan.steps.length > 0 && (
                  <PlanProgress steps={turn.result.plan.steps} />
                )}
                <div className="jin-card">{turn.result.finalResponse}</div>
              </>
            ) : (
              <>
                {/* Streaming en vivo mientras el turno corre — el texto
                    autoritativo sigue siendo `turn.result.finalResponse`
                    (arriba): el backend puede sustituirlo por un mensaje
                    de refusal/vacío (ver resolveFinalResponseText en
                    Jin_Core), así que este card se descarta al cerrar. */}
                {turn.progress.plan && turn.progress.plan.steps.length > 0 && (
                  <PlanProgress steps={turn.progress.plan.steps} />
                )}
                <LiveToolCalls toolCalls={turn.progress.toolCalls} />
                {turn.progress.liveText && (
                  <div className="jin-card">{turn.progress.liveText}</div>
                )}
                {!turn.progress.plan &&
                  turn.progress.toolCalls.length === 0 &&
                  !turn.progress.liveText &&
                  !turn.error && (
                    <p className="jin-dim mono" style={{ fontSize: 12 }}>
                      trabajando…
                    </p>
                  )}
              </>
            )}
            {/* No condicionado a "sin progreso": si el turno falló DESPUÉS
                de emitir texto parcial, ese texto queda visible arriba —
                nunca se pierde lo que ya se mostró (mismo criterio que la
                desconexión en useChat.ts). */}
            {turn.error && <div className="jin-callout-danger">{turn.error}</div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Pide un objetivo…"
          style={{
            flex: 1,
            background: 'rgba(0,0,0,.32)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: 'var(--space-3)',
          }}
        />
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? '…' : 'Enviar'}
        </Button>
      </form>
      <p className="jin-dim" style={{ fontSize: 11, margin: 0 }}>
        el plan, las tool calls y la respuesta se transmiten en vivo
      </p>
    </section>
  )
}
