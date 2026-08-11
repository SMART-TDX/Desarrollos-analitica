import React, { useState, useEffect } from "react";

const EVENTOS_SAGRILAF_KEY = "laft_eventos_sagrilaf_v4_force";
const EVENTOS_RIESGO_KEY = "laft_eventos_riesgo_v4_force";

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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
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
    fechaCreacion: "21/7/2026"
  }
];

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
  }
];

export default function Events() {
  const [activeTab, setActiveTab] = useState<"sagrilaf" | "riesgo">("sagrilaf");
  const [eventosSagrilaf, setEventosSagrilaf] = useState<any[]>([]);
  const [eventosRiesgo, setEventosRiesgo] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form Sagrilaft
  const [formSagrilaft, setFormSagrilaft] = useState({
    codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "",
    probabilidad: 2, impacto: 3, apetito: 2, estado: "Prioritario"
  });

  useEffect(() => {
    // Cargar Eventos SAGRILAFT
    try {
      const savedSagrilaft = localStorage.getItem(EVENTOS_SAGRILAF_KEY);
      if (savedSagrilaft) {
        const parsed = JSON.parse(savedSagrilaft);
        if (Array.isArray(parsed) && parsed.length >= 8) {
          setEventosSagrilaf(parsed);
        } else {
          setEventosSagrilaf(DEFAULT_EVENTOS_SAGRILAF);
          localStorage.setItem(EVENTOS_SAGRILAF_KEY, JSON.stringify(DEFAULT_EVENTOS_SAGRILAF));
        }
      } else {
        setEventosSagrilaf(DEFAULT_EVENTOS_SAGRILAF);
        localStorage.setItem(EVENTOS_SAGRILAF_KEY, JSON.stringify(DEFAULT_EVENTOS_SAGRILAF));
      }
    } catch {
      setEventosSagrilaf(DEFAULT_EVENTOS_SAGRILAF);
    }

    // Cargar Eventos de Riesgo
    try {
      const savedRiesgo = localStorage.getItem(EVENTOS_RIESGO_KEY);
      if (savedRiesgo) {
        const parsed = JSON.parse(savedRiesgo);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEventosRiesgo(parsed);
        } else {
          setEventosRiesgo(DEFAULT_EVENTOS_RIESGO);
          localStorage.setItem(EVENTOS_RIESGO_KEY, JSON.stringify(DEFAULT_EVENTOS_RIESGO));
        }
      } else {
        setEventosRiesgo(DEFAULT_EVENTOS_RIESGO);
        localStorage.setItem(EVENTOS_RIESGO_KEY, JSON.stringify(DEFAULT_EVENTOS_RIESGO));
      }
    } catch {
      setEventosRiesgo(DEFAULT_EVENTOS_RIESGO);
    }
  }, []);

  const saveSagrilaf = (newList: any[]) => {
    setEventosSagrilaf(newList);
    localStorage.setItem(EVENTOS_SAGRILAF_KEY, JSON.stringify(newList));
  };

  const handleAddSagrilaft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSagrilaft.codigo || !formSagrilaft.evento) return;
    const newEvt = {
      id: Date.now().toString(),
      ...formSagrilaft,
      nivel: Number(formSagrilaft.probabilidad) * Number(formSagrilaft.impacto),
      fechaCreacion: new Date().toLocaleDateString("es-CO")
    };
    saveSagrilaf([newEvt, ...eventosSagrilaf]);
    setShowForm(false);
    setFormSagrilaft({
      codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "",
      probabilidad: 2, impacto: 3, apetito: 2, estado: "Prioritario"
    });
  };

  const handleDeleteSagrilaf = (id: string) => {
    if (window.confirm("¿Desea eliminar este evento SAGRILAFT?")) {
      saveSagrilaf(eventosSagrilaf.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6 overflow-y-auto">
      {/* Encabezado y pestañas */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Registro de Eventos</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Base de datos de materialización de riesgos e incidencias LAFT.
        </p>
        <div className="flex border-b gap-4">
          <button
            className={`pb-2 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "sagrilaf"
                ? "border-teal-700 text-teal-700 font-bold dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("sagrilaf")}
          >
            Eventos SAGRILAFT
          </button>
          <button
            className={`pb-2 px-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "riesgo"
                ? "border-teal-700 text-teal-700 font-bold dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("riesgo")}
          >
            Eventos de Riesgo
          </button>
        </div>
      </div>

      {activeTab === "sagrilaf" ? (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              {showForm ? "✕ Cancelar" : "+ Añadir Evento SAGRILAFT"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddSagrilaft} className="border rounded-lg p-5 mb-6 bg-card shadow-sm space-y-4">
              <h3 className="font-bold text-base mb-2">Nuevo Evento SAGRILAFT</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Código *</label>
                  <input
                    required
                    placeholder="EVENTO-20"
                    value={formSagrilaft.codigo}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, codigo: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tipo</label>
                  <select
                    value={formSagrilaft.tipo}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, tipo: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  >
                    <option value="LAFT">LAFT</option>
                    <option value="REPS">REPS</option>
                    <option value="TEC">TEC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Factor</label>
                  <select
                    value={formSagrilaft.factor}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, factor: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  >
                    <option value="CLI">CLI - Cliente</option>
                    <option value="EMP">EMP - Empleado</option>
                    <option value="PRV">PRV - Proveedor</option>
                    <option value="TEC">TEC - Tecnológico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Etapa</label>
                  <select
                    value={formSagrilaft.etapa}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, etapa: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  >
                    <option value="VIN">VIN - Vinculación</option>
                    <option value="POR">POR - Monitoreo</option>
                    <option value="LUN">LUN - Operación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Descripción del Evento *</label>
                <textarea
                  required
                  rows={2}
                  value={formSagrilaft.evento}
                  onChange={(e) => setFormSagrilaft({ ...formSagrilaft, evento: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 text-white rounded text-xs font-semibold"
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
                  {eventosSagrilaf.map((ev) => (
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
                      <td className="p-3 text-center">{ev.apetito ?? "2"}</td>
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
                          onClick={() => handleDeleteSagrilaf(ev.id)}
                          className="p-1 text-muted-foreground hover:text-red-600 rounded"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Eventos de Riesgo Tab */
        <div className="border rounded-lg bg-card p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground uppercase font-bold">
                <th className="p-3">Fecha</th>
                <th className="p-3">Código</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Riesgo</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {eventosRiesgo.map((ev) => (
                <tr key={ev.id}>
                  <td className="p-3">{ev.fechaEvento}</td>
                  <td className="p-3 font-mono font-bold">{ev.codigoEvento}</td>
                  <td className="p-3">{ev.tipoEvento}</td>
                  <td className="p-3">{ev.descripcion}</td>
                  <td className="p-3">{ev.codigoRiesgo}</td>
                  <td className="p-3">{ev.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}