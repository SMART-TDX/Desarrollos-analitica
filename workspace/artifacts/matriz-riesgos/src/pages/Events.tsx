import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit3, X, AlertTriangle, Shield, CheckCircle, RefreshCw } from "lucide-react";

// Estructura de Evento con métricas de Brecha
export interface EventoRow {
  id: string;
  codigoEvento: string;
  tipoEvento: string;
  tipoIncidencia: string;
  riesgoVinculado: string;
  controlAplicado: string;
  descripcion: string;

  probabilidadEvento: number;
  impactoEvento: number;
  nivelEvento: number;

  probabilidadResidual: number;
  impactoResidual: number;
  nivelResidual: number;

  brechaRiesgo: number;
}

interface RiesgoItem {
  codigo: string;
  nombre: string;
  probabilidadResidual: number;
  impactoResidual: number;
}

interface ControlItem {
  codigo: string;
  nombre: string;
}

// 1. Lectura Ultra Segura de Riesgos
const obtenerRiesgosActuales = (): RiesgoItem[] => {
  const keys = ["laft_matriz_riesgos_v4", "laft_matriz_riesgos_v3", "laft_matriz_riesgos", "laft_riesgos"];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((r: any) => r && typeof r === "object")
            .map((r: any) => ({
              codigo: String(r?.codigo || r?.idRiesgo || r?.id || "R-LAFT-001"),
              nombre: String(r?.riesgo || r?.nombre || r?.descripcion || "Riesgo sin nombre"),
              probabilidadResidual: Number(r?.probabilidadResidual) || Number(r?.probabilidadInherente) || 2,
              impactoResidual: Number(r?.impactoResidual) || Number(r?.impactoInherente) || 3
            }));
        }
      }
    } catch (e) {
      console.warn("Error leyendo riesgos en Eventos:", e);
    }
  }

  return [
    { codigo: "R-LAFT-001", nombre: "Vinculación de clientes o contrapartes en listas de sanción", probabilidadResidual: 2, impactoResidual: 3 },
    { codigo: "R-LAFT-002", nombre: "Operaciones inusuales no detectadas en el sistema de monitoreo", probabilidadResidual: 2, impactoResidual: 2 },
    { codigo: "R-LAFT-003", nombre: "Uso de productos para lavado de activos", probabilidadResidual: 1, impactoResidual: 4 }
  ];
};

// 2. Lectura Ultra Segura de Controles
const obtenerControlesActuales = (): ControlItem[] => {
  const keys = ["laft_catalogo_controles_v4", "laft_catalogo_controles_v3", "laft_controles"];
  for (const key of keys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((c: any) => c && typeof c === "object")
            .map((c: any) => ({
              codigo: String(c?.codigo || c?.id || "CTR-LAFT-01"),
              nombre: String(c?.control || c?.nombre || "Control sin nombre")
            }));
        }
      }
    } catch (e) {
      console.warn("Error leyendo controles en Eventos:", e);
    }
  }

  return [
    { codigo: "CTR-LAFT-01", nombre: "Consulta previa en listas restrictivas y vinculante antes del enrolamiento" },
    { codigo: "CTR-LAFT-02", nombre: "Verificación periódica de contrapartes existentes en listas" }
  ];
};

