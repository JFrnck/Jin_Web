import { useQuery } from '@tanstack/react-query'
import { api, unwrap } from '~/lib/api-client'

export function useAuditLog(params: { limit?: number; cursor?: string } = {}) {
  const { limit = 50, cursor } = params
  return useQuery({
    queryKey: ['audit', limit, cursor ?? null],
    queryFn: async () =>
      unwrap(
        await api.GET('/api/audit', {
          params: { query: { limit, ...(cursor ? { cursor } : {}) } },
        }),
      ),
  })
}
