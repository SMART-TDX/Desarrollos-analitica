import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { RIESGOS_INICIALES, RiesgoRow, calcularMitigacionMultiple } from "./Matrix";
import { CONTROLES_OFICIALES, ControlRow, calcularPonderacion } from "./Controls";

// Lectura prioritaria de la llave activa v3
const obtenerRiesgos = (): RiesgoRow[] => {
  try {
    const saved = localStorage.getItem("laft_matriz_riesgos_v3");
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  // Fallback solo si no existe la versión 3
  const fallbackKeys = ["laft_matriz_riesgos_v2", "laft_matriz_riesgos", "laft_riesgos"];
  for (const key of fallbackKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return Array.isArray(RIESGOS_INICIALES) ? RIESGOS_INICIALES : [];
};

const obtenerControles = (): ControlRow[] => {
  try {
    const saved = localStorage.getItem("laft_controles_v3");
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  const fallbackKeys = ["laft_controles_v2", "laft_controles_v1", "laft_controles"];
  for (const key of fallbackKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return Array.isArray(CONTROLES_OFICIALES) ? CONTROLES_OFICIALES : [];
};

const obtenerEventos = (): any[] => {
  const keys = ["laft_eventos_v1", "laft_eventos", "laft_matriz_eventos"];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
};

export default function Dashboard() {
  const [riesgos, setRiesgos] = useState<RiesgoRow[]>(obtenerRiesgos);
  const [controles, setControles] = useState<ControlRow[]>(obtenerControles);
  const [eventos, setEventos] = useState<any[]>(obtenerEventos);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const recargarTodo = useCallback(() => {
    setRiesgos(obtenerRiesgos());
    setControles(obtenerControles());
    setEventos(obtenerEventos());
  }, []);

  useEffect(() => {
    recargarTodo();

    const handleUpdate = () => recargarTodo();

    window.addEventListener("laft-data-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("laft-data-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [recargarTodo]);

  // Botón Actualizar Datos en Tiempo Real
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    recargarTodo();
    window.dispatchEvent(new CustomEvent("laft-data-updated"));

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // CÁLCULOS DE MÉTRICAS
  const perfilCounts = {
    Tolerable: 0,
    Moderado: 0,
    Importante: 0,
    Critico: 0
  };

  riesgos.forEach(r => {
    const pInh = r.probabilidadInherente || 1;
    const iInh = r.impactoInherente || 1;
    const codigosAsignados = Array.isArray(r.controlCodigos) ? r.controlCodigos : [];

    const ctrlsVinculados = controles.filter(c => codigosAsignados.includes(c.codigo));
    const ponderaciones = ctrlsVinculados.map(c =>
      calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad)
    );
    const mitigacionPct = calcularMitigacionMultiple(ponderaciones);

    const inhScore = pInh * iInh;
    const residualScore = Math.max(1, Math.round(inhScore * (1 - mitigacionPct / 100)));

    if (residualScore >= 16) perfilCounts.Critico++;
    else if (residualScore >= 12) perfilCounts.Importante++;
    else if (residualScore >= 6) perfilCounts.Moderado++;
    else perfilCounts.Tolerable++;
  });

  const procesosMap: Record<string, number> = {};
  riesgos.forEach(r => {
    const proc = r.proceso && r.proceso.trim() !== "" ? r.proceso : "Sin Clasificar";
    procesosMap[proc] = (procesosMap[proc] || 0) + 1;
  });

  const totalRiesgos = riesgos.length;
  const totalControlesActivos = controles.length;
  const totalEventos = eventos.length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Consolidado</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resumen en tiempo real de la matriz de riesgos Sagrlaft
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-all shadow-xs cursor-pointer border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-teal-600" : ""}`} />
          {isRefreshing ? "Actualizando..." : "Actualizar Datos"}
        </button>
      </div>

      {/* Tarjetas de Métricas (Ajustadas a 3 columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Riesgos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Riesgos</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalRiesgos}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Total Controles */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Controles</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalControlesActivos}</div>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              {totalControlesActivos} activos
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Eventos Registrados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-slate-500">Eventos Registrados</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalEventos}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gráficos y Desgloses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil Residual */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800">
            Distribución de Riesgos por Perfil Residual
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {totalRiesgos > 0 && (
                  <path
                    className="text-amber-500 transition-all duration-500"
                    strokeDasharray={`${(perfilCounts.Tolerable / totalRiesgos) * 100}, 100`}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900">{totalRiesgos}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Riesgos Total
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600 font-medium">Tolerable (1-5)</span>
                </div>
                <span className="font-bold text-slate-900">{perfilCounts.Tolerable}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-slate-600 font-medium">Moderado (6-11)</span>
                </div>
                <span className="font-bold text-slate-900">{perfilCounts.Moderado}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
                  <span className="text-slate-600 font-medium">Importante (12-15)</span>
                </div>
                <span className="font-bold text-slate-900">{perfilCounts.Importante}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                  <span className="text-slate-600 font-medium">Crítico (16-25)</span>
                </div>
                <span className="font-bold text-slate-900">{perfilCounts.Critico}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Riesgos por Proceso */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Riesgos por Proceso</h2>

          <div className="space-y-3 pt-2">
            {Object.entries(procesosMap).map(([procesoName, count]) => (
              <div
                key={procesoName}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span className="text-xs font-semibold text-slate-700">{procesoName}</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-slate-200 text-slate-800 rounded-full">
                  {count}
                </span>
              </div>
            ))}

            {Object.keys(procesosMap).length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay procesos ni riesgos clasificados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}