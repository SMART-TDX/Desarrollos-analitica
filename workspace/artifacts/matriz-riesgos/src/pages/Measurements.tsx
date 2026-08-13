import React, { useState, useEffect } from "react";

const RIESGOS_KEY = "laft_riesgos_v1";

export interface ControlItem {
  codigo: string;
  descripcion: string;
  clase: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
  ponderacion: number;
}

export interface RiskItem {
  id: string;
  codigo: string;
  proceso: string;
  subproceso: string;
  descripcion: string;
  banderas: string[];
  factorRiesgo: string;
  tipologia: string;
  quePuedeSuceder: string;
  porQuePuedeSuceder: string;
  probabilidadInherente: number;
  impactoInherente: number;
  perfilInherente: string;
  controles: ControlItem[];
  efectividad: number;
  probabilidadResidual: number;
  impactoResidual: number;
  perfilResidual: string;
}

const DEFAULT_RIESGOS_DEMO: RiskItem[] = [
  {
    id: "1",
    codigo: "R-LAFT001",
    proceso: "Gestión Comercial",
    subproceso: "COMERCIAL-TELEMERCADEO-VENTAS",
    descripcion: "Infiltración de recursos de origen ilícito a través de nuevos clientes.",
    banderas: ["Laft", "Operativo"],
    factorRiesgo: "ESTUDIANTES",
    tipologia: "Cliente sin verificar",
    quePuedeSuceder: "Vinculación de fondos ilícitos",
    porQuePuedeSuceder: "Omitir lista restrictiva",
    probabilidadInherente: 3,
    impactoInherente: 4,
    perfilInherente: "MODERADO(12)",
    controles: [
      {
        codigo: "CTR-LAFT-01",
        descripcion: "Consulta en las listas restrictivas para todas las personas asociadas.",
        clase: "PREVENTIVO",
        ponderacion: 42.5
      }
    ],
    efectividad: 42.5,
    probabilidadResidual: 2,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE(4)"
  },
  {
    id: "2",
    codigo: "R-LAFT002",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    subproceso: "CARTERA",
    descripcion: "Recibo de pagos fraccionados o de terceros no identificados.",
    banderas: ["Laft", "Legal"],
    factorRiesgo: "ESTUDIANTES",
    tipologia: "Fraccionamiento de giros",
    quePuedeSuceder: "Ingreso de efectivo no justificable",
    porQuePuedeSuceder: "Falta de validación del pagador",
    probabilidadInherente: 4,
    impactoInherente: 4,
    perfilInherente: "CRÍTICO(16)",
    controles: [],
    efectividad: 38.0,
    probabilidadResidual: 2,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE(4)"
  }
];

// Helper para obtener color del score
function getRiskScoreColor(score: number) {
  if (score >= 15) return "bg-red-500 text-white font-bold";
  if (score >= 10) return "bg-amber-400 text-slate-900 font-bold";
  if (score >= 5) return "bg-yellow-200 text-slate-800 font-bold";
  return "bg-emerald-200 text-emerald-900 font-bold";
}

