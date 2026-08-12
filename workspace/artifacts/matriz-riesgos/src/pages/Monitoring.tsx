import React, { useState, useEffect } from "react";

export const MONITORING_KEY = "laft_monitoring_plan_v3";

export interface MonitoringActivity {
  id: string;
  codigo: string;
  aspecto: string;
  indicador: string;
  periodicidad: string;
  responsable: string;
}

export const DEFAULT_MONITORING_ACTIVITIES: MonitoringActivity[] = [
  {
    id: "1",
    codigo: "MONT-LAFT001",
    aspecto: "Verificación de cumplimiento documental de debida diligencia",
    indicador: "Numerosos casos con inconsistencias o documentación incompleta",
    periodicidad: "Durante la solicitud",
    responsable: "SAGRILAFT / Comercial/Compras/Mercadeo"
  },
  {
    id: "2",
    codigo: "MONT-LAFT002",
    aspecto: "Verificación de cumplimiento Actualización de Datos de la debida diligencia",
    indicador: "Numero de casos actualizados vs. total del periodo",
    periodicidad: "Anual",
    responsable: "SAGRILAFT / Comercial/Compras/Mercadeo"
  },
  {
    id: "3",
    codigo: "MONT-LAFT003",
    aspecto: "Monitoreo, seguimiento y consolidación de transacciones del cliente.",
    indicador: "Análisis del perfil de riesgo transaccional del cliente",
    periodicidad: "Mensual",
    responsable: "SAGRILAFT"
  },
  {
    id: "4",
    codigo: "MONT-LAFT004",
    aspecto: "Verificación listas restrictivas y LAFT",
    indicador: "Numero de clientes verificados en listas restrictivas",
    periodicidad: "Permanente",
    responsable: "SAGRILAFT"
  },
  {
    id: "5",
    codigo: "MONT-LAFT005",
    aspecto: "Control de pagos en efectivo y canales de recaudo",
    indicador: "Número de transacciones en efectivo e inconsistencias detectadas",
    periodicidad: "Mensual",
    responsable: "Cartera / Sagrilaft"
  },
  {
    id: "6",
    codigo: "MONT-LAFT006",
    aspecto: "Capacitaciones y actualización en regulación SAGRILAFT",
    indicador: "Porcentaje de personal capacitado e índice de evaluación",
    periodicidad: "Semestral",
    responsable: "Talento Humano / SAGRILAFT"
  },
  {
    id: "7",
    codigo: "MONT-LAFT007",
    aspecto: "Revisión de señales de alerta y reporte de operaciones sospechosas (ROS)",
    indicador: "Número de alertas analizadas y reportes generados a la UIAF",
    periodicidad: "Ocasional",
    responsable: "Oficial de Cumplimiento / SAGRILAFT"
  },
  {
    id: "8",
    codigo: "MONT-LAFT008",
    aspecto: "Auditoría interna y evaluación del sistema de control LAFT",
    indicador: "Informe de hallazgos y nivel de efectividad del sistema",
    periodicidad: "Anual",
    responsable: "Auditoría Interna / Gerencia"
  }
];

