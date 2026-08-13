import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RotateCcw,
  ShieldCheck,
  X,
  Save
} from "lucide-react";
import { STORAGE_KEY, DEFAULT_PARAMETROS } from "./Parameters";

// Interface del Control
export interface ControlRow {
  id: string;
  codigo: string;
  control: string;
  descripcion?: string;
  clase: string;
  tipo: string;
  frecuencia: string;
  formalidad: string;
  evidencia?: string;
  responsable?: string;
}

// Función para obtener los parámetros guardados o por defecto
export function getParametros() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error al leer parámetros:", e);
  }
  return DEFAULT_PARAMETROS;
}

// Cálculo dinámico según los pesos configurados en la interfaz de Parámetros
export function calcularPonderacion(
  clase: string,
  tipo: string,
  frecuencia: string,
  formalidad: string
): number {
  const parametros = getParametros();

  const getValor = (categoria: string, nombre: string) => {
    const item = parametros.find(
      (p: any) =>
        p.categoria === categoria &&
        p.nombre?.toLowerCase().trim() === nombre?.toLowerCase().trim()
    );
    return item ? item.valor : 0;
  };

  const pClase = getValor("CLASE", clase);
  const pTipo = getValor("TIPO", tipo);
  const pFrecuencia = getValor("FRECUENCIA", frecuencia);
  const pFormalidad = getValor("FORMALIDAD", formalidad);

  // Suma ponderada en porcentaje
  const total = (pClase + pTipo + pFrecuencia + pFormalidad) * 100;
  return Math.round(total);
}

// Catálogo inicial oficial por defecto
export const CONTROLES_OFICIALES: ControlRow[] = [
  {
    id: "1",
    codigo: "CTR-LAFT-01",
    control: "Consulta previa y periódica en listas restrictivas y de sanciones",
    descripcion: "Verificación automatizada en listas OFAC, ONU, PEPs y de sanciones nacionales.",
    clase: "Preventivo",
    tipo: "Automático",
    frecuencia: "Permanente",
    formalidad: "DODI (Doc/Div)",
    evidencia: "Logs de consulta y certificado de verificación en sistema",
    responsable: "Oficial de Cumplimiento / Analista LAFT"
  },
  {
    id: "2",
    codigo: "CTR-LAFT-02",
    control: "Debida diligencia intensificada para clientes PEPs e intensivos en efectivo",
    descripcion: "Aprobación de la alta gerencia y soporte documentado del origen de fondos.",
    clase: "Preventivo",
    tipo: "Semiautomático",
    frecuencia: "Ocasional",
    formalidad: "DODI (Doc/Div)",
    evidencia: "Formulario de vinculación PEP y concepto de riesgos",
    responsable: "Oficial de Cumplimiento"
  },
  {
    id: "3",
    codigo: "CTR-LAFT-05",
    control: "Monitoreo transaccional de recaudos y facturación frente a perfiles operativos",
    descripcion: "Alertas tempranas ante incrementos significativos o depósitos inusuales.",
    clase: "Detectivo",
    tipo: "Automático",
    frecuencia: "Permanente",
    formalidad: "DODI (Doc/Div)",
    evidencia: "Reporte de alertas operativas e informe mensual de análisis",
    responsable: "Analista Financiero / Cartera"
  },
  {
    id: "4",
    codigo: "CTR-LAFT-09",
    control: "Restricción de operaciones en efectivo y pagos a terceros no titularizados",
    descripcion: "Bancarización del 100% de operaciones comerciales y desembolsos a proveedores.",
    clase: "Preventivo",
    tipo: "Manual",
    frecuencia: "Permanente",
    formalidad: "DODI (Doc/Div)",
    evidencia: "Comprobantes de egreso y certificaciones bancarias de cuenta titular",
    responsable: "Tesorero / Jefe de Compras"
  },
  {
    id: "5",
    codigo: "CTR-LAFT-13",
    control: "Verificación de beneficiarios finales en contratación de proveedores",
    descripcion: "Identificación de personas naturales con >5% de participación accionaria.",
    clase: "Preventivo",
    tipo: "Semiautomático",
    frecuencia: "Ocasional",
    formalidad: "DODI (Doc/Div)",
    evidencia: "Certificado de existencia / Composición accionaria firmada",
    responsable: "Gestión Jurídica / Compras"
  },
  {
    id: "6",
    codigo: "CTR-LAFT-18",
    control: "Estudios de seguridad y antecedentes al personal de procesos críticos",
    descripcion: "Evaluación de antecedentes judiciales, listas restrictivas y verificación laboral.",
    clase: "Preventivo",
    tipo: "Manual",
    frecuencia: "Ocasional",
    formalidad: "DODI (Doc/Div)",
    evidencia: "Informe de estudio de seguridad e historia laboral de contratación",
    responsable: "Gestión Humana"
  }
];