export default function Events() {
  // Estado de eventos con formateador de seguridad integrado
  const [eventos, setEventos] = useState<EventoRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_eventos_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((e: any) => e && typeof e === "object")
            .map((e: any) => {
              const pEv = Number(e?.probabilidadEvento) || 2;
              const iEv = Number(e?.impactoEvento) || 3;
              const nEv = Number(e?.nivelEvento) || (pEv * iEv);

              const pRes = Number(e?.probabilidadResidual) || 2;
              const iRes = Number(e?.impactoResidual) || 2;
              const nRes = Number(e?.nivelResidual) || (pRes * iRes);

              return {
                id: String(e?.id || Date.now() + Math.random()),
                codigoEvento: String(e?.codigoEvento || "EVENTO-1"),
                tipoEvento: String(e?.tipoEvento || "LAFT"),
                tipoIncidencia: String(e?.tipoIncidencia || "FADM = Fallas Administrativas / Control"),
                riesgoVinculado: String(e?.riesgoVinculado || ""),
                controlAplicado: String(e?.controlAplicado || ""),
                descripcion: String(e?.descripcion || ""),
                probabilidadEvento: pEv,
                impactoEvento: iEv,
                nivelEvento: nEv,
                probabilidadResidual: pRes,
                impactoResidual: iRes,
                nivelResidual: nRes,
                brechaRiesgo: typeof e?.brechaRiesgo === "number" ? e.brechaRiesgo : (nEv - nRes)
              };
            });
        }
      }
    } catch (e) {
      console.error("Error cargando eventos guardados:", e);
    }
    return [];
  });

  const [riesgosOptions, setRiesgosOptions] = useState<RiesgoItem[]>(obtenerRiesgosActuales);
  const [controlesOptions, setControlesOptions] = useState<ControlItem[]>(obtenerControlesActuales);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EventoRow>({
    id: "",
    codigoEvento: `EVENTO-${(eventos?.length || 0) + 1}`,
    tipoEvento: "LAFT",
    tipoIncidencia: "FADM = Fallas Administrativas / Control",
    riesgoVinculado: "",
    controlAplicado: "",
    descripcion: "",
    probabilidadEvento: 3,
    impactoEvento: 3,
    nivelEvento: 9,
    probabilidadResidual: 2,
    impactoResidual: 3,
    nivelResidual: 6,
    brechaRiesgo: 3
  });

  const recargarSincronizacion = useCallback(() => {
    setRiesgosOptions(obtenerRiesgosActuales());
    setControlesOptions(obtenerControlesActuales());
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

  useEffect(() => {
    try {
      localStorage.setItem("laft_eventos_v2", JSON.stringify(eventos));
    } catch (e) {
      console.error("Error guardando eventos:", e);
    }
  }, [eventos]);

  const handleRiesgoChange = (riesgoCodigoNombre: string) => {
    const riesgoEncontrado = (riesgosOptions || []).find(
      r => `${r.codigo} - ${r.nombre}` === riesgoCodigoNombre || r.codigo === riesgoCodigoNombre
    );

    const pRes = riesgoEncontrado ? riesgoEncontrado.probabilidadResidual : 2;
    const iRes = riesgoEncontrado ? riesgoEncontrado.impactoResidual : 2;
    const nRes = pRes * iRes;

    const pEv = formData.probabilidadEvento || 1;
    const iEv = formData.impactoEvento || 1;
    const nEv = pEv * iEv;

    setFormData(prev => ({
      ...prev,
      riesgoVinculado: riesgoCodigoNombre,
      probabilidadResidual: pRes,
      impactoResidual: iRes,
      nivelResidual: nRes,
      brechaRiesgo: nEv - nRes
    }));
  };

  const handleMetricaEventoChange = (pEv: number, iEv: number) => {
    const p = Math.max(1, pEv);
    const i = Math.max(1, iEv);
    const nEv = p * i;
    const nRes = formData.nivelResidual || 0;

    setFormData(prev => ({
      ...prev,
      probabilidadEvento: p,
      impactoEvento: i,
      nivelEvento: nEv,
      brechaRiesgo: nEv - nRes
    }));
  };

  const handleOpenModal = () => {
    recargarSincronizacion();
    setEditingId(null);

    const rInicial = riesgosOptions && riesgosOptions.length > 0 ? riesgosOptions[0] : null;
    const rVal = rInicial ? `${rInicial.codigo} - ${rInicial.nombre}` : "";
    const pRes = rInicial ? rInicial.probabilidadResidual : 2;
    const iRes = rInicial ? rInicial.impactoResidual : 3;
    const nRes = pRes * iRes;

    const pEv = 3;
    const iEv = 3;
    const nEv = pEv * iEv;

    const cInicial = controlesOptions && controlesOptions.length > 0 ? controlesOptions[0] : null;
    const cVal = cInicial ? `${cInicial.codigo} - ${cInicial.nombre}` : "";

    setFormData({
      id: "",
      codigoEvento: `EVENTO-${(eventos?.length || 0) + 1}`,
      tipoEvento: "LAFT",
      tipoIncidencia: "FADM = Fallas Administrativas / Control",
      riesgoVinculado: rVal,
      controlAplicado: cVal,
      descripcion: "",
      probabilidadEvento: pEv,
      impactoEvento: iEv,
      nivelEvento: nEv,
      probabilidadResidual: pRes,
      impactoResidual: iRes,
      nivelResidual: nRes,
      brechaRiesgo: nEv - nRes
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
    if (confirm("¿Está seguro de eliminar este evento registrado?")) {
      setEventos(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleResetCache = () => {
    if (confirm("¿Desea restablecer los eventos almacenados para corregir problemas de caché?")) {
      localStorage.removeItem("laft_eventos_v2");
      setEventos([]);
      window.location.reload();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEventos(prev => prev.map(ev => (ev.id === editingId ? formData : ev)));
    } else {
      setEventos(prev => [...(prev || []), { ...formData, id: Date.now().toString() }]);
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
            <p className="text-xs text-slate-500">Evaluación del nivel de evento vs. Perfil Residual del Riesgo Vinculado</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCache}
            title="Limpiar datos locales"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restablecer
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        </div>
      </div>

      {/* Tabla de Eventos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <th className="p-3">Código</th>
              <th className="p-3">Tipo Evento</th>
              <th className="p-3">Tipo Incidencia</th>
              <th className="p-3">Riesgo Vinculado</th>
              <th className="p-3 text-center bg-slate-200/50">Nivel Evento (P × I)</th>
              <th className="p-3 text-center bg-teal-50 text-teal-900">Nivel Residual (P.Res × I.Res)</th>
              <th className="p-3 text-center font-extrabold">Brecha del Riesgo</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {!Array.isArray(eventos) || eventos.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                  No hay eventos registrados. Haz clic en "Nuevo Evento" para crear uno.
                </td>
              </tr>
            ) : (
              eventos.map(e => {
                const brecha = Number(e?.brechaRiesgo) || 0;
                const excede = brecha > 0;
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{e.codigoEvento}</td>
                    <td className="p-3 font-semibold">{e.tipoEvento}</td>
                    <td className="p-3 text-slate-700 max-w-[200px] truncate">{e.tipoIncidencia}</td>
                    <td className="p-3 text-slate-700 max-w-[220px] truncate">{e.riesgoVinculado || "N/A"}</td>
                    <td className="p-3 text-center font-bold text-slate-900 bg-slate-50">
                      {e.nivelEvento || 0} <span className="text-[10px] text-slate-400">({e.probabilidadEvento || 0}x{e.impactoEvento || 0})</span>
                    </td>
                    <td className="p-3 text-center font-bold text-teal-800 bg-teal-50/50">
                      {e.nivelResidual || 0} <span className="text-[10px] text-teal-600">({e.probabilidadResidual || 0}x{e.impactoResidual || 0})</span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          excede
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {brecha > 0 ? `+${brecha}` : brecha} {excede ? "(Excedida)" : "(Tolerada)"}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Evento</label>
                  <input
                    type="text"
                    value={formData.codigoEvento}
                    onChange={e => setFormData({ ...formData, codigoEvento: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo Evento</label>
                  <select
                    value={formData.tipoEvento}
                    onChange={e => setFormData({ ...formData, tipoEvento: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, tipoIncidencia: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="TEC = Tecnológico">TEC = Tecnológico</option>
                    <option value="FADM = Fallas Administrativas / Control">FADM = Fallas Administrativas / Control</option>
                    <option value="LAFT = Lavado de Activos / Financiación del terrorismo">
                      LAFT = Lavado de Activos / Financiación del terrorismo
                    </option>
                    <option value="OPER = Operativo">OPER = Operativo</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-amber-900 mb-1.5">
                    Riesgo Vinculado ({riesgosOptions?.length || 0})
                  </label>
                  <select
                    value={formData.riesgoVinculado}
                    onChange={e => handleRiesgoChange(e.target.value)}
                    className="w-full p-2.5 border border-amber-200 rounded-lg bg-white text-amber-900 font-medium"
                  >
                    {(!riesgosOptions || riesgosOptions.length === 0) ? (
                      <option value="">No hay riesgos registrados</option>
                    ) : (
                      riesgosOptions.map(r => {
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
                    Control Aplicado (Lista Activa: {controlesOptions?.length || 0})
                  </label>
                  <select
                    value={formData.controlAplicado}
                    onChange={e => setFormData({ ...formData, controlAplicado: e.target.value })}
                    className="w-full p-2.5 border border-amber-200 rounded-lg bg-white text-amber-900 font-medium"
                  >
                    {(!controlesOptions || controlesOptions.length === 0) ? (
                      <option value="">No hay controles registrados</option>
                    ) : (
                      controlesOptions.map(c => {
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evento / Descripción</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg bg-white resize-none"
                  placeholder="Detalle los hechos del evento registrado..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Nivel de Evento (Manual)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Prob. Evento (P)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.probabilidadEvento}
                        onChange={e =>
                          handleMetricaEventoChange(parseInt(e.target.value) || 1, formData.impactoEvento)
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-0.5">Imp. Evento (I)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.impactoEvento}
                        onChange={e =>
                          handleMetricaEventoChange(formData.probabilidadEvento, parseInt(e.target.value) || 1)
                        }
                        className="w-full p-2 border border-slate-300 rounded bg-white font-bold text-center"
                      />
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-medium">Nivel Evento: </span>
                    <span className="font-black text-slate-900 text-sm">{formData.nivelEvento}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-teal-800 text-[11px] uppercase tracking-wider">Perfil Residual (Desde Riesgo)</h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-teal-50/60 rounded border border-teal-100">
                      <div className="text-[10px] text-teal-600 font-medium">P. Residual</div>
                      <div className="font-bold text-teal-900">{formData.probabilidadResidual}</div>
                    </div>
                    <div className="p-2 bg-teal-50/60 rounded border border-teal-100">
                      <div className="text-[10px] text-teal-600 font-medium">I. Residual</div>
                      <div className="font-bold text-teal-900">{formData.impactoResidual}</div>
                    </div>
                  </div>
                  <div className="p-2 bg-teal-100/50 rounded border border-teal-200 text-center">
                    <span className="text-[10px] text-teal-700 font-medium">Nivel Residual: </span>
                    <span className="font-black text-teal-950 text-sm">{formData.nivelResidual}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-2">
                  <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Brecha del Riesgo</h3>
                  <div
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center h-full text-center ${
                      formData.brechaRiesgo > 0
                        ? "bg-rose-50 border-rose-200 text-rose-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                    }`}
                  >
                    <div className="flex items-center gap-1 font-black text-lg">
                      {formData.brechaRiesgo > 0 ? (
                        <Shield className="w-5 h-5 text-rose-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                      <span>{formData.brechaRiesgo > 0 ? `+${formData.brechaRiesgo}` : formData.brechaRiesgo}</span>
                    </div>
                    <div className="text-[10px] font-bold mt-1">
                      {formData.brechaRiesgo > 0 ? "Excede Capacidad Cobertura" : "Dentro de Perfil Tolerado"}
                    </div>
                  </div>
                </div>
              </div>

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