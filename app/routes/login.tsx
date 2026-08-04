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
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="jin-card"
        style={{ width: '100%', maxWidth: 340, display: 'grid', gap: 'var(--space-4)' }}
      >
        <div>
          <p className="jin-dim mono" style={{ fontSize: 12, margin: 0 }}>
            SISTEMA PRIVADO
          </p>
          <h1 style={{ margin: '4px 0 0', fontSize: 24 }}>Jin</h1>
        </div>

        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña"
          aria-label="Contraseña"
          style={{
            background: 'var(--sunken)',
            border: '1px solid var(--sunken)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: 'var(--space-3)',
            fontSize: 16,
          }}
        />

        {error && (
          <p style={{ color: 'var(--risk-confirm)', margin: 0, fontSize: 14 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="jin-btn jin-btn--primary"
          disabled={pending || password.length === 0}
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
