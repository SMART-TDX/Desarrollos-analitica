# Matriz de Riesgos LAFT — Smart Training Society SAS

Aplicación web full-stack que reemplaza la matriz Excel de gestión de riesgos LAFT (Lavado de Activos y Financiación del Terrorismo). Construida con React + Vite (frontend) y Express + PostgreSQL (backend) en un monorepo pnpm.

---

## Módulos

| Módulo | Funcionalidad |
|---|---|
| **Dashboard** | KPIs, distribución de riesgos por perfil residual, riesgos por proceso |
| **Matriz de Riesgos** | Tabla completa con 14+ riesgos, expansión inline, exportar a **Excel y PDF** |
| **Nuevo / Editar Riesgo** | Formulario con **dropdowns** de proceso/subproceso/factor de riesgo, vinculación de controles con búsqueda |
| **Catálogo de Controles** | 26 controles con clase, tipo, frecuencia, formalidad y ponderación |
| **Plan de Monitoreo** | Aspectos a monitorear por riesgo |
| **Eventos de Riesgo** | CRUD completo con calificación inherente y residual, asociado a riesgo, alimentos el mapa de calor |
| **Eventos SAGRILAFT** | CRUD con fecha de creación automática |
| **Mediciones** | Sesiones de medición con calificaciones individuales por riesgo |
| **Mapa de Calor** | Dos vistas: riesgos (1=Raro…5=Casi con certeza) y eventos (1=Raro…5=Casi certeza) — cada una con inherente y residual |
| **Parámetros** | Listas desplegables (Procesos, Subprocesos, Factores de Riesgo) + pesos de controles |

---

## Stack tecnológico

- **Monorepo**: pnpm workspaces
- **Frontend**: React 19, Vite 7, Tailwind CSS, TanStack Query, Wouter, Recharts, SheetJS (xlsx)
- **Backend**: Node.js 24, Express 5, Drizzle ORM, Zod v4
- **Base de datos**: PostgreSQL 16
- **API**: OpenAPI 3.1 → Orval codegen → hooks tipados

---

## Prerequisitos locales

- **Node.js ≥ 20**
- **pnpm ≥ 9** (`npm install -g pnpm`)
- **PostgreSQL 16** (local o instancia remota)

---

## Instalación y ejecución local

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edite .env y complete DATABASE_URL y SESSION_SECRET

# 4. Crear la base de datos y aplicar el schema
pnpm --filter @workspace/db run push

# 5. Iniciar el API server (terminal 1)
pnpm --filter @workspace/api-server run dev

# 6. Iniciar el frontend (terminal 2)
pnpm --filter @workspace/matriz-riesgos run dev
```

La app queda disponible en `http://localhost:PUERTO` (Vite asigna el puerto y lo muestra en consola).

---

## Scripts útiles

```bash
pnpm run typecheck              # Typecheck completo
pnpm run typecheck:libs         # Solo librerías compartidas
pnpm --filter @workspace/db run push          # Aplicar schema a DB
pnpm --filter @workspace/api-spec run codegen # Regenerar hooks del API
```

---

## Estructura del monorepo

```
.
├── artifacts/
│   ├── api-server/          # Express API (puerto configurable via PORT)
│   │   └── src/routes/      # riesgos, controles, monitoreo, eventos, mediciones, parametros, dashboard
│   └── matriz-riesgos/      # React + Vite frontend
│       └── src/pages/       # Dashboard, Matrix, RiskForm, Controls, Monitoring, Events, HeatMap, Parameters...
├── lib/
│   ├── api-spec/            # openapi.yaml + codegen config
│   ├── api-client-react/    # Hooks generados por Orval
│   └── db/                  # Schema Drizzle ORM + drizzle.config.ts
├── .env.example
└── replit.md                # Notas de operación
```

---

## Despliegue en producción

El proyecto está diseñado para Replit Deploy pero puede desplegarse en cualquier plataforma Node.js:

1. Construir el frontend: `pnpm --filter @workspace/matriz-riesgos run build`
2. Construir el API: `pnpm --filter @workspace/api-server run build`
3. Servir `artifacts/api-server/dist/index.mjs` y el directorio `dist/` del frontend

---

## Variables de entorno requeridas en producción

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Cadena aleatoria para firmar sesiones |
| `PORT` | Puerto del API server (por defecto 8080) |

---

## Licencia

Propiedad de Smart Training Society SAS. Uso interno.
