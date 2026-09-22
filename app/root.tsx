import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'
import { queryClient } from './lib/query-client'

export const links: Route.LinksFunction = () => [
  { rel: 'manifest', href: '/manifest.webmanifest' },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  // iOS Safari no lee el manifest para "Agregar a inicio" -- necesita este
  // link explícito, y no soporta bien SVG ahí (a diferencia de Chrome/
  // Android, que sí toma el ícono SVG del manifest).
  { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    // IBM Plex Sans/Mono (diseño v3 §01). Nota PWA: sin auto-hospedar, la
    // tipografía cae a la pila de sistema cuando el service worker no
    // cachea este request cross-origin — degradación aceptable, no
    // bloqueante (BLUEPRINT 8.1.1: el shell sigue funcionando offline).
    href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  },
]

/**
 * Registra `public/sw.js` -- solo en producción (nunca en dev: interferiría
 * con el hot-reload de Vite) y solo si el navegador lo soporta. El propio
 * service worker es el que decide qué cachea (ver sw.js) -- acá solo se lo
 * registra.
 */
function useServiceWorker(): void {
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registrar el SW es una mejora (instalabilidad, shell offline), no
      // un requisito -- si falla, Jin sigue funcionando igual como sitio
      // normal.
    })
  }, [])
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0C0706" />
        <meta name="color-scheme" content="dark" />
        {/* iOS Safari: sin esto, "Agregar a inicio" abre dentro de Safari
            (con su barra de navegación) en vez de en modo standalone como
            el resto de la PWA. `black-translucent` deja que el contenido
            se dibuje debajo del notch/isla dinámica -- `viewport-fit=cover`
            de arriba ya asume ese layout. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Jin" />
        <title>Jin</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  useServiceWorker()
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Algo salió mal'
  let details = 'Ocurrió un error inesperado.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'La página que buscás no existe.'
        : error.statusText || details
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main style={{ padding: 32, fontFamily: 'var(--font-sans)' }}>
      <h1>{message}</h1>
      <p className="jin-muted">{details}</p>
      {stack && (
        <pre className="mono" style={{ overflowX: 'auto', fontSize: 12 }}>
          {stack}
        </pre>
      )}
    </main>
  )
}
