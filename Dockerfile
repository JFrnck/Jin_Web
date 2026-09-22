# syntax=docker/dockerfile:1
# Sin toolchain nativo: este repo no tiene módulos nativos (a diferencia de
# Jin_Core), así que no hace falta glibc ni python3/make/g++ -- alpine (musl)
# alcanza para el build.

FROM node:24-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
# pnpm-workspace.yaml: ahí vive el override de dompurify (pnpm 11 ya no lee
# pnpm.overrides de package.json) -- sin copiarlo antes del install, pnpm ve
# un "overrides" vacío que no coincide con el que quedó grabado en el
# lockfile y --frozen-lockfile falla con ERR_PNPM_LOCKFILE_CONFIG_MISMATCH.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# ssr:false (react-router.config.ts) -> build estático puro en build/client,
# nada que ejecutar en runtime.
RUN pnpm run build

# runtime: nginx sirviendo el estático, no-root (BLUEPRINT: mismo criterio de
# seguridad que jin-core/executor -- runAsNonRoot + drop ALL en el Deployment,
# acá alcanza con la imagen unprivileged oficial).
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build/client /usr/share/nginx/html
EXPOSE 8080
