import createClient from 'openapi-fetch'
import type { paths } from './api-types'

// Same-origin en producción (BLUEPRINT 5.2: la API va como path bajo
// jin.jeanfranck.com/api, nunca subdominio — cero CORS). En dev, Vite
// proxea /api al Jin_Core local (ver vite.config.ts).
const BASE_URL = ''

/**
 * `credentials: 'include'` — el JWT vive SOLO en la cookie httpOnly
 * `__Host-jin_session` que ya setea `POST /api/auth/login` (Fase 6.1,
 * ADR 0007). Este cliente nunca lee, guarda ni reenvía un token a mano:
 * cero superficie de robo por XSS. Confirmado con el owner (2026-08-02),
 * no re-litigar.
 */
export const api = createClient<paths>({
  baseUrl: BASE_URL,
  credentials: 'include',
})

/**
 * Sesión expirada a mitad de una decisión (diseño v3 §07): un 401 en
 * cualquier momento — no solo al cargar una pantalla — vuelve a /login
 * sin perder qué estabas por hacer (`returnTo`). Navegación dura
 * (`location.assign`), no `useNavigate`: este módulo no es un componente
 * y un 401 real significa "la sesión ya no existe", así que perder el
 * estado de cliente en memoria es correcto, no un defecto.
 */
/**
 * `openapi-fetch` puede resolver con `data: undefined` y `error`
 * falsy (visto en dev: el proxy de Vite devuelve una respuesta rara
 * cuando Jin_Core está caído) — React Query no tolera un `queryFn` que
 * resuelve `undefined` ("Query data cannot be undefined"), así que cada
 * caller pasa por acá en vez de repetir `if (error) throw error` sin la
 * guarda contra ese caso.
 */
export function unwrap<T>({ data, error }: { data?: T; error?: unknown }): T {
  if (error) throw error
  if (data === undefined) throw new Error('Respuesta vacía de la API.')
  return data
}

/**
 * `error` de `unwrap()` no es un `Error` — es el body JSON que devuelve
 * `JinErrorFilter` (`{statusCode, code, message}`), o directo el body de
 * un `HttpException` de Nest (guards, ValidationPipe) — ambos con
 * `message`. Punto único para mostrarle al owner por qué falló una
 * mutación (docs/RECOMENDACIONES.md #17): antes, varias mutaciones no
 * tenían ningún `catch`, así que un fallo real se veía igual que un
 * éxito — grave en HITL, donde el owner podía creer que aprobó algo que
 * en realidad no se ejecutó.
 */
export function getErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'message' in err &&
    typeof err.message === 'string'
  ) {
    return err.message
  }
  return 'Algo falló y no sabemos bien qué — reintentá o revisá /audit.'
}

api.use({
  onResponse({ response }) {
    if (
      response.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      const returnTo = encodeURIComponent(
        window.location.pathname + window.location.search,
      )
      window.location.assign(`/login?returnTo=${returnTo}`)
    }
    return response
  },
})
