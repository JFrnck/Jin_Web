import type { components } from '~/lib/api-types'

type AgentStep = components['schemas']['AgentTurnResultDto_Output']['plan']['steps'][number]

const ICON: Record<AgentStep['status'], string> = {
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
                  ? 'var(--risk-confirm)'
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
