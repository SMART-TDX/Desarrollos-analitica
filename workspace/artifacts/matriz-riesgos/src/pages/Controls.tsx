import React, { useState, useEffect } from "react";

export const CONTROLES_KEY = "laft_controles_catalog_v1";

export interface CatalogControl {
  id: string;
  codigo: string;
  descripcion: string;
  clase: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
  ponderacion: number;
  frecuencia?: string;
  responsable?: string;
}

export const DEFAULT_CATALOG_CONTROLES: CatalogControl[] = [
  {
    id: "ctrl-1",
    codigo: "CTR-LAFT-01",
    descripcion: "Consulta en las listas restrictivas para todas las personas asociadas.",
    clase: "PREVENTIVO",
    ponderacion: 42.5,
    frecuencia: "DIARIO",
    responsable: "Oficial de Cumplimiento"
  },
  {
    id: "ctrl-2",
    codigo: "CTR-LAFT-02",
    descripcion: "Monitoreo continuo de transacciones inusuales o sospechosas.",
    clase: "DETECTIVO",
    ponderacion: 35.0,
    frecuencia: "CONTINUO",
    responsable: "Analista LAFT"
  },
  {
    id: "ctrl-3",
    codigo: "CTR-LAFT-03",
    descripcion: "Reporte inmediato de Operaciones Sospechosas (ROS) a la autoridad competente.",
    clase: "CORRECTIVO",
    ponderacion: 22.5,
    frecuencia: "EVENTUAL",
    responsable: "Oficial de Cumplimiento"
  },
  {
    id: "ctrl-4",
    codigo: "CTR-LAFT-04",
    descripcion: "Chequeo de información pública en medios de comunicación y noticias adversas.",
    clase: "PREVENTIVO",
    ponderacion: 42.5,
    frecuencia: "MENSUAL",
    responsable: "Gestión Humana / Compras"
  }
];

export default function Controls() {
  const [controles, setControles] = useState<CatalogControl[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<CatalogControl | null>(null);

  const [formData, setFormData] = useState<Omit<CatalogControl, "id">>({
    codigo: "",
    descripcion: "",
    clase: "PREVENTIVO",
    ponderacion: 10,
    frecuencia: "DIARIO",
    responsable: ""
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
      console.error("Error al cargar catálogo de controles:", e);
    }
    setControles(DEFAULT_CATALOG_CONTROLES);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(DEFAULT_CATALOG_CONTROLES));
  }, []);

  const saveToStorage = (updatedList: CatalogControl[]) => {
    setControles(updatedList);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(updatedList));
  };

  const handleOpenCreate = () => {
    setEditingControl(null);
    setFormData({
      codigo: `CTR-LAFT-0${controles.length + 1}`,
      descripcion: "",
      clase: "PREVENTIVO",
      ponderacion: 10,
      frecuencia: "DIARIO",
      responsable: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogControl) => {
    setEditingControl(item);
    setFormData({
      codigo: item.codigo,
      descripcion: item.descripcion,
      clase: item.clase,
      ponderacion: item.ponderacion,
      frecuencia: item.frecuencia || "DIARIO",
      responsable: item.responsable || ""
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
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Controles</h1>
          <p className="text-muted-foreground text-sm">
            Gestión centralizada de los controles aplicables a la matriz de riesgos LAFT.
          </p>
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
        <input
          type="text"
          placeholder="Buscar por código, descripción o clase..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Tabla Catálogo */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold tracking-wider">
                <th className="p-3 w-32">Código</th>
                <th className="p-3">Descripción</th>
                <th className="p-3 w-32">Clase</th>
                <th className="p-3 w-28 text-right">Ponderación (%)</th>
                <th className="p-3 w-32">Frecuencia</th>
                <th className="p-3 w-40">Responsable</th>
                <th className="p-3 text-center w-24 bg-muted/80">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredControles.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-bold whitespace-nowrap">{item.codigo}</td>
                  <td className="p-3 text-xs">{item.descripcion}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.clase === "PREVENTIVO"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.clase === "DETECTIVO"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {item.clase}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-teal-700">
                    {item.ponderacion}%
                  </td>
                  <td className="p-3 text-muted-foreground">{item.frecuencia || "-"}</td>
                  <td className="p-3 text-muted-foreground">{item.responsable || "-"}</td>
                  <td className="p-3 text-center whitespace-nowrap bg-muted/20">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 hover:text-teal-600 text-base"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:text-red-600 text-base"
                        title="Eliminar"
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

      {/* Modal Formulario Control */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingControl ? `Editar Control: ${editingControl.codigo}` : "Nuevo Control"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Código *</label>
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Clase *</label>
                  <select
                    value={formData.clase}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clase: e.target.value as CatalogControl["clase"]
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="PREVENTIVO">PREVENTIVO</option>
                    <option value="DETECTIVO">DETECTIVO</option>
                    <option value="CORRECTIVO">CORRECTIVO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Ponderación (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.ponderacion}
                    onChange={(e) =>
                      setFormData({ ...formData, ponderacion: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Frecuencia</label>
                  <input
                    type="text"
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    placeholder="Ej: DIARIO, MENSUAL..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    placeholder="Ej: Oficial de Cumplimiento"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
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