export default function Measurements() {
  const [riesgos, setRiesgos] = useState<RiskItem[]>([]);
  const [filterProceso, setFilterProceso] = useState<string>("TODOS");
  const [filterFactor, setFilterFactor] = useState<string>("TODOS");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RIESGOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRiesgos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error al cargar riesgos para medición:", e);
    }
    setRiesgos(DEFAULT_RIESGOS_DEMO);
  }, []);

  // Filtrado de riesgos
  const filteredRiesgos = riesgos.filter((r) => {
    const matchProc = filterProceso === "TODOS" || r.proceso === filterProceso;
    const matchFact = filterFactor === "TODOS" || r.factorRiesgo === filterFactor;
    return matchProc && matchFact;
  });

  // Lista única de procesos y factores
  const procesosUnicos = Array.from(new Set(riesgos.map((r) => r.proceso).filter(Boolean)));
  const factoresUnicos = Array.from(new Set(riesgos.map((r) => r.factorRiesgo).filter(Boolean)));

  // Cálculos consolidados
  const totalRiesgos = filteredRiesgos.length;

  const promEfectividad = totalRiesgos > 0
    ? (filteredRiesgos.reduce((acc, r) => acc + (r.efectividad || 0), 0) / totalRiesgos).toFixed(1)
    : "0.0";

  const promInherente = totalRiesgos > 0
    ? (filteredRiesgos.reduce((acc, r) => acc + (r.probabilidadInherente * r.impactoInherente), 0) / totalRiesgos).toFixed(1)
    : "0.0";

  const promResidual = totalRiesgos > 0
    ? (filteredRiesgos.reduce((acc, r) => acc + ((r.probabilidadResidual || 1) * (r.impactoResidual || 1)), 0) / totalRiesgos).toFixed(1)
    : "0.0";

  // Conteo por niveles de perfil (Residual)
  const residualCounts = {
    ACEPTABLE: 0,
    TOLERABLE: 0,
    MODERADO: 0,
    CRITICO: 0
  };

  filteredRiesgos.forEach((r) => {
    const score = (r.probabilidadResidual || 1) * (r.impactoResidual || 1);
    if (score >= 15) residualCounts.CRITICO++;
    else if (score >= 10) residualCounts.MODERADO++;
    else if (score >= 5) residualCounts.TOLERABLE++;
    else residualCounts.ACEPTABLE++;
  });

  // Conteo Mapa de Calor 5x5 (Probabilidad vs Impacto - Residual)
  const heatmapData: Record<string, number> = {};
  filteredRiesgos.forEach((r) => {
    const p = r.probabilidadResidual || 1;
    const i = r.impactoResidual || 1;
    const key = `${p}-${i}`;
    heatmapData[key] = (heatmapData[key] || 0) + 1;
  });

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medición y Evaluación del Riesgo</h1>
          <p className="text-muted-foreground text-sm">
            Análisis cuantitativo del riesgo inherente, efectividad de controles y riesgo residual.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted bg-card transition-colors self-start sm:self-auto"
        >
          🖨️ Imprimir / Exportar Reporte
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card border p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-xs font-semibold mb-1 text-muted-foreground">Filtrar por Proceso</label>
          <select
            value={filterProceso}
            onChange={(e) => setFilterProceso(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="TODOS">Todos los Procesos ({riesgos.length})</option>
            {procesosUnicos.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-muted-foreground">Filtrar por Factor de Riesgo</label>
          <select
            value={filterFactor}
            onChange={(e) => setFilterFactor(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="TODOS">Todos los Factores de Riesgo</option>
            {factoresUnicos.map((f, idx) => (
              <option key={idx} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tarjetas KPI de Medición */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border rounded-xl shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase">Riesgos Evaluados</span>
          <p className="text-3xl font-extrabold text-foreground">{totalRiesgos}</p>
          <span className="text-[11px] text-muted-foreground">Registros en la matriz activa</span>
        </div>

        <div className="p-4 bg-card border rounded-xl shadow-sm space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase">Prom. Riesgo Inherente</span>
          <p className="text-3xl font-extrabold text-amber-600">{promInherente}</p>
          <span className="text-[11px] text-muted-foreground">Score inicial pre-controles</span>
        </div>

        <div className="p-4 bg-card border rounded-xl shadow-sm space-y-1">
          <span className="text-xs font-bold text-teal-700 uppercase">Efectividad Mitigación</span>
          <p className="text-3xl font-extrabold text-teal-700">{promEfectividad}%</p>
          <span className="text-[11px] text-muted-foreground">Cobertura de controles globales</span>
        </div>

        <div className="p-4 bg-card border rounded-xl shadow-sm space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase">Prom. Riesgo Residual</span>
          <p className="text-3xl font-extrabold text-emerald-700">{promResidual}</p>
          <span className="text-[11px] text-muted-foreground">Score final pos-controles</span>
        </div>
      </div>

      {/* Grid Central: Mapa de Calor 5x5 + Distribución Residual */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mapa de Calor 5x5 (Residual) */}
        <div className="lg:col-span-7 border rounded-xl p-5 bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-bold text-base text-foreground">Mapa de Calor (Riesgo Residual 5x5)</h2>
              <p className="text-xs text-muted-foreground">Distribución de probabilidad vs impacto residual</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-muted rounded border">5x5 SAGRILAFT</span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[320px] space-y-1">
              <div className="text-xs font-bold text-center text-muted-foreground mb-2">
                ▲ PROBABILIDAD (1 a 5)
              </div>

              {[5, 4, 3, 2, 1].map((p) => (
                <div key={p} className="flex items-center gap-1">
                  <span className="w-6 text-xs font-bold text-right text-muted-foreground">{p}</span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {[1, 2, 3, 4, 5].map((i) => {
                      const count = heatmapData[`${p}-${i}`] || 0;
                      const score = p * i;
                      const colorBg = getRiskScoreColor(score);

                      return (
                        <div
                          key={i}
                          className={`h-12 rounded flex flex-col items-center justify-center border transition-transform hover:scale-105 cursor-pointer ${colorBg}`}
                          title={`Probabilidad: ${p}, Impacto: ${i} | Score: ${score}`}
                        >
                          {count > 0 ? (
                            <span className="text-base font-extrabold">{count}</span>
                          ) : (
                            <span className="text-[10px] opacity-40">{score}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-1 pt-2">
                <span className="w-6"></span>
                <div className="grid grid-cols-5 gap-1 flex-1 text-center text-xs font-bold text-muted-foreground">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
              <div className="text-xs font-bold text-center text-muted-foreground mt-1">
                IMPACTO (1 a 5) ►
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por Perfiles y Leyenda */}
        <div className="lg:col-span-5 border rounded-xl p-5 bg-card shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-base text-foreground border-b pb-3 mb-4">
              Distribución de Perfiles Residuales
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">ACEPTABLE (1-4)</span>
                  <span>{residualCounts.ACEPTABLE} riesgos</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${totalRiesgos ? (residualCounts.ACEPTABLE / totalRiesgos) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-yellow-700">TOLERABLE (5-9)</span>
                  <span>{residualCounts.TOLERABLE} riesgos</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all"
                    style={{ width: `${totalRiesgos ? (residualCounts.TOLERABLE / totalRiesgos) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700">MODERADO (10-14)</span>
                  <span>{residualCounts.MODERADO} riesgos</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all"
                    style={{ width: `${totalRiesgos ? (residualCounts.MODERADO / totalRiesgos) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-red-700">CRÍTICO / INTOLERABLE (15-25)</span>
                  <span>{residualCounts.CRITICO} riesgos</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all"
                    style={{ width: `${totalRiesgos ? (residualCounts.CRITICO / totalRiesgos) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">💡 Nota Metodológica LAFT:</p>
            <p>
              El valor del perfil residual resulta de la probabilidad residual por el impacto residual tras la ponderación de los controles aplicados[cite: 1].
            </p>
          </div>
        </div>

      </div>

      {/* Tabla Resumen de Mediciones por Riesgo */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-bold text-base text-foreground">Detalle de Medición Cuantitativa por Riesgo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold">
                <th className="p-3 w-28">Código</th>
                <th className="p-3">Proceso</th>
                <th className="p-3">Factor de Riesgo</th>
                <th className="p-3 text-center">Inh. (P x I)</th>
                <th className="p-3 text-center">Efectividad %</th>
                <th className="p-3 text-center">Res. (P x I)</th>
                <th className="p-3 text-center">Perfil Residual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRiesgos.map((r) => {
                const scoreInh = r.probabilidadInherente * r.impactoInherente;
                const scoreRes = (r.probabilidadResidual || 1) * (r.impactoResidual || 1);

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold whitespace-nowrap">{r.codigo}</td>
                    <td className="p-3">{r.proceso}</td>
                    <td className="p-3">{r.factorRiesgo || "-"}</td>
                    <td className="p-3 text-center font-bold text-amber-700">
                      {scoreInh} ({r.probabilidadInherente}x{r.impactoInherente})
                    </td>
                    <td className="p-3 text-center font-bold text-teal-700">
                      {r.efectividad}%
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-800">
                      {scoreRes} ({r.probabilidadResidual || 1}x{r.impactoResidual || 1})
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${getRiskScoreColor(scoreRes)}`}>
                        {r.perfilResidual || "ACEPTABLE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredRiesgos.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                    No se encontraron riesgos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}