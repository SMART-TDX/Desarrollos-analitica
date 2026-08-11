import React, { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";

const EVENTOS_RIESGO_KEY = "laft_eventos_riesgo_v1";
const EVENTOS_SAGRILAF_KEY = "laft_eventos_sagrilaf_v1";

// ── Datos Semilla para Eventos SAGRILAFT (Basados en tu imagen) ────────────────
const DEFAULT_EVENTOS_SAGRILAF = [
  {
    id: "1",
    codigo: "EVENTO-1",
    tipo: "LAFT",
    factor: "CLI",
    etapa: "VIN",
    evento: "Documento auténtico obtenido de fuente ilícita o falsificado en debida diligencia.",
    probabilidad: 2,
    impacto: 3,
    nivel: 6,
    apetito: 2,
    estado: "Prioritario",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "10",
    codigo: "EVENTO-10",
    tipo: "REPS",
    factor: "CLI",
    etapa: "POR",
    evento: "Relación indirecta con investigaciones de listas o noticias restrictivas.",
    probabilidad: 1,
    impacto: 3,
    nivel: 3,
    apetito: 2,
    estado: "Controlado",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "11",
    codigo: "EVENTO-11",
    tipo: "LAFT",
    factor: "EMP",
    etapa: "LUN",
    evento: "Omisión deliberada de Reporte de Operación Sospechosa (ROS).",
    probabilidad: 2,
    impacto: 3,
    nivel: 6,
    apetito: 2,
    estado: "Prioritario",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "17",
    codigo: "EVENTO-17",
    tipo: "TEC",
    factor: "TEC",
    etapa: "AIRE LIBRE",
    evento: "Incumplimiento de Debida Diligencia por fallas continuas en la plataforma tecnológica.",
    probabilidad: 2,
    impacto: 3,
    nivel: 6,
    apetito: 2,
    estado: "En seguimiento",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "2",
    codigo: "EVENTO-2",
    tipo: "LAFT",
    factor: "EMP",
    etapa: "LUN",
    evento: "Empleado facilita operación sospechosa omitiendo controles obligatorios.",
    probabilidad: 2,
    impacto: 4,
    nivel: 8,
    apetito: 2,
    estado: "Prioritario",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "3",
    codigo: "EVENTO-3",
    tipo: "LAFT",
    factor: "PRV",
    etapa: "ESTAFA",
    evento: "Proveedor incluido en listas restrictivas o vinculados a procesos sancionatorios.",
    probabilidad: 2,
    impacto: 3,
    nivel: 6,
    apetito: 2,
    estado: "Controlado",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "4",
    codigo: "EVENTO-4",
    tipo: "REPS",
    factor: "CLI",
    etapa: "POR",
    evento: "Estudiante o cliente vinculado a caso de investigación judicial de conocimiento público.",
    probabilidad: 1,
    impacto: 3,
    nivel: 3,
    apetito: 2,
    estado: "Controlado",
    fechaCreacion: "2026-07-21"
  },
  {
    id: "5",
    codigo: "EVENTO-5",
    tipo: "LAFT",
    factor: "CLI",
    etapa: "VIN",
    evento: "Fraccionamiento de pagos para eludir umbrales de reporte de debida diligencia.",
    probabilidad: 3,
    impacto: 4,
    nivel: 12,
    apetito: 2,
    estado: "Prioritario",
    fechaCreacion: "2026-07-21"
  }
];

// ── Datos Semilla para Eventos de Riesgo ──────────────────────────────────────
const DEFAULT_EVENTOS_RIESGO = [
  {
    id: "1",
    codigoEvento: "EVT-001",
    tipoEvento: "LAFT",
    fechaEvento: "2026-07-20",
    descripcion: "Transacción inusual detectada en canal digital no reportada oportunamente.",
    tipoIncidencia: "Operativa",
    codigoRiesgo: "R-LAFT001",
    probabilidad: 3,
    impacto: 3,
    probabilidadResidual: 1,
    impactoResidual: 2,
    estado: "Prioritario"
  },
  {
    id: "2",
    codigoEvento: "EVT-002",
    tipoEvento: "OPERATIVO",
    fechaEvento: "2026-07-21",
    descripcion: "Indisponibilidad temporal en el servicio de consulta de listas restrictivas.",
    tipoIncidencia: "Tecnológica",
    codigoRiesgo: "R-LAFT002",
    probabilidad: 2,
    impacto: 3,
    probabilidadResidual: 1,
    impactoResidual: 2,
    estado: "En seguimiento"
  }
];

const PROB_LABELS_EVENTO: Record<number, string> = {
  1: "1 — Raro", 2: "2 — Improbable", 3: "3 — Posible", 4: "4 — Probable", 5: "5 — Casi certeza",
};

const IMP_LABELS: Record<number, string> = {
  1: "1 — Insignificante", 2: "2 — Menor", 3: "3 — Moderado", 4: "4 — Mayor", 5: "5 — Catastrófico",
};

function perfilLabel(p: number | null, i: number | null): { label: string; color: string } {
  if (!p || !i) return { label: "—", color: "" };
  const s = p * i;
  if (s <= 4) return { label: "ACEPTABLE", color: "bg-green-100 text-green-800" };
  if (s <= 9) return { label: "TOLERABLE", color: "bg-yellow-100 text-yellow-800" };
  if (s <= 14) return { label: "MODERADO", color: "bg-orange-100 text-orange-800" };
  if (s <= 19) return { label: "ALTO", color: "bg-red-100 text-red-800" };
  return { label: "CRITICO", color: "bg-red-200 text-red-900" };
}

function Select({ name, value, options, onChange, placeholder = "-- Seleccione --" }: {
  name: string; value: string | number; options: { value: string | number; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; placeholder?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Tab: Eventos de Riesgo ──────────────────────────────────────────────────
function EventosRiesgoTab() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigoEvento: "", tipoEvento: "LAFT", descripcion: "", tipoIncidencia: "",
    probabilidad: 1, impacto: 1, probabilidadResidual: 1, impactoResidual: 1,
    codigoRiesgo: "R-LAFT001", estado: "Abierto", fechaEvento: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(EVENTOS_RIESGO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEventos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setEventos(DEFAULT_EVENTOS_RIESGO);
    localStorage.setItem(EVENTOS_RIESGO_KEY, JSON.stringify(DEFAULT_EVENTOS_RIESGO));
  }, []);

  const saveStorage = (newList: any[]) => {
    setEventos(newList);
    localStorage.setItem(EVENTOS_RIESGO_KEY, JSON.stringify(newList));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["probabilidad", "impacto", "probabilidadResidual", "impactoResidual"];
    setForm((p) => ({ ...p, [name]: numFields.includes(name) ? (value === "" ? "" : Number(value)) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigoEvento || !form.descripcion) {
      alert("Complete Código y Descripción");
      return;
    }
    const newEvt = {
      id: Date.now().toString(),
      ...form,
      probabilidad: Number(form.probabilidad),
      impacto: Number(form.impacto),
      probabilidadResidual: Number(form.probabilidadResidual),
      impactoResidual: Number(form.impactoResidual),
    };
    saveStorage([newEvt, ...eventos]);
    setShowForm(false);
    setForm({
      codigoEvento: "", tipoEvento: "LAFT", descripcion: "", tipoIncidencia: "",
      probabilidad: 1, impacto: 1, probabilidadResidual: 1, impactoResidual: 1,
      codigoRiesgo: "R-LAFT001", estado: "Abierto", fechaEvento: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = (id: string, codigo: string) => {
    if (!confirm(`¿Eliminar evento ${codigo}?`)) return;
    saveStorage(eventos.filter((ev) => ev.id !== id));
  };

  const inherentePerfil = perfilLabel(Number(form.probabilidad), Number(form.impacto));
  const residualPerfil = perfilLabel(Number(form.probabilidadResidual), Number(form.impactoResidual));

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Añadir Evento de Riesgo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-5 mb-6 bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground mb-2">Nuevo Evento de Riesgo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Código del Evento *</label>
              <input
                name="codigoEvento"
                required
                value={form.codigoEvento}
                onChange={handleChange}
                placeholder="EVT-003"
                className="w-full px-3 py-1.5 border rounded text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Tipo de Evento</label>
              <Select
                name="tipoEvento"
                value={form.tipoEvento}
                onChange={handleChange}
                options={["LAFT", "OPERATIVO", "LEGAL", "REPUTACIONAL"].map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Fecha</label>
              <input
                name="fechaEvento"
                type="date"
                value={form.fechaEvento}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border rounded text-sm bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Descripción *</label>
            <textarea
              name="descripcion"
              required
              rows={2}
              value={form.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border rounded text-sm bg-background"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Tipo de Incidencia</label>
              <input
                name="tipoIncidencia"
                value={form.tipoIncidencia}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border rounded text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Riesgo Asociado</label>
              <input
                name="codigoRiesgo"
                value={form.codigoRiesgo}
                onChange={handleChange}
                placeholder="Ej. R-LAFT001"
                className="w-full px-3 py-1.5 border rounded text-sm bg-background"
              />
            </div>
          </div>

          {/* Inherente */}
          <div className="border rounded-lg p-3 bg-muted/20">
            <p className="text-xs font-bold mb-2 text-teal-700 uppercase">Calificación Inherente</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs mb-1">Probabilidad</label>
                <Select
                  name="probabilidad"
                  value={form.probabilidad}
                  onChange={handleChange}
                  options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: PROB_LABELS_EVENTO[v] }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Impacto</label>
                <Select
                  name="impacto"
                  value={form.impacto}
                  onChange={handleChange}
                  options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: IMP_LABELS[v] }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Perfil</label>
                <div className={`flex h-9 items-center px-3 rounded font-bold text-xs ${inherentePerfil.color}`}>
                  {inherentePerfil.label} ({Number(form.probabilidad) * Number(form.impacto)})
                </div>
              </div>
            </div>
          </div>

          {/* Residual */}
          <div className="border rounded-lg p-3 bg-muted/20">
            <p className="text-xs font-bold mb-2 text-teal-700 uppercase">Calificación Residual</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs mb-1">Probabilidad Residual</label>
                <Select
                  name="probabilidadResidual"
                  value={form.probabilidadResidual}
                  onChange={handleChange}
                  options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: PROB_LABELS_EVENTO[v] }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Impacto Residual</label>
                <Select
                  name="impactoResidual"
                  value={form.impactoResidual}
                  onChange={handleChange}
                  options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: IMP_LABELS[v] }))}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Perfil Residual</label>
                <div className={`flex h-9 items-center px-3 rounded font-bold text-xs ${residualPerfil.color}`}>
                  {residualPerfil.label} ({Number(form.probabilidadResidual) * Number(form.impactoResidual)})
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded text-xs font-semibold hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold"
            >
              Guardar Evento
            </button>
          </div>
        </form>
      )}

      {/* Tabla Eventos de Riesgo */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground uppercase font-bold">
                <th className="p-3">Fecha</th>
                <th className="p-3">Código</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Riesgo</th>
                <th className="p-3 text-center">P.I.</th>
                <th className="p-3 text-center">I.I.</th>
                <th className="p-3 text-center">Perfil Inh.</th>
                <th className="p-3 text-center">P.R.</th>
                <th className="p-3 text-center">I.R.</th>
                <th className="p-3 text-center">Perfil Res.</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-center w-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eventos.map((ev) => {
                const pi = perfilLabel(ev.probabilidad, ev.impacto);
                const pr = perfilLabel(ev.probabilidadResidual ?? null, ev.impactoResidual ?? null);
                return (
                  <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 whitespace-nowrap">{ev.fechaEvento || "-"}</td>
                    <td className="p-3 font-mono font-bold">{ev.codigoEvento}</td>
                    <td className="p-3"><span className="border px-2 py-0.5 rounded text-[10px] font-semibold">{ev.tipoEvento}</span></td>
                    <td className="p-3 max-w-[220px] truncate" title={ev.descripcion}>{ev.descripcion}</td>
                    <td className="p-3 font-mono text-muted-foreground">{ev.codigoRiesgo || "—"}</td>
                    <td className="p-3 text-center font-bold">{ev.probabilidad}</td>
                    <td className="p-3 text-center font-bold">{ev.impacto}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pi.color}`}>{pi.label}</span></td>
                    <td className="p-3 text-center font-bold">{ev.probabilidadResidual ?? "—"}</td>
                    <td className="p-3 text-center font-bold">{ev.impactoResidual ?? "—"}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pr.color}`}>{pr.label}</span></td>
                    <td className="p-3"><span className="border px-2 py-0.5 rounded text-[10px]">{ev.estado || "Abierto"}</span></td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(ev.id, ev.codigoEvento)}
                        className="p-1 text-muted-foreground hover:text-red-600 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Eventos SAGRILAFT ───────────────────────────────────────────────────
function EventosSagrilafTab() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "",
    probabilidad: 1, impacto: 1, nivel: 1, apetito: 2, estado: "Prioritario"
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(EVENTOS_SAGRILAF_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEventos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setEventos(DEFAULT_EVENTOS_SAGRILAF);
    localStorage.setItem(EVENTOS_SAGRILAF_KEY, JSON.stringify(DEFAULT_EVENTOS_SAGRILAF));
  }, []);

  const saveStorage = (newList: any[]) => {
    setEventos(newList);
    localStorage.setItem(EVENTOS_SAGRILAF_KEY, JSON.stringify(newList));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["probabilidad", "impacto", "apetito"];
    setForm((p) => {
      const newForm = { ...p, [name]: numFields.includes(name) ? Number(value) : value };
      if (name === "probabilidad" || name === "impacto") {
        newForm.nivel = Number(newForm.probabilidad) * Number(newForm.impacto);
      }
      return newForm;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo || !form.evento) {
      alert("Complete Código y Evento");
      return;
    }
    const newEvt = {
      id: Date.now().toString(),
      ...form,
      nivel: Number(form.probabilidad) * Number(form.impacto),
      fechaCreacion: new Date().toLocaleDateString("es-CO")
    };
    saveStorage([newEvt, ...eventos]);
    setShowForm(false);
    setForm({
      codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "",
      probabilidad: 1, impacto: 1, nivel: 1, apetito: 2, estado: "Prioritario"
    });
  };

  const handleDelete = (id: string, codigo: string) => {
    if (!confirm(`¿Eliminar evento ${codigo}?`)) return;
    saveStorage(eventos.filter((ev) => ev.id !== id));
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Añadir Evento SAGRILAFT"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-5 mb-6 bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground mb-2">Nuevo Evento SAGRILAFT</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Código *</label>
              <input
                name="codigo"
                required
                value={form.codigo}
                onChange={handleChange}
                placeholder="EVENTO-20"
                className="w-full px-3 py-1.5 border rounded text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Tipo</label>
              <Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                options={["LAFT", "REPS", "OPE", "TEC", "LEG"].map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Factor</label>
              <Select
                name="factor"
                value={form.factor}
                onChange={handleChange}
                options={[
                  { value: "CLI", label: "CLI - Cliente" },
                  { value: "EMP", label: "EMP - Empleado" },
                  { value: "PRV", label: "PRV - Proveedor" },
                  { value: "TEC", label: "TEC - Tecnológico" },
                  { value: "OTR", label: "OTR - Otro" }
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Etapa</label>
              <Select
                name="etapa"
                value={form.etapa}
                onChange={handleChange}
                options={[
                  { value: "VIN", label: "VIN - Vinculación" },
                  { value: "POR", label: "POR - Monitoreo" },
                  { value: "LUN", label: "LUN - Operación" },
                  { value: "ESTAFA", label: "ESTAFA - Riesgo" }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Descripción del Evento *</label>
            <textarea
              name="evento"
              required
              rows={2}
              value={form.evento}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border rounded text-sm bg-background"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Probabilidad (1-5)</label>
              <Select
                name="probabilidad"
                value={form.probabilidad}
                onChange={handleChange}
                options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: PROB_LABELS_EVENTO[v] }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Impacto (1-5)</label>
              <Select
                name="impacto"
                value={form.impacto}
                onChange={handleChange}
                options={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: IMP_LABELS[v] }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Nivel (Auto)</label>
              <div className="flex h-9 items-center px-3 rounded bg-muted font-bold text-sm">
                {Number(form.probabilidad) * Number(form.impacto)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Apetito de Riesgo</label>
              <input
                name="apetito"
                type="number"
                min={1}
                max={25}
                value={form.apetito}
                onChange={handleChange}
                className="w-full px-3 py-1.5 border rounded text-sm bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Estado</label>
            <Select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              options={["Prioritario", "En seguimiento", "Controlado", "Cerrado"].map((v) => ({ value: v, label: v }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded text-xs font-semibold hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold"
            >
              Guardar Evento
            </button>
          </div>
        </form>
      )}

      {/* Tabla Eventos SAGRILAFT */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground uppercase font-bold">
                <th className="p-3">Código</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Factor</th>
                <th className="p-3">Etapa</th>
                <th className="p-3">Evento</th>
                <th className="p-3 text-center">P</th>
                <th className="p-3 text-center">I</th>
                <th className="p-3 text-center font-bold">Nivel</th>
                <th className="p-3 text-center">Apetito</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Creado</th>
                <th className="p-3 text-center w-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eventos.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-bold whitespace-nowrap">{ev.codigo}</td>
                  <td className="p-3">
                    <span className="border px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                      {ev.tipo}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-muted-foreground">{ev.factor}</td>
                  <td className="p-3 font-semibold text-muted-foreground">{ev.etapa}</td>
                  <td className="p-3 max-w-[280px] truncate" title={ev.evento}>{ev.evento}</td>
                  <td className="p-3 text-center font-bold">{ev.probabilidad}</td>
                  <td className="p-3 text-center font-bold">{ev.impacto}</td>
                  <td className="p-3 text-center font-bold text-sm text-teal-700 dark:text-teal-400">{ev.nivel}</td>
                  <td className="p-3 text-center">{ev.apetito ?? "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.estado === "Prioritario" ? "bg-red-100 text-red-800" :
                      ev.estado === "En seguimiento" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {ev.estado || "Activo"}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{ev.fechaCreacion || "21/7/2026"}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(ev.id, ev.codigo)}
                      className="p-1 text-muted-foreground hover:text-red-600 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal Events ──────────────────────────────────────────────
export default function Events() {
  const [activeTab, setActiveTab] = useState<"riesgo" | "sagrilaf">("sagrilaf");

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="flex-none p-6 border-b pb-0">
        <h1 className="text-2xl font-bold text-foreground mb-1">Registro de Eventos</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Base de datos de materialización de riesgos e incidencias LAFT.
        </p>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "sagrilaf" ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("sagrilaf")}
          >
            Eventos SAGRILAFT
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "riesgo" ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("riesgo")}
          >
            Eventos de Riesgo
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeTab === "sagrilaf" ? <EventosSagrilafTab /> : <EventosRiesgoTab />}
      </div>
    </div>
  );
}