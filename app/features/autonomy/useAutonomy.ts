import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { APPROVALS_QUERY_KEY } from '~/features/hitl/useApprovals'
import { api, unwrap } from '~/lib/api-client'
import type { components } from '~/lib/api-types'

export type AutonomyMode = components['schemas']['ChangeModeDto']['mode']
export type AutonomyStatus = components['schemas']['AutonomyStatusDto_Output']
export type ChangeModeResult = components['schemas']['ChangeModeResult_Output']

export const AUTONOMY_QUERY_KEY = ['autonomy'] as const

export function useAutonomy() {
  return useQuery({
    queryKey: AUTONOMY_QUERY_KEY,
    queryFn: async () => unwrap(await api.GET('/api/autonomy')),
    // El servidor es la fuente de verdad de la caducidad (vuelve solo a
    // supervisado); refrescar seguido evita mostrar un modo relajado ya vencido.
    refetchInterval: 30_000,
  })
}

export function useChangeAutonomyMode() {
  const queryClient = useQueryClient()

  async function changeMode(mode: AutonomyMode, hours?: number) {
    const result = await api.POST('/api/autonomy', {
      body: { mode, ...(hours !== undefined ? { hours } : {}) },
    })
    // Bajar la protección crea una aprobación dual-confirm: aparece en la
    // bandeja. Volver al modo seguro cambia el estado al instante.
    await queryClient.invalidateQueries({ queryKey: AUTONOMY_QUERY_KEY })
    await queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY })
    return unwrap(result)
  }

  return { changeMode }
}

/** Reloj que se actualiza cada `everyMs` para mostrar el tiempo restante sin esperar al refetch. */
export function useNow(everyMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), everyMs)
    return () => window.clearInterval(id)
  }, [everyMs])
  return now
}

export function formatRemaining(expiresAt: string | null, now: number): string {
  if (!expiresAt) return '—'
  const ms = new Date(expiresAt).getTime() - now
  if (ms <= 0) return 'venciendo'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

export const MODE_LABEL: Record<AutonomyMode, string> = {
  supervised: 'Supervisado',
  'semi-auto': 'Semiautomático',
  auto: 'Automático',
}
