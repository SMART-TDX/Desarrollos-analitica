import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit3, Search, X, AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";
import { CONTROLES_OFICIALES, calcularPonderacion } from "./Controls";
import { RIESGOS_INICIALES, calcularMitigacionMultiple, RiesgoRow } from "./Matrix";

export interface EventoRow {
  id: string;
  codigo: string;
  tipo: string; // LAFT, REPS, TEC, FADM
  factor: string; // CLI, EMP, PRV, TEC
  etapa: string; // VIN, POR, LUN, AIRE LIBRE, ESTAFA
  descripcion: string;
  codigoRiesgo: string; // Ej: R-LAFT-001
  codigoControl: string; // Ej: CTR-LAFT-27
  probabilidad: number; // 1 - 5
  impacto: number; // 1 - 5
  apetito: number;
  estado: "Prioritario" | "Controlado" | "En seguimiento";
  creado: string;
}

const EVENTOS_INICIALES: EventoRow[] = [
  {
    id: "evt-1",
    codigo: "EVENTO-1",
    tipo: "LAFT",
    factor: "CLI",
    etapa: "VIN",
    descripcion: "Documento auténtico obtenido de fuente ilícita o falsificado en debida diligencia.",
    codigoRiesgo: "R-LAFT-001",
    codigoControl: "CTR-LAFT-01",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "Prioritario",
    creado: "21/7/2026"
  },
  {
    id: "evt-10",
    codigo: "EVENTO-10",
    tipo: "REPS",
    factor: "CLI",
    etapa: "POR",
    descripcion: "Relación indirecta con investigaciones de listas o noticias restrictivas.",
    codigoRiesgo: "R-LAFT-002",
    codigoControl: "CTR-LAFT-01",
    probabilidad: 1,
    impacto: 3,
    apetito: 2,
    estado: "Controlado",
    creado: "21/7/2026"
  },
  {
    id: "evt-11",
    codigo: "EVENTO-11",
    tipo: "LAFT",
    factor: "EMP",
    etapa: "LUN",
    descripcion: "Omisión deliberada de Reporte de Operación Sospechosa (ROS).",
    codigoRiesgo: "R-LAFT-002",
    codigoControl: "CTR-LAFT-07",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "Prioritario",
    creado: "21/7/2026"
  },
  {
    id: "evt-17",
    codigo: "EVENTO-17",
    tipo: "TEC",
    factor: "TEC",
    etapa: "AIRE LIBRE",
    descripcion: "Incumplimiento de Debida Diligencia por fallas continuas en la plataforma tecnológica.",
    codigoRiesgo: "R-LAFT-003",
    codigoControl: "CTR-LAFT-27",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "En seguimiento",
    creado: "21/7/2026"
  },
  {
    id: "evt-2",
    codigo: "EVENTO-2",
    tipo: "LAFT",
    factor: "EMP",
    etapa: "LUN",
    descripcion: "Empleado facilita operación sospechosa omitiendo controles obligatorios.",
    codigoRiesgo: "R-LAFT-001",
    codigoControl: "CTR-LAFT-11",
    probabilidad: 2,
    impacto: 4,
    apetito: 2,
    estado: "Prioritario",
    creado: "21/7/2026"
  },
  {
    id: "evt-3",
    codigo: "EVENTO-3",
    tipo: "LAFT",
    factor: "PRV",
    etapa: "ESTAFA",
    descripcion: "Proveedor incluido en listas restrictivas o vinculados a procesos sancionatorios.",
    codigoRiesgo: "R-LAFT-003",
    codigoControl: "CTR-LAFT-12",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "Controlado",
    creado: "21/7/2026"
  },
  {
    id: "evt-4",
    codigo: "EVENTO-4",
    tipo: "REPS",
    factor: "CLI",
    etapa: "POR",
    descripcion: "Estudiante o cliente vinculado a caso de investigación judicial de conocimiento público.",
    codigoRiesgo: "R-LAFT-004",
    codigoControl: "CTR-LAFT-27",
    probabilidad: 1,
    impacto: 3,
    apetito: 2,
    estado: "Controlado",
    creado: "21/7/2026"
  }
];

