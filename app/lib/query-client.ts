import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // La bandeja HITL y el chat viven de WS para "en vivo"; el refetch
      // por foco/reconexión es la red de seguridad cuando el socket se
      // cayó sin que el usuario lo note (ver useConnectionStatus).
      staleTime: 30_000,
      retry: 1,
    },
  },
})
