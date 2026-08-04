import { useState } from 'react'
import { useChat } from '~/features/chat/useChat'
import { PlanProgress } from '~/features/chat/PlanProgress'
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
            <div className="jin-card" style={{ background: 'var(--sunken)' }}>
              {turn.objective}
            </div>
            {turn.result && (
              <>
                {turn.result.plan.steps.length > 0 && (
                  <PlanProgress steps={turn.result.plan.steps} />
                )}
                <div className="jin-card">{turn.result.finalResponse}</div>
              </>
            )}
            {turn.error && (
              <div className="jin-card" style={{ color: 'var(--risk-confirm)' }}>
                {turn.error}
              </div>
            )}
            {!turn.result && !turn.error && (
              <p className="jin-dim mono" style={{ fontSize: 12 }}>
                trabajando…
              </p>
            )}
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
            background: 'var(--sunken)',
            border: '1px solid var(--sunken)',
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
        la respuesta llega completa al cerrar el turno · sin escritura en vivo
      </p>
    </section>
  )
}