const STORAGE_KEYS = ["laft_eventos_v1", "laft_eventos", "laft_matriz_eventos"];

export default function Events() {
  const [eventos, setEventos] = useState<EventoRow[]>(() => {
    for (const key of STORAGE_KEYS) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return EVENTOS_INICIALES;
  });

  const [riesgosMatriz, setRiesgosMatriz] = useState<RiesgoRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_matriz_riesgos_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return RIESGOS_INICIALES;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<EventoRow | null>(null);

  // Modal Form State
  const [formData, setFormData] = useState<Partial<EventoRow>>({
    codigo: "",
    tipo: "LAFT",
    factor: "CLI",
    etapa: "VIN",
    descripcion: "",
    codigoRiesgo: "R-LAFT-001",
    codigoControl: "CTR-LAFT-01",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "Prioritario"
  });

  // Guardar en LocalStorage y notificar al Mapa de Calor en tiempo real
  const guardarEventos = (nuevosEventos: EventoRow[]) => {
    setEventos(nuevosEventos);
    STORAGE_KEYS.forEach(key => {
      localStorage.setItem(key, JSON.stringify(nuevosEventos));
    });
    window.dispatchEvent(new Event("laft-data-updated"));
    window.dispatchEvent(new Event("storage"));
  };

  // Helper para obtener datos del Riesgo Vinculado (Perfil Residual)
  const getInfoRiesgoResidual = (codRiesgo: string) => {
    const codLimpio = (codRiesgo || "").replace("-", "").toUpperCase();
    const riesgo = riesgosMatriz.find(r => (r.codigo || "").replace("-", "").toUpperCase() === codLimpio);

    if (!riesgo) return { pRes: 1, iRes: 1, nivelRes: 1 };

    const pInh = riesgo.probabilidadInherente || 1;
    const iInh = riesgo.impactoInherente || 1;
    const itemCodigos = Array.isArray(riesgo.controlCodigos) ? riesgo.controlCodigos : [];
    const controlesAsignados = CONTROLES_OFICIALES.filter(c => itemCodigos.includes(c.codigo));
    const ponderaciones = controlesAsignados.map(c =>
      calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad)
    );
    const mitigacion = calcularMitigacionMultiple(ponderaciones);
    const inhScore = pInh * iInh;
    const resScore = Math.max(1, Math.round(inhScore * (1 - mitigacion / 100)));

    const pRes = Math.min(pInh, Math.max(1, Math.ceil(resScore / iInh)));
    const iRes = Math.min(iInh, Math.max(1, Math.round(resScore / pRes)));

    return { pRes, iRes, nivelRes: pRes * iRes };
  };

  // Helper para obtener mitigación teórica del control asignado
  const getMitigacionControl = (codControl: string) => {
    const codLimpio = (codControl || "").replace("-", "").toUpperCase();
    const ctrl = CONTROLES_OFICIALES.find(c => (c.codigo || "").replace("-", "").toUpperCase() === codLimpio);
    if (!ctrl) return 39; // Valor base por defecto
    const pond = calcularPonderacion(ctrl.clase, ctrl.tipo, ctrl.frecuencia, ctrl.formalidad);
    return Math.round(pond * 100) / 100;
  };

  const handleOpenModal = (evt?: EventoRow) => {
    if (evt) {
      setEditingEvento(evt);
      setFormData(evt);
    } else {
      setEditingEvento(null);
      setFormData({
        codigo: `EVENTO-${eventos.length + 1}`,
        tipo: "LAFT",
        factor: "CLI",
        etapa: "VIN",
        descripcion: "",
        codigoRiesgo: "R-LAFT-001",
        codigoControl: "CTR-LAFT-01",
        probabilidad: 2,
        impacto: 3,
        apetito: 2,
        estado: "Prioritario"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.descripcion) return;

    let actualizados: EventoRow[];
    if (editingEvento) {
      actualizados = eventos.map(e => (e.id === editingEvento.id ? ({ ...e, ...formData } as EventoRow) : e));
    } else {
      const nuevo: EventoRow = {
        id: `evt-${Date.now()}`,
        codigo: formData.codigo || `EVENTO-${eventos.length + 1}`,
        tipo: formData.tipo || "LAFT",
        factor: formData.factor || "CLI",
        etapa: formData.etapa || "VIN",
        descripcion: formData.descripcion || "",
        codigoRiesgo: formData.codigoRiesgo || "R-LAFT-001",
        codigoControl: formData.codigoControl || "CTR-LAFT-01",
        probabilidad: Number(formData.probabilidad) || 1,
        impacto: Number(formData.impacto) || 1,
        apetito: Number(formData.apetito) || 2,
        estado: (formData.estado as any) || "Prioritario",
        creado: new Date().toLocaleDateString("es-CO")
      };
      actualizados = [nuevo, ...eventos];
    }

    guardarEventos(actualizados);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este evento de riesgo?")) {
      const filtrados = eventos.filter(e => e.id !== id);
      guardarEventos(filtrados);
    }
  };

  const eventosFiltrados = eventos.filter(
    e =>
      e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.codigoRiesgo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.codigoControl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Prioritario":
        return "bg-rose-100 text-rose-700 border-rose-300";
      case "Controlado":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "En seguimiento":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Eventos de Riesgo SAGRILAFT</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro consolidado de eventos de riesgo, vinculación de controles y cálculo de brechas
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Buscador */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, descripción, riesgo o control..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Eventos: <span className="text-slate-900 font-bold">{eventosFiltrados.length}</span>
        </div>
      </div>

      {/* Tabla Principal con Brechas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-3">Código</th>
              <th className="py-3.5 px-2">Tipo</th>
              <th className="py-3.5 px-2">Factor</th>
              <th className="py-3.5 px-2">Etapa</th>
              <th className="py-3.5 px-3 min-w-[220px]">Evento / Descripción</th>
              <th className="py-3.5 px-3 bg-teal-50/70 text-teal-900 border-x border-teal-100">Riesgo Vinculado</th>
              <th className="py-3.5 px-3 bg-amber-50/70 text-amber-900 border-r border-amber-100">Control Aplicado</th>
              <th className="py-3.5 px-2 text-center">P</th>
              <th className="py-3.5 px-2 text-center">I</th>
              <th className="py-3.5 px-2 text-center font-extrabold text-slate-900">Nivel</th>
              <th className="py-3.5 px-2 text-center">Apetito</th>
              <th className="py-3.5 px-3 text-center bg-rose-50/50 text-rose-900">Brecha Riesgo</th>
              <th className="py-3.5 px-3 text-center bg-orange-50/50 text-orange-900">Brecha Control</th>
              <th className="py-3.5 px-3 text-center">Estado</th>
              <th className="py-3.5 px-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {eventosFiltrados.map(evt => {
              const nivelEvt = evt.probabilidad * evt.impacto;
              const { pRes, iRes, nivelRes } = getInfoRiesgoResidual(evt.codigoRiesgo);
              const mitigacionTeorica = getMitigacionControl(evt.codigoControl);

              // Cálculo de Brechas
              const brechaRiesgoNivel = nivelEvt - nivelRes;
              const brechaControlPct = Math.round((nivelEvt / Math.max(1, nivelRes)) * 200); // % de desviación / sobrecosto de severidad

              return (
                <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{evt.codigo}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 text-slate-700">
                      {evt.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-semibold text-slate-600">{evt.factor}</td>
                  <td className="py-3 px-2 font-semibold text-slate-600">{evt.etapa}</td>
                  <td className="py-3 px-3 text-slate-800 leading-relaxed">{evt.descripcion}</td>

                  {/* Código Riesgo Vinculado */}
                  <td className="py-3 px-3 bg-teal-50/30 border-x border-teal-100/50">
                    <div className="flex flex-col">
                      <span className="inline-block px-2 py-0.5 rounded border border-teal-200 bg-teal-100/70 text-teal-900 font-bold font-mono text-[11px] w-max">
                        {evt.codigoRiesgo}
                      </span>
                      <span className="text-[10px] text-teal-700 font-semibold mt-0.5">
                        Nivel Residual: {nivelRes} ($P={pRes}, I={iRes}$)
                      </span>
                    </div>
                  </td>

                  {/* Código Control Aplicado */}
                  <td className="py-3 px-3 bg-amber-50/30 border-r border-amber-100/50">
                    <div className="flex flex-col">
                      <span className="inline-block px-2 py-0.5 rounded border border-amber-300 bg-amber-100/80 text-amber-950 font-bold font-mono text-[11px] w-max">
                        {evt.codigoControl}
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold mt-0.5">
                        Mitigación: {mitigacionTeorica}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-center font-bold">{evt.probabilidad}</td>
                  <td className="py-3 px-2 text-center font-bold">{evt.impacto}</td>
                  <td className="py-3 px-2 text-center">
                    <span className="font-extrabold text-rose-600 text-sm">{nivelEvt}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-slate-500">{evt.apetito}</td>

                  {/* Columna Brecha Riesgo */}
                  <td className="py-3 px-3 text-center bg-rose-50/30">
                    <span
                      className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${
                        brechaRiesgoNivel > 0
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {brechaRiesgoNivel > 0 ? `+${brechaRiesgoNivel}` : brechaRiesgoNivel}
                    </span>
                  </td>

                  {/* Columna Brecha Control */}
                  <td className="py-3 px-3 text-center bg-orange-50/30">
                    <span className="inline-block px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px]">
                      {brechaControlPct},00%
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getEstadoBadge(
                        evt.estado
                      )}`}
                    >
                      {evt.estado}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenModal(evt)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id)}
                        className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {eventosFiltrados.length === 0 && (
              <tr>
                <td colSpan={15} className="py-8 text-center text-slate-400 font-medium">
                  No se encontraron eventos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingEvento ? "Editar Evento de Riesgo" : "Registrar Nuevo Evento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código Evento</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo || ""}
                    onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo || "LAFT"}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="LAFT">LAFT</option>
                    <option value="REPS">REPS</option>
                    <option value="TEC">TEC</option>
                    <option value="FADM">FADM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Factor</label>
                  <input
                    type="text"
                    value={formData.factor || ""}
                    onChange={e => setFormData({ ...formData, factor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                    placeholder="CLI, EMP, PRV"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Etapa</label>
                  <input
                    type="text"
                    value={formData.etapa || ""}
                    onChange={e => setFormData({ ...formData, etapa: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                    placeholder="VIN, POR, LUN"
                  />
                </div>
              </div>

              {/* Riesgo y Control Vinculados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-bold text-teal-900 mb-1">Riesgo Vinculado (Matriz)</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoRiesgo || ""}
                    onChange={e => setFormData({ ...formData, codigoRiesgo: e.target.value })}
                    className="w-full p-2 border border-teal-300 rounded bg-white font-mono font-bold text-teal-900"
                    placeholder="Ej: R-LAFT-001"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">Control Aplicado</label>
                  <input
                    type="text"
                    required
                    value={formData.codigoControl || ""}
                    onChange={e => setFormData({ ...formData, codigoControl: e.target.value })}
                    className="w-full p-2 border border-amber-300 rounded bg-white font-mono font-bold text-amber-950"
                    placeholder="Ej: CTR-LAFT-27"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evento / Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion || ""}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Probabilidad (P)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.probabilidad || 1}
                    onChange={e => setFormData({ ...formData, probabilidad: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Impacto (I)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.impacto || 1}
                    onChange={e => setFormData({ ...formData, impacto: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apetito</label>
                  <input
                    type="number"
                    value={formData.apetito || 2}
                    onChange={e => setFormData({ ...formData, apetito: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado || "Prioritario"}
                    onChange={e => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="Prioritario">Prioritario</option>
                    <option value="Controlado">Controlado</option>
                    <option value="En seguimiento">En seguimiento</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-sm"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}