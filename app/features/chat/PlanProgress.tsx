// Shape estructural, no derivado exclusivamente del DTO generado: acepta
// tanto el snapshot final (`AgentTurnResultDto_Output['plan']['steps']`,
// vía api-types.ts) como el plan en vivo del streaming
// (`AgentPlan['steps']`, vía agent-progress.types.ts) — ambos coinciden
// en forma, así que este componente no necesita saber cuál le llegó.
type AgentStepStatus = 'pending' | 'in-progress' | 'done' | 'failed'
interface AgentStep {
  readonly description: string
  readonly status: AgentStepStatus
  readonly note?: string
}

const ICON: Record<AgentStepStatus, string> = {
  done: '✓',
  'in-progress': '…',
  pending: '○',
  failed: '✕',
}

export function PlanProgress({ steps }: { steps: readonly AgentStep[] }) {
  if (steps.length === 0) return null
  const done = steps.filter((s) => s.status === 'done').length

  return (
    <div className="jin-card" style={{ fontSize: 13 }}>
      <p className="jin-dim mono" style={{ margin: '0 0 8px', fontSize: 11 }}>
        PLAN · {done} DE {steps.length}
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
        {steps.map((step, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              gap: 8,
              color:
                step.status === 'failed'
                  ? 'var(--accent-text)'
                  : step.status === 'pending'
                    ? 'var(--muted)'
                    : 'var(--text)',
            }}
          >
            <span className="mono">{ICON[step.status]}</span>
            <span>
              {step.description}
              {step.note && <span className="jin-dim"> — {step.note}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
