import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  route('login', './routes/login.tsx'),
  layout('./routes/shell.tsx', [
    index('./routes/overview.tsx'),
    route('hitl', './routes/hitl.tsx'),
    route('chat', './routes/chat.tsx'),
    route('audit', './routes/audit.tsx'),
    route('budget', './routes/budget.tsx'),
    route('memory', './routes/memory.tsx'),
    route('orchestrator', './routes/orchestrator.tsx'),
    route('orchestrator/:runId', './routes/orchestrator.$runId.tsx'),
    route('editor', './routes/editor.tsx'),
    route('preview', './routes/preview.tsx'),
  ]),
] satisfies RouteConfig
