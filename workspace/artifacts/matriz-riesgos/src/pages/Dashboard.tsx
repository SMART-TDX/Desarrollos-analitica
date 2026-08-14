import React, { useState, useEffect, useCallback } from "react";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { ControlRow, CONTROLES_OFICIALES } from "./Controls";

// Tipos para Riesgos y Eventos
interface RiesgoRow {
  id: string;
  probabilidadInherente?: number;
  impactoInherente?: number;
}

interface EventoRow {
  id: string;
  estado?: string;
}

// 1. OBTENER CONTROLES APUNTANDO DIRECTAMENTE A V4
const obtenerControlesActuales = (): ControlRow[] => {
  try {
    const saved = localStorage.getItem("laft_catalogo_controles_v4");
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error al leer controles en Dashboard:", e);
  }

  // Fallbacks secundarios si no existe v4
  const fallbackKeys = [
    "laft_catalogo_controles_v3", 
    "laft_controles_v3", 
    "laft_controles_v2", 
    "laft_controles_v1", 
    "laft_controles"
  ];

  for (const key of fallbackKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
  }

  return Array.isArray(CONTROLES_OFICIALES) ? CONTROLES_OFICIALES : [];
};

// 2. OBTENER RIESGOS
const obtenerRiesgosActuales = (): RiesgoRow[] => {
  const keys = [
    "laft_matriz_riesgos_v4", 
    "laft_matriz_riesgos_v3", 
    "laft_matriz_riesgos_v2", 
    "laft_matriz_riesgos", 
    "laft_riesgos"
  ];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
};

// 3. OBTENER EVENTOS
const obtenerEventosActuales = (): EventoRow[] => {
  const keys = ["laft_eventos_v1", "laft_eventos", "laft_matriz_eventos"];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
  }
  return [];
};

export default function Dashboard() {
  const [controles, setControles] = useState<ControlRow[]>(obtenerControlesActuales);
  const [riesgos, setRiesgos] = useState<RiesgoRow[]>(obtenerRiesgosActuales);
  const [eventos, setEventos] = useState<EventoRow[]>(obtenerEventosActuales);

  // Recarga sincronizada
  const recargarMetricas = useCallback(() => {
    setControles(obtenerControlesActuales());
    setRiesgos(obtenerRiesgosActuales());
    setEventos(obtenerEventosActuales());
  }, []);

  useEffect(() => {
    recargarMetricas();

    const handleUpdate = () => recargarMetricas();

    window.addEventListener("laft-data-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("laft-data-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [recargarMetricas]);

  // Indicadores
  const totalControles = controles.length;
  const controlesPreventivos = controles.filter((c) => c.clase === "Preventivo").length;

  const totalRiesgos = riesgos.length;
  const riesgosAltos = riesgos.filter(
    (r) => (r.probabilidadInherente || 0) * (r.impactoInherente || 0) >= 12
  ).length;

  const totalEventos = eventos.length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Dashboard */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard de Control SAGRILAFT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Resumen de indicadores clave de Riesgos, Controles y Eventos
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En Sincronía Real
          </span>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD CONTROLES - AHORA TOTALMENTE SINCRONIZADA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Controles</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{totalControles}</h2>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-emerald-600">{totalControles} activos</span> en catálogo
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Controles Preventivos:</span>
            <span className="font-bold text-slate-800">{controlesPreventivos}</span>
          </div>
        </div>

        {/* CARD RIESGOS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Riesgos</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{totalRiesgos}</h2>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-amber-600">{riesgosAltos} en nivel Alto/Crítico</span>
              </p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Registrados en Matriz:</span>
            <span className="font-bold text-slate-800">{totalRiesgos}</span>
          </div>
        </div>

        {/* CARD EVENTOS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Eventos</p>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{totalEventos}</h2>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-600">Eventos materializados</span>
              </p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Registrados:</span>
            <span className="font-bold text-slate-800">{totalEventos}</span>
          </div>
        </div>
      </div>
    </div>
  );
}