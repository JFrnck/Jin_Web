import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Dev only: Jin_Core corre en localhost:3000 (mismo puerto que
    // `pnpm dev` de Jin_Core). En producción no hace falta — la API va
    // como path bajo el mismo origen vía la route rule de Cloudflare
    // (BLUEPRINT 5.2), cero proxy.
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
})
