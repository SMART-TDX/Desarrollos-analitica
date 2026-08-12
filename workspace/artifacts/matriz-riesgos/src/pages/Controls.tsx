import React, { useState, useEffect } from "react";

export const CONTROLES_KEY = "laft_controles_v1";

export interface CatalogControl {
  id: string;
  codigo: string;
  descripcion: string;
  clase: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
  ejecucion: "MANUAL" | "AUTOMÁTICO" | "SEMIAUTOMÁTICO";
  frecuencia: "PERMANENTE" | "OCASIONAL" | "DIARIO" | "MENSUAL";
  ponderacion: number;
}

export const DEFAULT_CATALOG_CONTROLES: CatalogControl[] = [
  {
    id: "1",
    codigo: "CTR-LAFT-01",
    descripcion: "Consulta en las listas restrictivas para todas las personas asociadas.",
    clase: "PREVENTIVO",
    ejecucion: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 42.5
  },
  {
    id: "2",
    codigo: "CTR-LAFT-02",
    descripcion: "Aceptación de cláusula SAGRILAFT sobre prevención del riesgo.",
    clase: "PREVENTIVO",
    ejecucion: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 42.5
  },
  {
    id: "3",
    codigo: "CTR-LAFT-03",
    descripcion: "Aprobación por parte de gerencia para vinculación de clientes especiales.",
    clase: "PREVENTIVO",
    ejecucion: "MANUAL",
    frecuencia: "OCASIONAL",
    ponderacion: 33.5
  },
  {
    id: "4",
    codigo: "CTR-LAFT-04",
    descripcion: "Chequeo de información pública en medios de comunicación.",
    clase: "PREVENTIVO",
    ejecucion: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 42.5
  },
  {
    id: "5",
    codigo: "CTR-LAFT-05",
    descripcion: "Validación y causación de recibos de caja contra extractos bancarios.",
    clase: "DETECTIVO",
    ejecucion: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 41.5
  }
];

export default function Controls() {
  const [controles, setControles] = useState<CatalogControl[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<CatalogControl | null>(null);

  // Estado del Formulario
  const [formData, setFormData] = useState<Omit<CatalogControl, "id">>({
    codigo: "",
    descripcion: "",
    clase: "PREVENTIVO",
    ejecucion: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 40.0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTROLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setControles(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error leyendo controles:", e);
    }
    setControles(DEFAULT_CATALOG_CONTROLES);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(DEFAULT_CATALOG_CONTROLES));
  }, []);

  const saveToStorage = (updated: CatalogControl[]) => {
    setControles(updated);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(updated));
  };

  const handleOpenCreate = () => {
    setEditingControl(null);
    setFormData({
      codigo: `CTR-LAFT-0${controles.length + 1}`,
      descripcion: "",
      clase: "PREVENTIVO",
      ejecucion: "SEMIAUTOMÁTICO",
      frecuencia: "PERMANENTE",
      ponderacion: 40.0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (control: CatalogControl) => {
    setEditingControl(control);
    setFormData({
      codigo: control.codigo,
      descripcion: control.descripcion,
      clase: control.clase,
      ejecucion: control.ejecucion,
      frecuencia: control.frecuencia,
      ponderacion: control.ponderacion
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este control del catálogo?")) {
      const updated = controles.filter((c) => c.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingControl) {
      const updated = controles.map((c) =>
        c.id === editingControl.id ? { ...c, ...formData } : c
      );
      saveToStorage(updated);
    } else {
      const newControl: CatalogControl = {
        id: Date.now().toString(),
        ...formData
      };
      saveToStorage([...controles, newControl]);
    }
    setIsModalOpen(false);
  };

  const filteredControles = controles.filter(
    (c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Controles</h1>
          <p className="text-muted-foreground text-sm">Gestión del inventario central de controles LAFT.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
        >
          <span className="text-lg font-bold">+</span> Nuevo Control
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Tabla del Catálogo */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground uppercase font-bold tracking-wider">
                <th className="p-4 w-36">Código</th>
                <th className="p-4">Descripción</th>
                <th className="p-4 w-72">Atributos</th>
                <th className="p-4 w-32 text-right">Ponderación</th>
                <th className="p-4 w-28 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredControles.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-xs">{item.codigo}</td>
                  <td className="p-4 text-xs font-medium text-foreground">{item.descripcion}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] bg-slate-100 border rounded font-bold text-slate-700">
                        {item.clase}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-slate-100 border rounded font-bold text-slate-700">
                        {item.ejecucion}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] bg-slate-100 border rounded font-bold text-slate-700">
                        {item.frecuencia}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-xs text-foreground">
                    {item.ponderacion.toFixed(3)} %
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-500 hover:text-teal-600 transition-colors text-base"
                        title="Editar control"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-slate-500 hover:text-red-600 transition-colors text-base"
                        title="Eliminar control"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Control */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-foreground">
                {editingControl ? `Editar Control: ${editingControl.codigo}` : "Nuevo Control"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Código *</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Clase</label>
                  <select
                    value={formData.clase}
                    onChange={(e) => setFormData({ ...formData, clase: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="PREVENTIVO">PREVENTIVO</option>
                    <option value="DETECTIVO">DETECTIVO</option>
                    <option value="CORRECTIVO">CORRECTIVO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Ejecución</label>
                  <select
                    value={formData.ejecucion}
                    onChange={(e) => setFormData({ ...formData, ejecucion: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="SEMIAUTOMÁTICO">SEMIAUTOMÁTICO</option>
                    <option value="AUTOMÁTICO">AUTOMÁTICO</option>
                    <option value="MANUAL">MANUAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Frecuencia</label>
                  <select
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="PERMANENTE">PERMANENTE</option>
                    <option value="OCASIONAL">OCASIONAL</option>
                    <option value="DIARIO">DIARIO</option>
                    <option value="MENSUAL">MENSUAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Ponderación (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.ponderacion}
                    onChange={(e) => setFormData({ ...formData, ponderacion: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-bold"
                >
                  Guardar Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}