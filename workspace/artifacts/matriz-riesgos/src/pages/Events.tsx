import React, { useState, useEffect } from "react";

const EVENTOS_SAGRILAF_KEY = "laft_eventos_sagrilaf_v5_red";
const EVENTOS_RIESGO_KEY = "laft_eventos_riesgo_v5_red";

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
  },
  {
    id: "2",
    codigoEvento: "EVT-002",
    tipoEvento: "OPERATIVO",
    fechaEvento: "2026-08-01",
    descripcion: "Fallo en conciliación bancaria de la plataforma automática de recaudo.",
    tipoIncidencia: "Tecnológica",
    codigoRiesgo: "R-TEC002",
    probabilidad: 2,
    impacto: 3,
    probabilidadResidual: 1,
    impactoResidual: 2,
    estado: "En seguimiento"
  }
];

export default function Events() {
  const [activeTab, setActiveTab] = useState<"sagrilaf" | "riesgo">("sagrilaf");
  const [eventosSagrilaf, setEventosSagrilaf] = useState<any[]>([]);
  const [eventosRiesgo, setEventosRiesgo] = useState<any[]>([]);

  // Modales / Formularios independientes
  const [showFormSagrilaf, setShowFormSagrilaf] = useState(false);
  const [showFormRiesgo, setShowFormRiesgo] = useState(false);

  // Formulario SAGRILAFT
  const [formSagrilaft, setFormSagrilaft] = useState({
    codigo: "",
    tipo: "LAFT",
    factor: "CLI",
    etapa: "VIN",
    evento: "",
    probabilidad: 2,
    impacto: 3,
    apetito: 2,
    estado: "Prioritario"
  });

  // Formulario Evento de Riesgo
  const [formRiesgo, setFormRiesgo] = useState({
    codigoEvento: "",
    tipoEvento: "LAFT",
    fechaEvento: new Date().toISOString().split("T")[0],
    descripcion: "",
    tipoIncidencia: "Operativa",
    codigoRiesgo: "R-LAFT001",
    probabilidad: 2,
    impacto: 3,
    estado: "Prioritario"
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

  const saveRiesgo = (newList: any[]) => {
    setEventosRiesgo(newList);
    localStorage.setItem(EVENTOS_RIESGO_KEY, JSON.stringify(newList));
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
    setShowFormSagrilaf(false);
    setFormSagrilaft({
      codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "",
      probabilidad: 2, impacto: 3, apetito: 2, estado: "Prioritario"
    });
  };

  const handleAddRiesgo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRiesgo.codigoEvento || !formRiesgo.descripcion) return;
    const newEvt = {
      id: Date.now().toString(),
      ...formRiesgo,
      probabilidadResidual: 1,
      impactoResidual: 2
    };
    saveRiesgo([newEvt, ...eventosRiesgo]);
    setShowFormRiesgo(false);
    setFormRiesgo({
      codigoEvento: "",
      tipoEvento: "LAFT",
      fechaEvento: new Date().toISOString().split("T")[0],
      descripcion: "",
      tipoIncidencia: "Operativa",
      codigoRiesgo: "R-LAFT001",
      probabilidad: 2,
      impacto: 3,
      estado: "Prioritario"
    });
  };

  const handleDeleteSagrilaf = (id: string) => {
    if (window.confirm("¿Desea eliminar este evento SAGRILAFT?")) {
      saveSagrilaf(eventosSagrilaf.filter((e) => e.id !== id));
    }
  };

  const handleDeleteRiesgo = (id: string) => {
    if (window.confirm("¿Desea eliminar este evento de riesgo?")) {
      saveRiesgo(eventosRiesgo.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Encabezado y Pestañas con temática Roja (#c91212) */}
      <div className="border-b border-border pb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">Registro de Eventos</h1>
        <p className="text-muted-foreground text-sm mb-5">
          Base de datos de materialización de riesgos e incidencias LAFT.
        </p>

        {/* Pestañas (Tabs) */}
        <div className="flex gap-6 border-b border-border">
          <button
            onClick={() => setActiveTab("sagrilaf")}
            className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "sagrilaf"
                ? "border-[#c91212] text-[#c91212]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Eventos SAGRILAFT
          </button>
          <button
            onClick={() => setActiveTab("riesgo")}
            className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "riesgo"
                ? "border-[#c91212] text-[#c91212]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Eventos de Riesgo
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: EVENTOS SAGRILAFT */}
      {activeTab === "sagrilaf" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total: {eventosSagrilaf.length} registro(s)
            </span>
            <button
              onClick={() => setShowFormSagrilaf(!showFormSagrilaf)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c91212] hover:bg-[#a80e0e] text-white rounded-md text-sm font-bold shadow-sm transition-colors self-start sm:self-auto"
            >
              {showFormSagrilaf ? "✕ Cancelar" : "+ Añadir Evento SAGRILAFT"}
            </button>
          </div>

          {/* Formulario SAGRILAFT */}
          {showFormSagrilaf && (
            <form onSubmit={handleAddSagrilaft} className="border border-red-200 dark:border-red-900 rounded-lg p-5 bg-card shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#c91212]">Nuevo Evento SAGRILAFT</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Código *</label>
                  <input
                    required
                    placeholder="EVENTO-20"
                    value={formSagrilaft.codigo}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, codigo: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background focus:ring-2 focus:ring-[#c91212]"
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
                  className="w-full px-3 py-1.5 border rounded text-sm bg-background focus:ring-2 focus:ring-[#c91212]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowFormSagrilaf(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c91212] hover:bg-[#a80e0e] text-white rounded text-xs font-bold shadow-sm"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          )}

          {/* Tabla SAGRILAFT */}
          <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold text-[11px] tracking-wider">
                    <th className="p-3.5 w-32">Código</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Factor</th>
                    <th className="p-3.5">Etapa</th>
                    <th className="p-3.5 min-w-[280px]">Evento / Descripción</th>
                    <th className="p-3.5 text-center">P</th>
                    <th className="p-3.5 text-center">I</th>
                    <th className="p-3.5 text-center font-extrabold text-foreground">Nivel</th>
                    <th className="p-3.5 text-center">Apetito</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Creado</th>
                    <th className="p-3.5 text-center w-12">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventosSagrilaf.map((ev) => (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-xs whitespace-nowrap">{ev.codigo}</td>
                      <td className="p-3.5">
                        <span className="border px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {ev.tipo}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-muted-foreground">{ev.factor}</td>
                      <td className="p-3.5 font-semibold text-muted-foreground">{ev.etapa}</td>
                      <td className="p-3.5 font-medium text-foreground leading-relaxed">{ev.evento}</td>
                      <td className="p-3.5 text-center font-bold">{ev.probabilidad}</td>
                      <td className="p-3.5 text-center font-bold">{ev.impacto}</td>
                      <td className="p-3.5 text-center font-extrabold text-sm text-[#c91212]">{ev.nivel}</td>
                      <td className="p-3.5 text-center">{ev.apetito ?? "2"}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.estado === "Prioritario" ? "bg-red-100 text-red-800" :
                          ev.estado === "En seguimiento" ? "bg-amber-100 text-amber-800" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          {ev.estado || "Activo"}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">{ev.fechaCreacion || "21/7/2026"}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteSagrilaf(ev.id)}
                          className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
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
      )}

      {/* PESTAÑA 2: EVENTOS DE RIESGO */}
      {activeTab === "riesgo" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total: {eventosRiesgo.length} registro(s)
            </span>
            <button
              onClick={() => setShowFormRiesgo(!showFormRiesgo)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c91212] hover:bg-[#a80e0e] text-white rounded-md text-sm font-bold shadow-sm transition-colors self-start sm:self-auto"
            >
              {showFormRiesgo ? "✕ Cancelar" : "+ Añadir Evento de Riesgo"}
            </button>
          </div>

          {/* Formulario Evento de Riesgo */}
          {showFormRiesgo && (
            <form onSubmit={handleAddRiesgo} className="border border-red-200 dark:border-red-900 rounded-lg p-5 bg-card shadow-sm space-y-4">
              <h3 className="font-bold text-base text-[#c91212]">Nuevo Evento de Riesgo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Código Evento *</label>
                  <input
                    required
                    placeholder="EVT-003"
                    value={formRiesgo.codigoEvento}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, codigoEvento: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background focus:ring-2 focus:ring-[#c91212]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tipo Evento</label>
                  <input
                    value={formRiesgo.tipoEvento}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, tipoEvento: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Código Riesgo</label>
                  <input
                    value={formRiesgo.codigoRiesgo}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, codigoRiesgo: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formRiesgo.fechaEvento}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, fechaEvento: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Descripción del Evento *</label>
                <textarea
                  required
                  rows={2}
                  value={formRiesgo.descripcion}
                  onChange={(e) => setFormRiesgo({ ...formRiesgo, descripcion: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded text-sm bg-background focus:ring-2 focus:ring-[#c91212]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowFormRiesgo(false)}
                  className="px-4 py-2 border rounded text-xs font-semibold hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c91212] hover:bg-[#a80e0e] text-white rounded text-xs font-bold shadow-sm"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          )}

          {/* Tabla Eventos de Riesgo */}
          <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold text-[11px] tracking-wider">
                    <th className="p-3.5 w-28">Fecha</th>
                    <th className="p-3.5 w-28">Código</th>
                    <th className="p-3.5 w-28">Tipo</th>
                    <th className="p-3.5 min-w-[280px]">Descripción</th>
                    <th className="p-3.5 w-32">Riesgo Asociado</th>
                    <th className="p-3.5 w-28">Estado</th>
                    <th className="p-3.5 text-center w-12">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventosRiesgo.map((ev) => (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">{ev.fechaEvento}</td>
                      <td className="p-3.5 font-mono font-bold text-xs whitespace-nowrap">{ev.codigoEvento}</td>
                      <td className="p-3.5">
                        <span className="border px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {ev.tipoEvento}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-foreground leading-relaxed">{ev.descripcion}</td>
                      <td className="p-3.5 font-mono text-xs font-bold text-muted-foreground">{ev.codigoRiesgo}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.estado === "Prioritario" ? "bg-red-100 text-red-800" :
                          ev.estado === "En seguimiento" ? "bg-amber-100 text-amber-800" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          {ev.estado || "Activo"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDeleteRiesgo(ev.id)}
                          className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
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
      )}
    </div>
  );
}