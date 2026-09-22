import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { api } from '~/lib/api-client'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const { error: apiError } = await api.POST('/api/auth/login', {
      body: { password },
    })

    setPending(false)
    if (apiError) {
      setError('Contraseña incorrecta.')
      return
    }

    const returnTo = searchParams.get('returnTo')
    navigate(returnTo && returnTo.startsWith('/') ? returnTo : '/', {
      replace: true,
    })
  }

  return (
    // La única pantalla "atmosférica" del sistema (diseño v4 §7.1): dos
    // halos radiales decorativos, 100% CSS, sin tocar el <form>. El resto
    // de Jin es una cabina de mando, no una bienvenida — por eso este
    // tratamiento no se repite en ninguna otra pantalla.
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        background:
          'radial-gradient(90% 60% at 50% 30%, #2A1310 0%, #120907 45%, #070505 100%)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-10%',
          top: '-20%',
          width: '70%',
          height: '90%',
          borderRadius: '50%',
          background:
            'radial-gradient(closest-side, rgba(226,84,63,.14), transparent)',
          filter: 'blur(30px)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-5%',
          bottom: '-25%',
          width: '60%',
          height: '80%',
          borderRadius: '50%',
          background:
            'radial-gradient(closest-side, rgba(226,84,63,.08), transparent)',
          filter: 'blur(40px)',
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="jin-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 340,
          display: 'grid',
          gap: 'var(--space-4)',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        <div>
          <p className="jin-dim mono" style={{ fontSize: 11, letterSpacing: '0.18em', margin: 0 }}>
            SISTEMA PRIVADO
          </p>
          <h1
            style={{
              margin: '6px 0 0',
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: '#FBF3F0',
            }}
          >
            Jin
          </h1>
        </div>

        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña"
          aria-label="Contraseña"
          className="mono"
          style={{
            minHeight: 48,
            background: 'rgba(0,0,0,.38)',
            border: error
              ? '1px solid rgba(242,101,74,.8)'
              : '1px solid var(--hairline-strong)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: '0 var(--space-3)',
            fontSize: 16,
          }}
        />

        {/* Sin shake: el campo conserva el foco (autoFocus arriba) — un
            error no debe expulsarte del formulario ni hacer que retipees
            a ciegas mientras la tarjeta tiembla. */}
        {error && (
          <p style={{ color: '#FF8367', margin: 0, fontSize: 12.5 }}>✕ {error}</p>
        )}

        <button
          type="submit"
          className="jin-btn jin-btn--primary"
          data-pending={pending || undefined}
          disabled={pending || password.length === 0}
        >
          {pending ? 'Verificando…' : 'Entrar'}
        </button>

        <p
          className="jin-dimmer"
          style={{ margin: 0, fontSize: 12, textAlign: 'center' }}
        >
          Un solo usuario. No hay recuperación de contraseña.
        </p>
      </form>
    </main>
  )
}
