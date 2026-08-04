import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api, unwrap } from '~/lib/api-client'
import { getDefaultSocket } from '~/lib/ws-client'

export const APPROVALS_QUERY_KEY = ['hitl', 'pending'] as const

export function useApprovals() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getDefaultSocket()
    // `pending-approval:new` es genuinamente push (ADR 0007 #5, único
    // emit point real en DualConfirmService.createPendingApproval) — no
    // hace falta esperar el próximo refetchInterval para verla.
    const onNew = () =>
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY })
    socket.on('pending-approval:new', onNew)
    return () => {
      socket.off('pending-approval:new', onNew)
    }
  }, [queryClient])

  return useQuery({
    queryKey: APPROVALS_QUERY_KEY,
    queryFn: async () => unwrap(await api.GET('/api/hitl/pending')),
    // Red de seguridad si el socket está caído (§07 del diseño: "sin
    // tiempo real" sigue permitiendo refrescar a mano y aprobar).
    refetchInterval: 45_000,
  })
}

export function useApproveRejectMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY })

  async function approve(requestId: string) {
    const result = await api.POST('/api/hitl/{requestId}/approve', {
      params: { path: { requestId } },
    })
    invalidate()
    return unwrap(result)
  }

  async function reject(requestId: string) {
    const result = await api.POST('/api/hitl/{requestId}/reject', {
      params: { path: { requestId } },
    })
    invalidate()
    unwrap(result)
  }

  return { approve, reject }
}
