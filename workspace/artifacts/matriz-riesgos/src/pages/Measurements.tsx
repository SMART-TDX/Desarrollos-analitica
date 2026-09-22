import React, { useState, useEffect, useCallback } from "react";
import { CONTROLES_OFICIALES, ControlRow, calcularPonderacion } from "./Controls";
 
// Llave real donde Matrix.tsx guarda los riesgos.
const RIESGOS_KEY = "laft_matriz_riesgos_v3";
// Llave antigua, se mantiene solo como fallback de compatibilidad.
const RIESGOS_KEY_LEGACY = "laft_riesgos_v1";
// Llaves del catálogo de controles (mismo orden de prioridad que Matrix.tsx).
const CONTROLES_KEY = "laft_catalogo_controles_v4";
const CONTROLES_KEY_LEGACY = "laft_catalogo_controles_v3";
 
// Forma real en la que Matrix.tsx guarda cada riesgo (RiesgoRow).
// La dejamos flexible porque Measurements no necesita todos los campos.
export interface RiesgoMatrizRow {
  id: string;
  codigo: string;
  proceso: string;
  subproceso?: string;
  factorRiesgo: string;
  quePuedeSuceder?: string;
  descripcionEvento?: string;
  descripcion?: string;
  probabilidadInherente: number;
  impactoInherente: number;
  probabilidadResidual?: number;
  impactoResidual?: number;
  controlCodigos?: string[];
  controlCodigo?: string;
}
 
// Estructura ya calculada que usa toda la vista de Measurements.
interface RiesgoMedido {
  id: string;
  codigo: string;
  proceso: string;
  factorRiesgo: string;
  probabilidadInherente: number;
  impactoInherente: number;
  probabilidadResidual: number;
  impactoResidual: number;
  efectividad: number;
  perfilResidual: string;
}
 
const DEFAULT_RIESGOS_DEMO: RiesgoMatrizRow[] = [
  {
    id: "1",
    codigo: "R-LAFT001",
    proceso: "Gestión Comercial",
    subproceso: "COMERCIAL-TELEMERCADEO-VENTAS",
    descripcion: "Infiltración de recursos de origen ilícito a través de nuevos clientes.",
    factorRiesgo: "ESTUDIANTES",
    probabilidadInherente: 3,
    impactoInherente: 4,
    controlCodigos: ["CTR-LAFT-01"],
    probabilidadResidual: 2,
    impactoResidual: 2
  },
  {
    id: "2",
    codigo: "R-LAFT002",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    subproceso: "CARTERA",
    descripcion: "Recibo de pagos fraccionados o de terceros no identificados.",
    factorRiesgo: "ESTUDIANTES",
    probabilidadInherente: 4,
    impactoInherente: 4,
    controlCodigos: [],
    probabilidadResidual: 2,
    impactoResidual: 2
  }
];
 
// Helper para obtener color del score
function getRiskScoreColor(score: number) {
  if (score >= 15) return "bg-red-500 text-white font-bold";
  if (score >= 10) return "bg-amber-400 text-slate-900 font-bold";
  if (score >= 5) return "bg-yellow-200 text-slate-800 font-bold";
  return "bg-emerald-200 text-emerald-900 font-bold";
}
 
function getPerfilLabel(score: number): string {
  if (score >= 15) return "CRÍTICO";
  if (score >= 10) return "MODERADO";
  if (score >= 5) return "TOLERABLE";
  return "ACEPTABLE";
}
 
function calcularMitigacionMultiple(ponderaciones: number[]): number {
  if (!ponderaciones || ponderaciones.length === 0) return 0;
  let factorResidual = 1;
  ponderaciones.forEach((p) => {
    factorResidual *= (1 - (p || 0) / 100);
  });
  const mitigacion = Math.round((1 - factorResidual) * 100);
  return Math.min(mitigacion, 95);
}
 
function obtenerCodigosControlSeguros(item: RiesgoMatrizRow): string[] {
  if (Array.isArray(item.controlCodigos) && item.controlCodigos.length > 0) {
    return item.controlCodigos;
  }
  if (item.controlCodigo) {
    return [item.controlCodigo];
  }
  return [];
}
 
