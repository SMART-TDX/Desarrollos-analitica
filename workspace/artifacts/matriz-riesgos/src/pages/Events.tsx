import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit3, X, AlertTriangle, Shield, CheckCircle } from "lucide-react";

// Tipos de datos
export interface EventoRow {
  id: string;
  codigoEvento: string;
  tipoEvento: string;
  tipoIncidencia: string;
  factor: string;
  etapa: string;
  riesgoVinculado: string;
  controlAplicado: string;
  descripcion: string;
  probabilidad: number;
  impacto: number;
  apetito: number;
  estado: string;
}

interface OptionItem {
  codigo: string;
  nombre: string;
}

// 1. Obtener Controles sincronizado con Controls.tsx (v4)
const obtenerControlesActuales = (): OptionItem[] => {
  try {
    const saved = localStorage.getItem("laft_catalogo_controles_v4");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => ({
          codigo: c.codigo || c.id || "CTR",
          nombre: c.control || c.nombre || "Control sin nombre"
        }));
      }
    }
  } catch (e) {
    console.error("Error al leer controles en Eventos:", e);
  }

  // Fallbacks de seguridad
  const fallbackKeys = ["laft_catalogo_controles_v3", "laft_controles_v3", "laft_controles"];
  for (const key of fallbackKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            codigo: c.codigo || c.id || "CTR",
            nombre: c.control || c.nombre || "Control sin nombre"
          }));
        }
      }
    } catch (e) {}
  }
  return [];
};

// 2. Obtener Riesgos de la Matriz (v4)
const obtenerRiesgosActuales = (): OptionItem[] => {
  const keys = ["laft_matriz_riesgos_v4", "laft_matriz_riesgos_v3", "laft_matriz_riesgos", "laft_riesgos"];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => ({
            codigo: r.codigo || r.idRiesgo || r.id || "RIESGO",
            nombre: r.riesgo || r.nombre || r.descripcion || "Riesgo sin nombre"
          }));
        }
      }
    } catch (e) {}
  }
  return [];
};

