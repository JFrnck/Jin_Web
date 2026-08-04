import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api, unwrap } from '~/lib/api-client'
import { getDefaultSocket } from '~/lib/ws-client'

export const BUDGET_QUERY_KEY = ['budget'] as const

export function useBudgetStatus() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getDefaultSocket()
    // `budget:alert`/`kill-switch:activated` son polling disfrazado de
    // push del lado del servidor (ADR 0007 #5) — acá solo invalidamos el
    // cache al recibirlos, sin duplicar la lógica de umbrales.
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY })
    socket.on('budget:alert', invalidate)
    socket.on('kill-switch:activated', invalidate)
    return () => {
      socket.off('budget:alert', invalidate)
      socket.off('kill-switch:activated', invalidate)
    }
  }, [queryClient])

  return useQuery({
    queryKey: BUDGET_QUERY_KEY,
    queryFn: async () => unwrap(await api.GET('/api/budget')),
    // Red de seguridad si el WS se cayó sin que el badge de conexión lo
    // note todavía (ver useConnectionStatus): igual refresca cada 60s.
    refetchInterval: 60_000,
  })
}
