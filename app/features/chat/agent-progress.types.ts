// Espejo manual de Jin_Core/src/agent/agent-progress.types.ts — no hay
// codegen compartido para eventos de WS (solo el contrato REST pasa por
// openapi-typescript, ver `app/lib/api-types.ts`). Si cambia el shape del
// lado del backend, actualizar acá a mano.
export type AgentStepStatus = 'pending' | 'in-progress' | 'done' | 'failed'

export interface AgentPlanStep {
  readonly description: string
  readonly status: AgentStepStatus
  readonly note?: string
}

export interface AgentPlan {
  readonly steps: readonly AgentPlanStep[]
}

export type AgentProgressEvent =
  | { readonly type: 'plan'; readonly plan: AgentPlan }
  | {
      readonly type: 'tool-call-started'
      readonly toolCallId: string
      readonly toolName: string
      readonly input: unknown
    }
  | {
      readonly type: 'tool-call-finished'
      readonly toolCallId: string
      readonly toolName: string
      readonly outcome: 'success' | 'error' | 'deferred'
      readonly summary?: string
    }
  | {
      readonly type: 'text-delta'
      readonly iteration: number
      readonly delta: string
      readonly snapshot: string
    }
