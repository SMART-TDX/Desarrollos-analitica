import React, { useState, useEffect } from "react";

// Claves de almacenamiento local
const EVENTOS_SAGRILAF_KEY = "laft_eventos_sagrilaf_v4_force";
const EVENTOS_RIESGO_KEY = "laft_eventos_riesgo_v4_force";

// Datos por defecto SAGRILAFT
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

// Datos por defecto Riesgo Normal
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
    descripcion: "Caída temporal del servidor principal afectando el módulo de autenticación.",
    tipoIncidencia: "Tecnológica",
    codigoRiesgo: "R-TEC003",
    probabilidad: 2,
    impacto: 4,
    probabilidadResidual: 1,
    impactoResidual: 2,
    estado: "En seguimiento"
  }
];

export default function Events() {
  const [eventosSagrilaf, setEventosSagrilaf] = useState<any[]>([]);
  const [eventosRiesgo, setEventosRiesgo] = useState<any[]>([]);
  
  // Modales/Formularios independientes
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

  // Formulario Riesgo Normal
  const [formRiesgo, setFormRiesgo] = useState({
    codigoEvento: "",
    tipoEvento: "LAFT",
    fechaEvento: new Date().toISOString().split("T")[0],
    descripcion: "",
    tipoIncidencia: "Operativa",
    codigoRiesgo: "R-001",
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

  // Persistencia SAGRILAFT
  const saveSagrilaf = (newList: any[]) => {
    setEventosSagrilaf(newList);
    localStorage.setItem(EVENTOS_SAGRILAF_KEY, JSON.stringify(newList));
  };

  // Persistencia Riesgo Normal
  const saveRiesgo = (newList: any[]) => {
    setEventosRiesgo(newList);
    localStorage.setItem(EVENTOS_RIESGO_KEY, JSON.stringify(newList));
  };

  // Guardar SAGRILAFT
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

  // Guardar Riesgo Normal
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
      codigoRiesgo: "R-001",
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
    if (window.confirm("¿Desea eliminar este evento de riesgo normal?")) {
      saveRiesgo(eventosRiesgo.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-6 overflow-y-auto">
      {/* Encabezado General */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Registro de Eventos</h1>
        <p className="text-muted-foreground text-sm">
          Vista paralela de materialización de riesgos SAGRILAFT e incidencias de Riesgo General.
        </p>
      </div>

      {/* Grid en Paralelo (2 Columnas en pantallas medianas y grandes) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* ==================== COLUMNA IZQUIERDA: EVENTOS SAGRILAFT ==================== */}
        <div className="flex flex-col gap-4 border rounded-xl p-4 bg-card/50 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="text-lg font-bold text-teal-800 dark:text-teal-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                Eventos SAGRILAFT
              </h2>
              <span className="text-xs text-muted-foreground">
                Total: {eventosSagrilaf.length} registro(s)
              </span>
            </div>
            <button
              onClick={() => setShowFormSagrilaf(!showFormSagrilaf)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
              {showFormSagrilaf ? "✕ Cancelar" : "+ Añadir SAGRILAFT"}
            </button>
          </div>

          {/* Formulario Crear SAGRILAFT */}
          {showFormSagrilaf && (
            <form onSubmit={handleAddSagrilaft} className="border rounded-lg p-4 bg-card shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-teal-800 dark:text-teal-400">
                Nuevo Evento SAGRILAFT
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Código *</label>
                  <input
                    required
                    placeholder="EVENTO-20"
                    value={formSagrilaft.codigo}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, codigo: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tipo</label>
                  <select
                    value={formSagrilaft.tipo}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, tipo: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  >
                    <option value="LAFT">LAFT</option>
                    <option value="REPS">REPS</option>
                    <option value="TEC">TEC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Factor</label>
                  <select
                    value={formSagrilaft.factor}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, factor: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  >
                    <option value="CLI">CLI - Cliente</option>
                    <option value="EMP">EMP - Empleado</option>
                    <option value="PRV">PRV - Proveedor</option>
                    <option value="TEC">TEC - Tecnológico</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Etapa</label>
                  <select
                    value={formSagrilaft.etapa}
                    onChange={(e) => setFormSagrilaft({ ...formSagrilaft, etapa: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  >
                    <option value="VIN">VIN - Vinculación</option>
                    <option value="POR">POR - Monitoreo</option>
                    <option value="LUN">LUN - Operación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descripción del Evento *</label>
                <textarea
                  required
                  rows={2}
                  value={formSagrilaft.evento}
                  onChange={(e) => setFormSagrilaft({ ...formSagrilaft, evento: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFormSagrilaf(false)}
                  className="px-3 py-1 border rounded font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-teal-700 text-white rounded font-semibold text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {/* Tabla SAGRILAFT */}
          <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full max-h-[600px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
                  <tr className="border-b text-muted-foreground uppercase font-bold text-[11px]">
                    <th className="p-2.5">Código</th>
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5">Factor</th>
                    <th className="p-2.5">Etapa</th>
                    <th className="p-2.5">Descripción</th>
                    <th className="p-2.5 text-center">P</th>
                    <th className="p-2.5 text-center">I</th>
                    <th className="p-2.5 text-center font-bold">Nivel</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventosSagrilaf.map((ev) => (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-mono font-bold whitespace-nowrap">{ev.codigo}</td>
                      <td className="p-2.5">
                        <span className="border px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {ev.tipo}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-muted-foreground">{ev.factor}</td>
                      <td className="p-2.5 font-semibold text-muted-foreground">{ev.etapa}</td>
                      <td className="p-2.5 max-w-[200px] truncate" title={ev.evento}>{ev.evento}</td>
                      <td className="p-2.5 text-center font-bold">{ev.probabilidad}</td>
                      <td className="p-2.5 text-center font-bold">{ev.impacto}</td>
                      <td className="p-2.5 text-center font-bold text-teal-700 dark:text-teal-400">{ev.nivel}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.estado === "Prioritario" ? "bg-red-100 text-red-800" :
                          ev.estado === "En seguimiento" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {ev.estado || "Activo"}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleDeleteSagrilaf(ev.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors"
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

        {/* ==================== COLUMNA DERECHA: EVENTOS DE RIESGO NORMAL ==================== */}
        <div className="flex flex-col gap-4 border rounded-xl p-4 bg-card/50 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                Eventos de Riesgo Normal
              </h2>
              <span className="text-xs text-muted-foreground">
                Total: {eventosRiesgo.length} registro(s)
              </span>
            </div>
            <button
              onClick={() => setShowFormRiesgo(!showFormRiesgo)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
              {showFormRiesgo ? "✕ Cancelar" : "+ Añadir Riesgo"}
            </button>
          </div>

          {/* Formulario Crear Riesgo Normal */}
          {showFormRiesgo && (
            <form onSubmit={handleAddRiesgo} className="border rounded-lg p-4 bg-card shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Nuevo Evento de Riesgo Normal
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Código Evento *</label>
                  <input
                    required
                    placeholder="EVT-003"
                    value={formRiesgo.codigoEvento}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, codigoEvento: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tipo Evento</label>
                  <input
                    value={formRiesgo.tipoEvento}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, tipoEvento: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Código Riesgo</label>
                  <input
                    value={formRiesgo.codigoRiesgo}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, codigoRiesgo: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formRiesgo.fechaEvento}
                    onChange={(e) => setFormRiesgo({ ...formRiesgo, fechaEvento: e.target.value })}
                    className="w-full px-2.5 py-1.5 border rounded bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descripción del Evento *</label>
                <textarea
                  required
                  rows={2}
                  value={formRiesgo.descripcion}
                  onChange={(e) => setFormRiesgo({ ...formRiesgo, descripcion: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFormRiesgo(false)}
                  className="px-3 py-1 border rounded font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-slate-700 text-white rounded font-semibold text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {/* Tabla Riesgo Normal */}
          <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full max-h-[600px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm">
                  <tr className="border-b text-muted-foreground uppercase font-bold text-[11px]">
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Código</th>
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5">Descripción</th>
                    <th className="p-2.5">Riesgo Assoc.</th>
                    <th className="p-2.5">Estado</th>
                    <th className="p-2.5 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventosRiesgo.map((ev) => (
                    <tr key={ev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 text-muted-foreground whitespace-nowrap">{ev.fechaEvento}</td>
                      <td className="p-2.5 font-mono font-bold whitespace-nowrap">{ev.codigoEvento}</td>
                      <td className="p-2.5">
                        <span className="border px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {ev.tipoEvento}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-[200px] truncate" title={ev.descripcion}>
                        {ev.descripcion}
                      </td>
                      <td className="p-2.5 font-mono text-muted-foreground">{ev.codigoRiesgo}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.estado === "Prioritario" ? "bg-red-100 text-red-800" :
                          ev.estado === "En seguimiento" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {ev.estado || "Activo"}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleDeleteRiesgo(ev.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors"
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

      </div>
    </div>
  );
}