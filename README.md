# Jin_Web

Dashboard de Jin — cabina de mando para agentes autónomos. React Router v8 (framework mode, SPA), React 19, TanStack Query, Socket.IO.

Ver `Jin_Docs/docs/BLUEPRINT.md` §8.1 y `docs/WEB_DESIGN_BRIEF.md` para el contexto de producto y diseño.

## Desarrollo

```bash
nvm use
pnpm install
pnpm run generate:api   # tipos desde ../Jin_Core/contracts/openapi.json
pnpm dev                # http://localhost:5173, proxea /api y /socket.io a Jin_Core en :3000
```

## Comandos

```bash
pnpm typecheck   # react-router typegen && tsc --noEmit
pnpm lint        # oxlint
pnpm build       # build estático (SPA mode, ssr:false) para Cloudflare Pages
```

## Estructura

```
app/
  root.tsx          # shell HTML, fuentes, QueryClientProvider
  routes.ts          # config de rutas
  routes/            # una pantalla por archivo
  lib/               # api-client (cookie-only, sin JWT en JS), ws-client, query-client
  features/          # hooks + componentes por dominio (hitl, chat, budget, audit, editor...)
  components/        # UI compartida (RiskBadge, Button, EmptyState...)
```

## Decisiones ya tomadas (no re-litigar sin nueva justificación)

- **JWT solo en la cookie `__Host-jin_session`**, nunca en `localStorage`/JS (BLUEPRINT 5.2, ADR 0007).
- **TanStack Query sin Zustand** — casi todo el estado es de servidor. Ver `Jin_Docs/STATUS.md` §Decisiones del owner para cuándo reconsiderar.
- **`ssr: false`** — build estático, sin servidor Node en producción.
- **Tema oscuro único**, sin modo claro (decisión del owner).
