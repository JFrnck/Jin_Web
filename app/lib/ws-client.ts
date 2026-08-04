import { io, type Socket } from 'socket.io-client'

/**
 * `withCredentials: true` — el handshake WS manda la cookie
 * `__Host-jin_session` igual que un fetch same-origin; `extractWsToken`
 * (Jin_Core) la lee del header `cookie` del handshake. Mismo criterio
 * "cero JWT en JS" que `api-client.ts`.
 */
function connect(namespace: string): Socket {
  return io(namespace, {
    withCredentials: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  })
}

let defaultSocket: Socket | null = null
let chatSocket: Socket | null = null

/** Namespace default: `pending-approval:new`, `budget:alert`, `kill-switch:activated`. */
export function getDefaultSocket(): Socket {
  defaultSocket ??= connect('/')
  return defaultSocket
}

/** Namespace `/chat`: `chat:message` → `chat:response` | `chat:error`. */
export function getChatSocket(): Socket {
  chatSocket ??= connect('/chat')
  return chatSocket
}
