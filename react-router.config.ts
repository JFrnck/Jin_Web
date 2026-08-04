import type { Config } from '@react-router/dev/config'

export default {
  // Build estático servido desde Cloudflare Pages (BLUEPRINT 8.1) — sin
  // servidor Node en producción. Ningún dato sensible se pre-renderiza:
  // todo (auth, HITL, chat) se resuelve client-side contra la API real.
  ssr: false,
} satisfies Config
