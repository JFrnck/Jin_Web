# AGENTS.md — Jin_Web

Lee `../Jin_Docs/AGENTS.md`: todas sus reglas aplican aquí.
Este repo: **Jin_Web** — dashboard React (Vite, React 19, Router v7). Deploy: Cloudflare Pages (`jin.jeanfranck.com`).
Ownership: **Claude Code** (desde 2026-08-02, decisión explícita del owner). Tipos del API: `pnpm generate:api` desde el contrato de Jin_Core — jamás copiados a mano.

**PWA — reglas duras (BLUEPRINT 8.1.1), verificar antes de tocar el service worker:**

1. El service worker **jamás** cachea `/api/*`. Solo app shell. Cachear respuestas de la API persiste aprobaciones/correos/audit log en `CacheStorage`, y eso sobrevive al logout.
2. Offline es **solo lectura**. Prohibido background sync o encolar mutaciones: una aprobación sincronizada tarde decide sobre estado vencido (TTL de 24 h del HITL).
3. El JWT vive en la cookie `__Host-jin_session`, nunca en `localStorage` ni en JS. `fetch` usa `credentials: 'include'`; Socket.IO usa `withCredentials: true`.