function cargarRiesgosDesdeStorage(): RiesgoMatrizRow[] {
  try {
    const saved = localStorage.getItem(RIESGOS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Fallback a la llave antigua, por si el usuario aún no ha migrado datos.
    const legacy = localStorage.getItem(RIESGOS_KEY_LEGACY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error al cargar riesgos para medición:", e);
  }
  return DEFAULT_RIESGOS_DEMO;
}
 
function cargarControlesDesdeStorage(): ControlRow[] {
  try {
    const saved = localStorage.getItem(CONTROLES_KEY) || localStorage.getItem(CONTROLES_KEY_LEGACY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error al cargar catálogo de controles:", e);
  }
  return CONTROLES_OFICIALES;
}
 
// Convierte un RiesgoRow "crudo" (tal como lo guarda Matrix) en un
// RiesgoMedido con efectividad y perfil residual calculados en vivo
// a partir del catálogo de controles vigente.
function calcularMedicion(item: RiesgoMatrizRow, controles: ControlRow[]): RiesgoMedido {
  const codigos = obtenerCodigosControlSeguros(item);
  const controlesAsignados = controles.filter((c) => codigos.includes(c.codigo));
  const ponderaciones = controlesAsignados.map((c) =>
    calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad)
  );
  const efectividad = calcularMitigacionMultiple(ponderaciones);
 
  const probabilidadResidual = item.probabilidadResidual || 1;
  const impactoResidual = item.impactoResidual || 1;
  const scoreResidual = probabilidadResidual * impactoResidual;
 
  return {
    id: item.id,
    codigo: item.codigo,
    proceso: item.proceso,
    factorRiesgo: item.factorRiesgo,
    probabilidadInherente: item.probabilidadInherente || 1,
    impactoInherente: item.impactoInherente || 1,
    probabilidadResidual,
    impactoResidual,
    efectividad,
    perfilResidual: getPerfilLabel(scoreResidual)
  };
}
 
export default function Measurements() {
  const [riesgosRaw, setRiesgosRaw] = useState<RiesgoMatrizRow[]>(() => cargarRiesgosDesdeStorage());
  const [controles, setControles] = useState<ControlRow[]>(() => cargarControlesDesdeStorage());
  const [filterProceso, setFilterProceso] = useState<string>("TODOS");
  const [filterFactor, setFilterFactor] = useState<string>("TODOS");
 
  // Refresca riesgos y catálogo de controles desde localStorage.
  const recargarDatos = useCallback(() => {
    setRiesgosRaw(cargarRiesgosDesdeStorage());
    setControles(cargarControlesDesdeStorage());
  }, []);
 
  useEffect(() => {
    // Carga inicial (por si el componente se monta después del primer render).
    recargarDatos();
 
    // Matrix.tsx y Controls.tsx disparan estos eventos al guardar cambios.
    window.addEventListener("laft-data-updated", recargarDatos);
    window.addEventListener("laft_params_updated", recargarDatos);
    // "storage" cubre cambios hechos desde otra pestaña/ventana.
    window.addEventListener("storage", recargarDatos);
    // Refresca también al volver a enfocar la ventana/pestaña.
    window.addEventListener("focus", recargarDatos);
 
    // Respaldo por si algún guardado no disparara el evento correctamente.
    const intervalo = setInterval(recargarDatos, 1500);
 
    return () => {
      window.removeEventListener("laft-data-updated", recargarDatos);
      window.removeEventListener("laft_params_updated", recargarDatos);
      window.removeEventListener("storage", recargarDatos);
      window.removeEventListener("focus", recargarDatos);
      clearInterval(intervalo);
    };
  }, [recargarDatos]);
 
  // Riesgos ya medidos (efectividad + perfil residual calculados en vivo).
  const riesgos: RiesgoMedido[] = riesgosRaw.map((r) => calcularMedicion(r, controles));
 
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
    ? (filteredRiesgos.reduce((acc, r) => acc + (r.probabilidadResidual * r.impactoResidual), 0) / totalRiesgos).toFixed(1)
    : "0.0";
 
  // Conteo por niveles de perfil (Residual)
  const residualCounts = {
    ACEPTABLE: 0,
    TOLERABLE: 0,
    MODERADO: 0,
    CRITICO: 0
  };
 
  filteredRiesgos.forEach((r) => {
    const score = r.probabilidadResidual * r.impactoResidual;
    if (score >= 15) residualCounts.CRITICO++;
    else if (score >= 10) residualCounts.MODERADO++;
    else if (score >= 5) residualCounts.TOLERABLE++;
    else residualCounts.ACEPTABLE++;
  });
 
  // Conteo Mapa de Calor 5x5 (Probabilidad vs Impacto - Residual)
  const heatmapData: Record<string, number> = {};
  filteredRiesgos.forEach((r) => {
    const p = r.probabilidadResidual;
    const i = r.impactoResidual;
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
              El valor del perfil residual resulta de la probabilidad residual por el impacto residual tras la ponderación de los controles aplicados.
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
                const scoreRes = r.probabilidadResidual * r.impactoResidual;
 
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
                      {scoreRes} ({r.probabilidadResidual}x{r.impactoResidual})
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${getRiskScoreColor(scoreRes)}`}>
                        {r.perfilResidual}
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