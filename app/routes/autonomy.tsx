import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '~/components/Button'
import { Skeleton } from '~/components/EmptyState'
import {
  formatRemaining,
  MODE_LABEL,
  useAutonomy,
  useChangeAutonomyMode,
  useNow,
  type AutonomyMode,
  type ChangeModeResult,
} from '~/features/autonomy/useAutonomy'
import { getErrorMessage } from '~/lib/api-client'

const MODE_DESCRIPTION: Record<AutonomyMode, string> = {
  supervised:
    'HITL completo. Todo lo que hoy pide aprobación la sigue pidiendo. Es el modo por defecto.',
  'semi-auto':
    'Lo que pedía 1 aprobación se ejecuta y te avisa por Telegram, salvo las acciones protegidas (abajo). Lo irreversible (dual-confirm) sigue pidiendo 2 aprobaciones.',
  auto:
    'Todo lo que pedía 1 aprobación se ejecuta y te avisa, incluido enviar correos. Solo lo dual-confirm sigue pidiendo 2 aprobaciones.',
}

export default function Autonomy() {
  const { data, isLoading, isError, refetch } = useAutonomy()
  const { changeMode } = useChangeAutonomyMode()
  const now = useNow()
  const [pendingMode, setPendingMode] = useState<AutonomyMode | null>(null)
  const [hours, setHours] = useState<Record<'semi-auto' | 'auto', string>>({
    'semi-auto': '',
    auto: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ChangeModeResult | null>(null)

  async function apply(mode: AutonomyMode) {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const h =
        mode === 'supervised' || hours[mode] === '' ? undefined : Number(hours[mode])
      setResult(await changeMode(mode, h))
      setPendingMode(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (isLoading) return <Skeleton height={160} />
  if (isError || !data) {
    return (
      <p className="jin-muted">
        Sin conexión con la API.{' '}
        <button type="button" onClick={() => refetch()} className="jin-btn">
          Reintentar
        </button>
      </p>
    )
  }

  const relaxed = data.mode !== 'supervised'

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 720 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Autonomía del agente</h1>

      <div className="jin-card" style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <p className="jin-dim mono" style={{ fontSize: 11, margin: 0 }}>
          MODO ACTUAL
        </p>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{MODE_LABEL[data.mode]}</p>
        <p className="jin-muted" style={{ margin: 0, fontSize: 14 }}>
          {MODE_DESCRIPTION[data.mode]}
        </p>
        {relaxed && (
          <p className="mono" style={{ margin: 0, fontSize: 13 }}>
            Vuelve solo a supervisado en {formatRemaining(data.expiresAt, now)}.
          </p>
        )}
      </div>

      {result?.status === 'pending-approval' && (
        <div className="jin-card jin-card--dual" role="status" style={{ display: 'grid', gap: 6 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            Falta tu doble aprobación para pasar a «{MODE_LABEL[result.mode]}» ({result.hours} h)
          </p>
          <p className="jin-muted" style={{ margin: 0, fontSize: 14 }}>
            Bajar la protección exige 2 aprobaciones separadas por ≥30 s. Mientras tanto sigue
            el modo actual.
          </p>
          <Link to="/hitl" className="jin-btn jin-btn--primary">
            Ir a aprobar
          </Link>
        </div>
      )}
      {result?.status === 'applied' && (
        <p role="status" style={{ margin: 0 }}>
          ✓ Modo «{MODE_LABEL[result.mode]}» aplicado.
        </p>
      )}
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--accent-text)' }}>
          ⚠ No se completó: {error}
        </p>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {relaxed && (
          <Button variant="primary" onClick={() => apply('supervised')} disabled={busy}>
            Volver al modo seguro ahora
          </Button>
        )}

        {(['semi-auto', 'auto'] as const).map((mode) => {
          const limits = mode === 'auto' ? data.limits.auto : data.limits.semiAuto
          const confirming = pendingMode === mode
          return (
            <div key={mode} className="jin-card" style={{ display: 'grid', gap: 'var(--space-2)' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{MODE_LABEL[mode]}</p>
              <p className="jin-muted" style={{ margin: 0, fontSize: 14 }}>
                {MODE_DESCRIPTION[mode]}
              </p>
              {confirming ? (
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>
                    Duración (horas, máx. {limits.maxHours}; vacío = {limits.defaultHours})
                    <input
                      type="number"
                      min={1}
                      max={limits.maxHours}
                      value={hours[mode]}
                      onChange={(e) => setHours((h) => ({ ...h, [mode]: e.target.value }))}
                      className="mono"
                      style={{ padding: 8, maxWidth: 160 }}
                    />
                  </label>
                  <p className="jin-muted" style={{ margin: 0, fontSize: 13 }}>
                    Esto NO lo activa: crea una aprobación que tenés que confirmar dos veces.
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button onClick={() => setPendingMode(null)} disabled={busy}>
                      Cancelar
                    </Button>
                    <Button variant="accent" onClick={() => apply(mode)} disabled={busy}>
                      {busy ? 'Pidiendo…' : 'Pedir el cambio'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setPendingMode(mode)} disabled={busy}>
                  {data.mode === mode ? 'Renovar…' : 'Activar…'}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <div className="jin-card" style={{ display: 'grid', gap: 6 }}>
        <p className="jin-dim mono" style={{ fontSize: 11, margin: 0 }}>
          SIGUEN PIDIENDO APROBACIÓN EN SEMIAUTOMÁTICO
        </p>
        <p className="mono" style={{ margin: 0, fontSize: 13 }}>
          {data.guardedInSemiAuto.join(' · ')}
        </p>
        <p className="jin-muted" style={{ margin: 0, fontSize: 13 }}>
          Freno de emergencia: si se autoejecutan más de {data.limits.maxRelaxedActionsPerHour}{' '}
          acciones en 1 h, vuelve solo a supervisado.
        </p>
      </div>
    </section>
  )
}