export default function Controls() {
  const [controles, setControles] = useState<ControlRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_catalogo_controles_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar controles:", e);
    }
    return CONTROLES_OFICIALES;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<ControlRow | null>(null);

  const [formData, setFormData] = useState<ControlRow>({
    id: "",
    codigo: "",
    control: "",
    descripcion: "",
    clase: "Preventivo",
    tipo: "Automático",
    frecuencia: "Permanente",
    formalidad: "DODI (Doc/Div)",
    evidencia: "",
    responsable: ""
  });

  // Escuchar eventos de actualización de parámetros en tiempo real desde Parameters.tsx
  useEffect(() => {
    const handleUpdate = () => {
      // Forzar actualización/re-render de controles para aplicar nuevos pesos
      setControles((prev) => [...prev]); 
    };

    window.addEventListener("laft_parametros_updated", handleUpdate);
    return () => window.removeEventListener("laft_parametros_updated", handleUpdate);
  }, []);

  // Persistir cambios de los controles en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("laft_catalogo_controles_v3", JSON.stringify(controles));
    } catch (e) {
      console.error("Error al guardar controles:", e);
    }
  }, [controles]);

  const handleOpenModal = (controlToEdit?: ControlRow) => {
    if (controlToEdit) {
      setEditingControl(controlToEdit);
      setFormData(controlToEdit);
    } else {
      setEditingControl(null);
      const nextNum = controles.length + 1;
      const nextCode = `CTR-LAFT-${nextNum < 10 ? "0" + nextNum : nextNum}`;
      setFormData({
        id: Date.now().toString(),
        codigo: nextCode,
        control: "",
        descripcion: "",
        clase: "Preventivo",
        tipo: "Automático",
        frecuencia: "Permanente",
        formalidad: "DODI (Doc/Div)",
        evidencia: "",
        responsable: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingControl(null);
  };

  const handleSaveControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.control) {
      alert("Por favor ingrese el código y el nombre del control.");
      return;
    }

    if (editingControl) {
      setControles((prev) =>
        prev.map((c) => (c.id === editingControl.id ? formData : c))
      );
    } else {
      setControles((prev) => [...prev, formData]);
    }

    handleCloseModal();
  };

  const handleDeleteControl = (id: string) => {
    if (confirm("¿Está seguro de eliminar este control del catálogo?")) {
      setControles((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("¿Desea restablecer el catálogo de controles oficial?")) {
      setControles(CONTROLES_OFICIALES);
      localStorage.removeItem("laft_catalogo_controles_v3");
    }
  };

  const filteredControles = controles.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.codigo.toLowerCase().includes(term) ||
      c.control.toLowerCase().includes(term) ||
      (c.responsable || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Catálogo de Controles LAFT
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión y ponderación de efectividad de controles asociados al sistema SAGRILAFT / PADM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer Catálogo
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Control
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar control por código, nombre o responsable..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Tabla de Controles */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold text-xs border-b-2 border-slate-300">
                <th className="p-3.5 w-28">Código</th>
                <th className="p-3.5 min-w-[250px]">Nombre del Control</th>
                <th className="p-3.5 w-28">Clase</th>
                <th className="p-3.5 w-28">Tipo</th>
                <th className="p-3.5 w-28">Frecuencia</th>
                <th className="p-3.5 w-32">Formalidad</th>
                <th className="p-3.5 w-28 text-center bg-indigo-50/50 text-indigo-950">
                  Ponderación
                </th>
                <th className="p-3.5 w-40">Responsable</th>
                <th className="p-3.5 w-24 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredControles.map((item, idx) => {
                const ponderacion = calcularPonderacion(
                  item.clase,
                  item.tipo,
                  item.frecuencia,
                  item.formalidad
                );

                return (
                  <tr
                    key={item.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-slate-50/80"
                        : "bg-slate-50/40 hover:bg-slate-100/60"
                    }
                  >
                    <td className="p-3 font-bold text-slate-900 align-middle">
                      {item.codigo}
                    </td>
                    <td className="p-3 align-middle text-slate-800">
                      <div className="font-semibold">{item.control}</div>
                      {item.descripcion && (
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {item.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px]">
                        {item.clase}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px]">
                        {item.tipo}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px]">
                        {item.frecuencia}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-slate-700">
                      <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px]">
                        {item.formalidad}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-center font-extrabold text-indigo-700 bg-indigo-50/50 text-sm">
                      {ponderacion}%
                    </td>
                    <td className="p-3 align-middle text-slate-600 font-medium">
                      {item.responsable || "N/A"}
                    </td>
                    <td className="p-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="text-slate-500 hover:text-indigo-600 transition-colors p-1"
                          title="Editar control"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteControl(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Eliminar control"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Control */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                {editingControl ? "Editar Control" : "Nuevo Control"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveControl} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 font-bold"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Nombre del Control *
                  </label>
                  <input
                    type="text"
                    value={formData.control}
                    onChange={(e) =>
                      setFormData({ ...formData, control: e.target.value })
                    }
                    placeholder="Ej. Consulta en listas restrictivas"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Detalle operativo del control..."
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Clase
                  </label>
                  <select
                    value={formData.clase}
                    onChange={(e) =>
                      setFormData({ ...formData, clase: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Preventivo">Preventivo</option>
                    <option value="Detectivo">Detectivo</option>
                    <option value="Correctivo">Correctivo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Automático">Automático</option>
                    <option value="Semiautomático">Semiautomático</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Frecuencia
                  </label>
                  <select
                    value={formData.frecuencia}
                    onChange={(e) =>
                      setFormData({ ...formData, frecuencia: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="Permanente">Permanente</option>
                    <option value="Ocasional">Ocasional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Formalidad
                  </label>
                  <select
                    value={formData.formalidad}
                    onChange={(e) =>
                      setFormData({ ...formData, formalidad: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md bg-white"
                  >
                    <option value="DODI (Doc/Div)">DODI (Doc/Div)</option>
                    <option value="NODO (No Doc)">NODO (No Doc)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={formData.responsable || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, responsable: e.target.value })
                    }
                    placeholder="Ej. Oficial de Cumplimiento"
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Evidencia
                  </label>
                  <input
                    type="text"
                    value={formData.evidencia || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, evidencia: e.target.value })
                    }
                    placeholder="Ej. Logs de auditoría"
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-slate-600 font-medium">
                  Ponderación Calculada:{" "}
                  <strong className="text-indigo-700 text-sm">
                    {calcularPonderacion(
                      formData.clase,
                      formData.tipo,
                      formData.frecuencia,
                      formData.formalidad
                    )}
                    %
                  </strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}