export default function Monitoring() {
  const [activities, setActivities] = useState<MonitoringActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<MonitoringActivity | null>(null);

  const [formData, setFormData] = useState<Omit<MonitoringActivity, "id">>({
    codigo: "",
    aspecto: "",
    indicador: "",
    periodicidad: "Mensual",
    responsable: "SAGRILAFT"
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MONITORING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          setActivities(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setActivities(DEFAULT_MONITORING_ACTIVITIES);
    localStorage.setItem(MONITORING_KEY, JSON.stringify(DEFAULT_MONITORING_ACTIVITIES));
  }, []);

  const saveToStorage = (updated: MonitoringActivity[]) => {
    setActivities(updated);
    localStorage.setItem(MONITORING_KEY, JSON.stringify(updated));
  };

  const handleOpenCreate = () => {
    setEditingActivity(null);
    const num = activities.length + 1;
    const codeStr = num < 10 ? `0${num}` : `${num}`;
    setFormData({
      codigo: `MONT-LAFT0${codeStr}`,
      aspecto: "",
      indicador: "",
      periodicidad: "Mensual",
      responsable: "SAGRILAFT"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: MonitoringActivity) => {
    setEditingActivity(act);
    setFormData({
      codigo: act.codigo,
      aspecto: act.aspecto,
      indicador: act.indicador,
      periodicidad: act.periodicidad,
      responsable: act.responsable
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta actividad del plan de monitoreo?")) {
      const updated = activities.filter((a) => a.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity) {
      const updated = activities.map((a) =>
        a.id === editingActivity.id ? { ...a, ...formData } : a
      );
      saveToStorage(updated);
    } else {
      const newAct: MonitoringActivity = {
        id: Date.now().toString(),
        ...formData
      };
      saveToStorage([...activities, newAct]);
    }
    setIsModalOpen(false);
  };

  const filteredActivities = activities.filter(
    (a) =>
      a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.aspecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.indicador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.responsable.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-16 px-1">
      {/* Estilos CSS para asegurar Scrollbars Visibles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00796b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #004d40;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #00796b #f1f5f9;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plan de Monitoreo</h1>
          <p className="text-muted-foreground text-sm">Actividades de seguimiento a los riesgos identificados.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00796b] hover:bg-[#00695c] text-white rounded-md text-sm font-semibold shadow-sm transition-colors"
        >
          <span className="text-lg font-bold leading-none">+</span> Añadir Actividad
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar por código de riesgo o aspecto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#00796b]"
        />
      </div>

      {/* Contenedor con Scrollbar Visible Horizontal y Vertical */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] min-h-[350px] custom-scrollbar w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b">
              <tr className="text-slate-600 dark:text-slate-300 uppercase font-bold text-[11px] tracking-wider">
                <th className="p-3.5 w-36">RIESGO ASOC.</th>
                <th className="p-3.5 min-w-[280px]">ASPECTO A MONITOREAR</th>
                <th className="p-3.5 min-w-[280px]">INDICADOR</th>
                <th className="p-3.5 min-w-[140px]">PERIODICIDAD</th>
                <th className="p-3.5 min-w-[200px]">RESPONSABLE</th>
                <th className="p-3.5 text-center w-24">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredActivities.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-bold text-xs text-foreground whitespace-nowrap">
                    {item.codigo}
                  </td>
                  <td className="p-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {item.aspecto}
                  </td>
                  <td className="p-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.indicador}
                  </td>
                  <td className="p-3.5 text-xs font-semibold text-[#00796b] dark:text-teal-400 whitespace-nowrap">
                    {item.periodicidad}
                  </td>
                  <td className="p-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {item.responsable}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-400 hover:text-amber-600 transition-colors text-base"
                        title="Editar Actividad"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors text-base"
                        title="Eliminar Actividad"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                    No se encontraron actividades registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-background border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-foreground">
                {editingActivity ? `Editar Actividad: ${editingActivity.codigo}` : "Añadir Actividad de Monitoreo"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-foreground font-bold text-xl px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Código de Riesgo Asociado *</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-[#00796b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Aspecto a Monitorear *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.aspecto}
                  onChange={(e) => setFormData({ ...formData, aspecto: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-[#00796b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Indicador *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.indicador}
                  onChange={(e) => setFormData({ ...formData, indicador: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-[#00796b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Periodicidad</label>
                  <select
                    value={formData.periodicidad}
                    onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-[#00796b]"
                  >
                    <option value="Durante la solicitud">Durante la solicitud</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                    <option value="Permanente">Permanente</option>
                    <option value="Ocasional">Ocasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Responsable *</label>
                  <input
                    type="text"
                    required
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:ring-2 focus:ring-[#00796b]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border rounded-md text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00796b] hover:bg-[#00695c] text-white rounded-md text-sm font-bold shadow-sm"
                >
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}