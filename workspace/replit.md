# Matriz de Riesgos LAFT

Sistema web de gestión de riesgos LAFT (Lavado de Activos y Financiación del Terrorismo) para Smart Training Society SAS. Reemplaza la matriz Excel con una aplicación full-stack completa.

## Run & Operate

- `pnpm --filter @workspace/matriz-riesgos run dev` — frontend (port auto)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + Recharts + Wouter
- API: Express 5 — routes at `artifacts/api-server/src/routes/`
- DB: PostgreSQL + Drizzle ORM — schema at `lib/db/src/schema/`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)

## Where things live

- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/` (riesgos, controles, riesgos_controles, monitoreo, eventos, mediciones, parametros)
- API routes: `artifacts/api-server/src/routes/` (riesgos, controles, monitoreo, eventos, mediciones, parametros, dashboard)
- Frontend pages: `artifacts/matriz-riesgos/src/pages/`
- Generated hooks: `lib/api-client-react/src/generated/api.ts`

## Architecture decisions

- Risk profile (perfil) is computed server-side: prob × impacto → ACEPTABLE/TOLERABLE/MODERADO/ALTO/CRITICO
- Control effectiveness average is computed only over the controls linked to each specific risk (not all cells)
- SAGRILAF events get `fecha_creacion` auto-set on creation
- Two heat maps: one from probabilidad_inherente, one from probabilidad_residual
- Monitoring `codigo` field corresponds to the risk code from the matrix (column A)
- Measurement sessions are separate from the main matrix — they feed ratings back

## Product

Modules:
1. **Dashboard** — stats, risk profile distribution chart, CAL consolidado table
2. **Matriz de Riesgos** — full scrollable matrix with all 14 risks, inline control expansion
3. **Formulario Nuevo/Editar Riesgo** — control search dropdown (by code), auto-fill, multiple controls per risk
4. **Catálogo de Controles** — 26 controls with pesos and áreas
5. **Plan de Monitoreo** — código from risk code, tipo = aspecto a monitorear
6. **Eventos** — Eventos de Riesgo + Eventos SAGRILAF (with auto fecha_creacion)
7. **Mediciones** — separate sessions with per-risk calificaciones (inherente/residual)
8. **Mapa de Calor** — two 5×5 grids: inherente and residual
9. **Parámetros** — control weight tables (Clase, Tipo, Frecuencia, Formalidad)

## User preferences

_Populate as you build._

## Gotchas

- After any OpenAPI spec change, run codegen before building: `pnpm --filter @workspace/api-spec run codegen`
- Run `pnpm run typecheck:libs` after changing `lib/*` packages before checking artifacts
- DB push applies schema to dev DB only; production uses Replit's publish-time migration
- Seed data is from `Matriz_de_Riesgos_macro_1784649187700.xlsm` (14 risks, 26 controls, 38 risk-control links)
