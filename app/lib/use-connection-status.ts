import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { getDefaultSocket } from './ws-client'

export type ConnectionStatus = 'live' | 'reconnecting' | 'stale' | 'offline'

export interface ConnectionState {
  readonly status: ConnectionStatus
  /** Momento de la última señal real del socket (conectado o mensaje recibido). */
  readonly lastSignalAt: Date
}

/**
 * Los 4 estados del diseño v3 §07 — "reconectando" y "sin conexión" NO
 * son lo mismo: con red pero sin socket, la API sigue respondiendo (se
 * puede refrescar a mano y aprobar). Lo único que se prohíbe es fingir
 * que la lista está viva cuando no lo está.
 */
export function useConnectionStatus(): ConnectionState {
  const [status, setStatus] = useState<ConnectionStatus>('reconnecting')
  const [lastSignalAt, setLastSignalAt] = useState<Date>(new Date())

  useEffect(() => {
    const socket: Socket = getDefaultSocket()

    const computeStatus = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline')
        return
      }
      setStatus(socket.connected ? 'live' : 'reconnecting')
    };

    const onConnect = () => {
      setLastSignalAt(new Date())
      computeStatus()
    }
    const onDisconnect = () => computeStatus()
    const onOffline = () => setStatus('offline')
    const onOnline = () => computeStatus()

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('reconnect_attempt', onDisconnect)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)

    computeStatus()

    // "Sin tiempo real" si llevamos > 15s reconectando sin éxito — la
    // lista puede estar incompleta, no solo "un poco lenta".
    const staleTimer = window.setInterval(() => {
      setStatus((current) => (current === 'reconnecting' ? 'stale' : current))
    }, 15_000)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('reconnect_attempt', onDisconnect)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
      window.clearInterval(staleTimer)
    }
  }, [])

  return { status, lastSignalAt }
}