export default function Events() {
  const [eventos, setEventos] = useState<EventoRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_eventos_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [controlesOptions, setControlesOptions] = useState<OptionItem[]>(obtenerControlesActuales);
  const [riesgosOptions, setRiesgosOptions] = useState<OptionItem[]>(obtenerRiesgosActuales);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario del Modal
  const [formData, setFormData] = useState<EventoRow>({
    id: "",
    codigoEvento: `EVENTO-${eventos.length + 1}`,
    tipoEvento: "LAFT",
    tipoIncidencia: "Operativa",
    factor: "CLI",
    etapa: "VIN",
    riesgoVinculado: "",
    controlAplicado: "",
    descripcion: "",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "Prioritario"
  });

  // Cargar y sincronizar datos reales
  const recargarSincronizacion = useCallback(() => {
    const cOptions = obtenerControlesActuales();
    const rOptions = obtenerRiesgosActuales();

    setControlesOptions(cOptions);
    setRiesgosOptions(rOptions);

    // Ajustar seleccionados por defecto si el formulario está abierto
    setFormData(prev => ({
      ...prev,
      riesgoVinculado: prev.riesgoVinculado || (rOptions.length > 0 ? `${rOptions[0].codigo} - ${rOptions[0].nombre}` : ""),
      controlAplicado: prev.controlAplicado || (cOptions.length > 0 ? `${cOptions[0].codigo} - ${cOptions[0].nombre}` : "")
    }));
  }, []);

  useEffect(() => {
    recargarSincronizacion();

    const handleUpdate = () => recargarSincronizacion();

    window.addEventListener("laft-data-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("laft-data-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [recargarSincronizacion]);

  // Guardar eventos
  useEffect(() => {
    localStorage.setItem("laft_eventos_v1", JSON.stringify(eventos));
    window.dispatchEvent(new CustomEvent("laft-data-updated"));
  }, [eventos]);

  const handleOpenModal = () => {
    recargarSincronizacion();
    setEditingId(null);
    setFormData({
      id: "",
      codigoEvento: `EVENTO-${eventos.length + 1}`,
      tipoEvento: "LAFT",
      tipoIncidencia: "Operativa",
      factor: "CLI",
      etapa: "VIN",
      riesgoVinculado: riesgosOptions.length > 0 ? `${riesgosOptions[0].codigo} - ${riesgosOptions[0].nombre}` : "",
      controlAplicado: controlesOptions.length > 0 ? `${controlesOptions[0].codigo} - ${controlesOptions[0].nombre}` : "",
      descripcion: "",
      probabilidad: 2,
      impacto: 3,
      apetito: 2,
      estado: "Prioritario"
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: EventoRow) => {
    recargarSincronizacion();
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este evento de riesgo?")) {
      setEventos(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEventos(prev => prev.map(ev => ev.id === editingId ? formData : ev));
    } else {
      setEventos(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registro de Eventos Materializados</h1>
            <p className="text-xs text-slate-500">Gestión e incidencias asociadas a Controles y Riesgos LAFT</p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </button>
      </div>

      {/* Tabla de Eventos Registrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <th className="p-3">Código</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Incidencia</th>
              <th className="p-3">Riesgo Vinculado</th>
              <th className="p-3">Control Aplicado</th>
              <th className="p-3">Descripción</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {eventos.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                  No hay eventos registrados. Haz clic en "Nuevo Evento" para registrar uno.
                </td>
              </tr>
            ) : (
              eventos.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{e.codigoEvento}</td>
                  <td className="p-3">{e.tipoEvento}</td>
                  <td className="p-3">{e.tipoIncidencia}</td>
                  <td className="p-3 max-w-[200px] truncate text-slate-700">{e.riesgoVinculado || "N/A"}</td>
                  <td className="p-3 max-w-[200px] truncate text-slate-700">{e.controlAplicado || "N/A"}</td>
                  <td className="p-3 max-w-[250px] truncate">{e.descripcion || "Sin descripción"}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {e.estado}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(e)} className="p-1 text-slate-500 hover:text-teal-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CONECTADO CON CATALOGOS V4 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? "Editar Evento" : "Registrar Nuevo Evento"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario Modal */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              {/* Fila 1 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Evento</label>
                  <input
                    type="text"
                    value={formData.codigoEvento}
                    onChange={(e) => setFormData({ ...formData, codigoEvento: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo Evento</label>
                  <select
                    value={formData.tipoEvento}
                    onChange={(e) => setFormData({ ...formData, tipoEvento: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="LAFT">LAFT</option>
                    <option value="PAD">PAD</option>
                    <option value="CORRUPCION">CORRUPCIÓN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo Incidencia</label>
                  <select
                    value={formData.tipoIncidencia}
                    onChange={(e) => setFormData({ ...formData, tipoIncidencia: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Operativa">Operativa</option>
                    <option value="Legal">Legal</option>
                    <option value="Reputacional">Reputacional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Factor</label>
                  <input
                    type="text"
                    value={formData.factor}
                    onChange={(e) => setFormData({ ...formData, factor: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                    placeholder="CLI"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Etapa</label>
                  <input
                    type="text"
                    value={formData.etapa}
                    onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                    placeholder="VIN"
                  />
                </div>
              </div>

              {/* Fila 2: Riesgo Vinculado y Control Aplicado (Totalmente dinámicos) */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-amber-900 mb-1.5">
                    Riesgo Vinculado ({riesgosOptions.length})
                  </label>
                  <select
                    value={formData.riesgoVinculado}
                    onChange={(e) => setFormData({ ...formData, riesgoVinculado: e.target.value })}
                    className="w-full p-2.5 border border-amber-200 rounded-lg bg-white text-amber-900 font-medium"
                  >
                    {riesgosOptions.length === 0 ? (
                      <option value="">No hay riesgos registrados</option>
                    ) : (
                      riesgosOptions.map((r) => {
                        const val = `${r.codigo} - ${r.nombre}`;
                        return (
                          <option key={r.codigo} value={val}>
                            {val}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1.5">
                    Control Aplicado (Lista Activa: {controlesOptions.length})
                  </label>
                  <select
                    value={formData.controlAplicado}
                    onChange={(e) => setFormData({ ...formData, controlAplicado: e.target.value })}
                    className="w-full p-2.5 border border-amber-200 rounded-lg bg-white text-amber-900 font-medium"
                  >
                    {controlesOptions.length === 0 ? (
                      <option value="">No hay controles registrados en el catálogo</option>
                    ) : (
                      controlesOptions.map((c) => {
                        const val = `${c.codigo} - ${c.nombre}`;
                        return (
                          <option key={c.codigo} value={val}>
                            {val}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              </div>

              {/* Fila 3: Descripción */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evento / Descripción</label>
                <textarea
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white resize-none"
                  placeholder="Detalle los hechos del evento registrado..."
                ></textarea>
              </div>

              {/* Fila 4: Métricas y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Probabilidad (P)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.probabilidad}
                    onChange={(e) => setFormData({ ...formData, probabilidad: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Impacto (I)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.impacto}
                    onChange={(e) => setFormData({ ...formData, impacto: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apetito</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.apetito}
                    onChange={(e) => setFormData({ ...formData, apetito: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800"
                  >
                    <option value="Prioritario">Prioritario</option>
                    <option value="En Gestión">En Gestión</option>
                    <option value="Mitigado">Mitigado</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
              </div>

              {/* Footer Acciones */}
              <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors shadow-xs"
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