import React, { useState, useEffect } from "react";

export const CONTROLES_KEY = "laft_controles_v1";

export interface CatalogControl {
  id: string;
  codigo: string;
  descripcion: string;
  clase: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
  pesoClase: number;
  tipo: "AUTOMÁTICO" | "SEMIAUTOMÁTICO" | "MANUAL";
  pesoTipo: number;
  frecuencia: "PERMANENTE" | "DIARIO" | "MENSUAL" | "OCASIONAL";
  pesoFrecuencia: number;
  formalidad: "FORMAL / DOCUMENTADO" | "NO FORMALIZADO";
  pesoFormalidad: number;
  ponderacion: number;
}

const PESOS_CLASE = { PREVENTIVO: 15.0, DETECTIVO: 10.0, CORRECTIVO: 5.0 };
const PESOS_TIPO = { AUTOMÁTICO: 15.0, SEMIAUTOMÁTICO: 10.0, MANUAL: 5.0 };
const PESOS_FRECUENCIA = { PERMANENTE: 10.0, DIARIO: 8.0, MENSUAL: 5.0, OCASIONAL: 2.5 };
const PESOS_FORMALIDAD = { "FORMAL / DOCUMENTADO": 7.5, "NO FORMALIZADO": 2.5 };

export const DEFAULT_CATALOG_CONTROLES: CatalogControl[] = [
  {
    id: "1",
    codigo: "CTR-LAFT-01",
    descripcion: "Consulta en las listas restrictivas para todas las personas asociadas.",
    clase: "PREVENTIVO",
    pesoClase: 15.0,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 10.0,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 10.0,
    formalidad: "FORMAL / DOCUMENTADO",
    pesoFormalidad: 7.5,
    ponderacion: 42.5
  },
  {
    id: "2",
    codigo: "CTR-LAFT-02",
    descripcion: "Aceptación de cláusula SAGRILAFT sobre prevención del riesgo.",
    clase: "PREVENTIVO",
    pesoClase: 15.0,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 10.0,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 10.0,
    formalidad: "FORMAL / DOCUMENTADO",
    pesoFormalidad: 7.5,
    ponderacion: 42.5
  },
  {
    id: "3",
    codigo: "CTR-LAFT-03",
    descripcion: "Aprobación por parte de gerencia para vinculación de clientes especiales.",
    clase: "PREVENTIVO",
    pesoClase: 15.0,
    tipo: "MANUAL",
    pesoTipo: 5.0,
    frecuencia: "OCASIONAL",
    pesoFrecuencia: 2.5,
    formalidad: "FORMAL / DOCUMENTADO",
    pesoFormalidad: 7.5,
    ponderacion: 30.0
  },
  {
    id: "4",
    codigo: "CTR-LAFT-04",
    descripcion: "Chequeo de información pública en medios de comunicación.",
    clase: "PREVENTIVO",
    pesoClase: 15.0,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 10.0,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 10.0,
    formalidad: "FORMAL / DOCUMENTADO",
    pesoFormalidad: 7.5,
    ponderacion: 42.5
  },
  {
    id: "5",
    codigo: "CTR-LAFT-05",
    descripcion: "Validación y causación de recibos de caja contra extractos bancarios.",
    clase: "DETECTIVO",
    pesoClase: 10.0,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 10.0,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 10.0,
    formalidad: "FORMAL / DOCUMENTADO",
    pesoFormalidad: 7.5,
    ponderacion: 37.5
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
    pesoClase: 15.0,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 10.0,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 10.0,
    formalidad: "FORMAL / DOCUMENTADO",
    pesoFormalidad: 7.5,
    ponderacion: 42.5
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
      console.error(e);
    }
    setControles(DEFAULT_CATALOG_CONTROLES);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(DEFAULT_CATALOG_CONTROLES));
  }, []);

  const saveToStorage = (updated: CatalogControl[]) => {
    setControles(updated);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(updated));
  };

  const calculatePonderacion = (
    c = formData.clase,
    t = formData.tipo,
    f = formData.frecuencia,
    form = formData.formalidad
  ) => {
    const pc = PESOS_CLASE[c] || 10;
    const pt = PESOS_TIPO[t] || 10;
    const pf = PESOS_FRECUENCIA[f] || 10;
    const pform = PESOS_FORMALIDAD[form] || 7.5;
    return {
      pc, pt, pf, pform,
      total: pc + pt + pf + pform
    };
  };

  const handleClaseChange = (clase: CatalogControl["clase"]) => {
    const calcs = calculatePonderacion(clase, formData.tipo, formData.frecuencia, formData.formalidad);
    setFormData({
      ...formData,
      clase,
      pesoClase: calcs.pc,
      ponderacion: calcs.total
    });
  };

  const handleTipoChange = (tipo: CatalogControl["tipo"]) => {
    const calcs = calculatePonderacion(formData.clase, tipo, formData.frecuencia, formData.formalidad);
    setFormData({
      ...formData,
      tipo,
      pesoTipo: calcs.pt,
      ponderacion: calcs.total
    });
  };

  const handleFrecuenciaChange = (frecuencia: CatalogControl["frecuencia"]) => {
    const calcs = calculatePonderacion(formData.clase, formData.tipo, frecuencia, formData.formalidad);
    setFormData({
      ...formData,
      frecuencia,
      pesoFrecuencia: calcs.pf,
      ponderacion: calcs.total
    });
  };

  const handleFormalidadChange = (formalidad: CatalogControl["formalidad"]) => {
    const calcs = calculatePonderacion(formData.clase, formData.tipo, formData.frecuencia, formalidad);
    setFormData({
      ...formData,
      formalidad,
      pesoFormalidad: calcs.pform,
      ponderacion: calcs.total
    });
  };

  const handleOpenCreate = () => {
    setEditingControl(null);
    setFormData({
      codigo: `CTR-LAFT-0${controles.length + 1}`,
      descripcion: "",
      clase: "PREVENTIVO",
      pesoClase: 15.0,
      tipo: "SEMIAUTOMÁTICO",
      pesoTipo: 10.0,
      frecuencia: "PERMANENTE",
      pesoFrecuencia: 10.0,
      formalidad: "FORMAL / DOCUMENTADO",
      pesoFormalidad: 7.5,
      ponderacion: 42.5
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (control: CatalogControl) => {
    setEditingControl(control);
    setFormData({
      codigo: control.codigo,
      descripcion: control.descripcion,
      clase: control.clase || "PREVENTIVO",
      pesoClase: control.pesoClase || 15.0,
      tipo: control.tipo || "SEMIAUTOMÁTICO",
      pesoTipo: control.pesoTipo || 10.0,
      frecuencia: control.frecuencia || "PERMANENTE",
      pesoFrecuencia: control.pesoFrecuencia || 10.0,
      formalidad: control.formalidad || "FORMAL / DOCUMENTADO",
      pesoFormalidad: control.pesoFormalidad || 7.5,
      ponderacion: control.ponderacion || 42.5
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
      {/* Header */}
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
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Tabla con Estructura de Encabezados Ponderados */}
      <div className="border border-black rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black text-xs uppercase font-extrabold">
                <th className="p-2 border-r border-black bg-stone-300 text-black w-28">Código</th>
                <th className="p-2 border-r border-black bg-stone-300 text-black min-w-[220px]">Descripción</th>
                <th className="p-2 border-r border-black text-black text-center" style={{ backgroundColor: "#8c2828" }}>CLASE</th>
                <th className="p-2 border-r border-black bg-stone-300 text-black text-center w-20">PESO</th>
                <th className="p-2 border-r border-black text-black text-center" style={{ backgroundColor: "#8c2828" }}>TIPO</th>
                <th className="p-2 border-r border-black bg-stone-300 text-black text-center w-20">PESO</th>
                <th className="p-2 border-r border-black text-black text-center" style={{ backgroundColor: "#8c2828" }}>FRECUENCIA</th>
                <th className="p-2 border-r border-black bg-stone-300 text-black text-center w-20">PESO</th>
                <th className="p-2 border-r border-black text-black text-center" style={{ backgroundColor: "#8c2828" }}>Formalidad del Control</th>
                <th className="p-2 border-r border-black bg-stone-300 text-black text-center w-20">PESO</th>
                <th className="p-2 border-r border-black bg-stone-300 text-black text-center w-28">PONDERACION</th>
                <th className="p-2 bg-stone-300 text-black text-center w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredControles.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors border-b border-slate-300 text-xs">
                  <td className="p-2 font-mono font-bold border-r border-slate-300">{item.codigo}</td>
                  <td className="p-2 font-medium border-r border-slate-300">{item.descripcion}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-semibold">{item.clase}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-700">{(item.pesoClase || 15).toFixed(1)} %</td>
                  <td className="p-2 border-r border-slate-300 text-center font-semibold">{item.tipo}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-700">{(item.pesoTipo || 10).toFixed(1)} %</td>
                  <td className="p-2 border-r border-slate-300 text-center font-semibold">{item.frecuencia}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-700">{(item.pesoFrecuencia || 10).toFixed(1)} %</td>
                  <td className="p-2 border-r border-slate-300 text-center font-semibold">{item.formalidad || "FORMAL / DOCUMENTADO"}</td>
                  <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-700">{(item.pesoFormalidad || 7.5).toFixed(1)} %</td>
                  <td className="p-2 border-r border-slate-300 text-center font-extrabold text-teal-800 bg-teal-50/50">
                    {((item.ponderacion || 42.5) / 100).toFixed(3).replace(".", ",")}
                  </td>
                  <td className="p-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleOpenEdit(item)} className="p-1 hover:text-teal-600 text-sm" title="Editar">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-600 text-sm" title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulario Estructurado */}
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
                    onChange={(e) => handleClaseChange(e.target.value as any)}
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
                    value={formData.tipo}
                    onChange={(e) => handleTipoChange(e.target.value as any)}
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
                    onChange={(e) => handleFrecuenciaChange(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="PERMANENTE">PERMANENTE</option>
                    <option value="DIARIO">DIARIO</option>
                    <option value="MENSUAL">MENSUAL</option>
                    <option value="OCASIONAL">OCASIONAL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Ponderación (%)</label>
                  <input
                    type="text"
                    value={(formData.ponderacion / 100).toFixed(3).replace(".", ",")}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md text-sm bg-muted/40 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Formalidad del Control</label>
                <select
                  value={formData.formalidad}
                  onChange={(e) => handleFormalidadChange(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                >
                  <option value="FORMAL / DOCUMENTADO">FORMAL / DOCUMENTADO</option>
                  <option value="NO FORMALIZADO">NO FORMALIZADO</option>
                </select>
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
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-bold shadow-sm"
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