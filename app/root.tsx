import { QueryClientProvider } from '@tanstack/react-query'
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#08090B" />
        <meta name="color-scheme" content="dark" />
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
