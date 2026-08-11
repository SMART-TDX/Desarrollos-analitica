import React, { useState, useEffect } from "react";

const MONITOREO_KEY = "laft_monitoreo_v4_force";

interface MonitoringItem {
  id: string;
  codigo: string;
  aspectoMonitorear: string;
  indicador: string;
  periodicidad: string;
  responsable: string;
}

const DEFAULT_MONITOREOS: MonitoringItem[] = [
  {
    id: "1",
    codigo: "MONT-LAFT001",
    aspectoMonitorear: "Verificación de cumplimiento documental de debida diligencia",
    indicador: "Numerosos casos con inconsistencias o documentación incompleta",
    periodicidad: "Durante la solicitud",
    responsable: "SAGRILAFT / Comercial/Compras/Mercadeo"
  },
  {
    id: "2",
    codigo: "MONT-LAFT002",
    aspectoMonitorear: "Verificación de cumplimiento Actualización de Datos de la debida diligencia",
    indicador: "Numero de casos actualizados vs. total del periodo",
    periodicidad: "Anual",
    responsable: "SAGRILAFT / Comercial/Compras/Mercadeo"
  },
  {
    id: "3",
    codigo: "MONT-LAFT003",
    aspectoMonitorear: "Monitoreo, seguimiento y consolidación de transacciones del cliente.",
    indicador: "Análisis del perfil de riesgo transaccional del cliente",
    periodicidad: "Mensual",
    responsable: "SAGRILAFT"
  },
  {
    id: "4",
    codigo: "MONT-LAFT004",
    aspectoMonitorear: "Verificación listas restrictivas y LAFT",
    indicador: "Numero de clientes verificados en listas restrictivas",
    periodicidad: "Permanente",
    responsable: "SAGRILAFT"
  },
  {
    id: "5",
    codigo: "MONT-LAFT005",
    aspectoMonitorear: "Control de pagos en efectivo y canales de recaudo",
    indicador: "Número de transacciones en efectivo que superan el umbral",
    periodicidad: "Mensual",
    responsable: "Cartera / Sagrilaft"
  },
  {
    id: "6",
    codigo: "MONT-LAFT006",
    aspectoMonitorear: "Seguimiento a capacitaciones en Sagrilaft",
    indicador: "Porcentaje de colaboradores capacitados",
    periodicidad: "Semestral",
    responsable: "Oficial de Cumplimiento"
  }
];

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [monitoreos, setMonitoreos] = useState<MonitoringItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonitoringItem | null>(null);

  const [formData, setFormData] = useState({
    codigo: "",
    aspectoMonitorear: "",
    indicador: "",
    periodicidad: "Semestral",
    responsable: "Oficial de Cumplimiento"
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MONITOREO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 6) {
          setMonitoreos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Forzar carga de datos por defecto con MONT-LAFT006
    setMonitoreos(DEFAULT_MONITOREOS);
    localStorage.setItem(MONITOREO_KEY, JSON.stringify(DEFAULT_MONITOREOS));
  }, []);

  const saveToStorage = (updatedList: MonitoringItem[]) => {
    setMonitoreos(updatedList);
    localStorage.setItem(MONITOREO_KEY, JSON.stringify(updatedList));
  };

  const handleOpenModal = (item?: MonitoringItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        codigo: item.codigo,
        aspectoMonitorear: item.aspectoMonitorear,
        indicador: item.indicador,
        periodicidad: item.periodicidad,
        responsable: item.responsable
      });
    } else {
      setEditingItem(null);
      const nextNum = monitoreos.length + 1;
      const numStr = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
      setFormData({
        codigo: `MONT-LAFT${numStr}`,
        aspectoMonitorear: "",
        indicador: "",
        periodicidad: "Semestral",
        responsable: "Oficial de Cumplimiento"
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta actividad de monitoreo?")) {
      const updated = monitoreos.filter(m => m.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updated = monitoreos.map(m => m.id === editingItem.id ? { ...m, ...formData } : m);
      saveToStorage(updated);
    } else {
      const newItem: MonitoringItem = {
        id: Date.now().toString(),
        ...formData
      };
      saveToStorage([...monitoreos, newItem]);
    }
    setIsModalOpen(false);
  };

  const filtered = monitoreos.filter(m => 
    (m.codigo || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.aspectoMonitorear || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.indicador || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.responsable || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plan de Monitoreo</h1>
          <p className="text-muted-foreground text-sm mt-1">Actividades de seguimiento a los riesgos identificados.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-md text-sm shadow-sm transition-colors"
        >
          <span className="text-lg font-bold">+</span> Añadir Actividad
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6 max-w-md">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por código de riesgo o aspecto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Tabla */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                <th className="p-3.5 w-36">Riesgo Asoc.</th>
                <th className="p-3.5 min-w-[250px]">Aspecto a Monitorear</th>
                <th className="p-3.5 min-w-[220px]">Indicador</th>
                <th className="p-3.5 w-36">Periodicidad</th>
                <th className="p-3.5 min-w-[220px]">Responsable</th>
                <th className="p-3.5 text-center w-24 font-bold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                    No hay planes de monitoreo definidos.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5 font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                      {item.codigo}
                    </td>
                    <td className="p-3.5 text-xs text-foreground font-medium">
                      {item.aspectoMonitorear}
                    </td>
                    <td className="p-3.5 text-xs text-muted-foreground">
                      {item.indicador}
                    </td>
                    <td className="p-3.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
                      {item.periodicidad}
                    </td>
                    <td className="p-3.5 text-xs text-foreground">
                      {item.responsable}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          title="Editar"
                          className="p-1.5 text-muted-foreground hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950 rounded transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar"
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg overflow-hidden my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/20">
              <h3 className="text-lg font-bold">
                {editingItem ? `Editar Actividad: ${editingItem.codigo}` : "Añadir Actividad de Seguimiento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl font-bold px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Riesgo Asociado (Código)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: MONT-LAFT006"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Aspecto a Monitorear</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej: Seguimiento a capacitaciones en Sagrilaft"
                  value={formData.aspectoMonitorear}
                  onChange={(e) => setFormData({ ...formData, aspectoMonitorear: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Indicador</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej: Porcentaje de colaboradores capacitados"
                  value={formData.indicador}
                  onChange={(e) => setFormData({ ...formData, indicador: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Periodicidad</label>
                  <select
                    value={formData.periodicidad}
                    onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm bg-background"
                  >
                    <option value="Durante la solicitud">Durante la solicitud</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                    <option value="Permanente">Permanente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Responsable</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Oficial de Cumplimiento"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm bg-background"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-sm font-medium shadow-sm"
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