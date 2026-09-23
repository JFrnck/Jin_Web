import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api, unwrap } from '~/lib/api-client'
import { getDefaultSocket } from '~/lib/ws-client'

export const BRIDGE_MESSAGES_QUERY_KEY = ['bridge', 'messages'] as const

export function useBridgeMessages() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getDefaultSocket()
    // `bridge:new-message` es genuinamente push (mismo patrón que
    // `pending-approval:new` — único emit point real en
    // RelayService.send()/reply()) para ambas direcciones del puente.
    const onNew = () =>
      queryClient.invalidateQueries({ queryKey: BRIDGE_MESSAGES_QUERY_KEY })
    socket.on('bridge:new-message', onNew)
    return () => {
      socket.off('bridge:new-message', onNew)
    }
  }, [queryClient])

  return useQuery({
    queryKey: BRIDGE_MESSAGES_QUERY_KEY,
    queryFn: async () => unwrap(await api.GET('/api/bridge/messages', {})),
    // Red de seguridad si el socket está caído, mismo criterio que
    // useApprovals.
    refetchInterval: 45_000,
  })
}

export function useBridgeReply() {
  const queryClient = useQueryClient()

  async function reply(body: string, answerTo?: string) {
    const result = await api.POST('/api/bridge/reply', {
      body: { body, ...(answerTo !== undefined ? { answerTo } : {}) },
    })
    queryClient.invalidateQueries({ queryKey: BRIDGE_MESSAGES_QUERY_KEY })
    return unwrap(result)
  }

  return { reply }
}
