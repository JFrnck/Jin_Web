import type { LiveToolCall } from './useChat'

const ICON: Record<LiveToolCall['status'], string> = {
  running: '…',
  success: '✓',
  error: '✕',
  deferred: '⏸',
}

export function LiveToolCalls({ toolCalls }: { toolCalls: readonly LiveToolCall[] }) {
  if (toolCalls.length === 0) return null

  return (
    <div className="jin-card" style={{ fontSize: 13 }}>
      <p className="jin-dim mono" style={{ margin: '0 0 8px', fontSize: 11 }}>
        TOOLS
      </p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
        {toolCalls.map((call) => (
          <li
            key={call.toolCallId}
            style={{
              display: 'flex',
              gap: 8,
              color:
                call.status === 'error'
                  ? 'var(--accent-text)'
                  : call.status === 'running'
                    ? 'var(--muted)'
                    : 'var(--text)',
            }}
          >
            <span className="mono">{ICON[call.status]}</span>
            <span className="mono">
              {call.toolName}
              {call.summary && <span className="jin-dim"> — {call.summary}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
