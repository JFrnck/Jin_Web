export type RiskLevel = 'auto' | 'notify' | 'confirm' | 'dual-confirm'

const LABEL: Record<RiskLevel, string> = {
  auto: 'AUTO',
  notify: 'NOTIFY',
  confirm: 'CONFIRM',
  'dual-confirm': 'DUAL-CONFIRM',
}

// Color + forma + peso, en ese orden de importancia (diseño v3 §02).
// `auto` no lleva color: es "casi invisible" a propósito. El resto sigue
// el ramp ordinal validado (ver app.css) — nunca color solo: el texto del
// nivel siempre acompaña al color.
const STYLE: Record<RiskLevel, string> = {
  auto: 'jin-risk jin-risk-auto',
  notify: 'jin-risk jin-risk-notify',
  confirm: 'jin-risk jin-risk-confirm',
  'dual-confirm': 'jin-risk jin-risk-dual',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={STYLE[level]} data-risk={level}>
      {LABEL[level]}
    </span>
  )
}
