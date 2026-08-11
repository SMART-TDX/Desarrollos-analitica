import { useState, useEffect } from "react";
import { Input, Button } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Search, Activity, Plus, Edit2, Trash2, X } from "lucide-react";

const MONITOREO_KEY = "laft_monitoreo_v2";

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
    periodicidad: "Mensual",
    responsable: ""
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MONITOREO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMonitoreos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error leyendo localStorage:", e);
    }
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
    if (confirm("¿Está seguro de eliminar esta actividad de monitoreo?")) {
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
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-none p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plan de Monitoreo</h1>
            <p className="text-muted-foreground text-sm mt-1">Actividades de seguimiento a los riesgos identificados.</p>
          </div>
          <Button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-medium"
          >
            <Plus className="h-4 w-4" />
            Añadir Actividad
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por código de riesgo o aspecto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[140px]">Riesgo Asoc.</TableHead>
                <TableHead>Aspecto a Monitorear</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Periodicidad</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="w-[100px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay planes de monitoreo definidos.</p>
                    <p className="text-xs text-muted-foreground mt-1">Los planes se derivan de la matriz de riesgos.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => (
                  <TableRow key={item.id || idx}>
                    <TableCell className="font-mono font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                      {item.codigo}
                    </TableCell>
                    <TableCell className="max-w-[280px]">{item.aspectoMonitorear}</TableCell>
                    <TableCell className="max-w-[250px]" title={item.indicador || ""}>{item.indicador || "-"}</TableCell>
                    <TableCell className="font-medium text-xs text-teal-700 dark:text-teal-400">{item.periodicidad || "-"}</TableCell>
                    <TableCell>{item.responsable || "-"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenModal(item)}
                          title="Editar"
                          className="p-1.5 text-muted-foreground hover:text-teal-600 hover:bg-muted rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Eliminar"
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-muted rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal para Crear / Editar Actividad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30">
              <h3 className="text-lg font-bold text-foreground">
                {editingItem ? `Editar Actividad: ${editingItem.codigo}` : "Añadir Actividad de Seguimiento"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Riesgo Asociado (Código)</label>
                <Input
                  required
                  placeholder="Ej: MONT-LAFT006"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Aspecto a Monitorear</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej: Seguimiento a capacitaciones en Sagrilaft"
                  value={formData.aspectoMonitorear}
                  onChange={(e) => setFormData({ ...formData, aspectoMonitorear: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Indicador</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej: Porcentaje de colaboradores capacitados"
                  value={formData.indicador}
                  onChange={(e) => setFormData({ ...formData, indicador: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Periodicidad</label>
                  <select
                    value={formData.periodicidad}
                    onChange={(e) => setFormData({ ...formData, periodicidad: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background border-input focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <label className="block text-xs font-semibold mb-1 text-foreground">Responsable</label>
                  <Input
                    required
                    placeholder="Ej: Oficial de Cumplimiento"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                >
                  Guardar Actividad
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}