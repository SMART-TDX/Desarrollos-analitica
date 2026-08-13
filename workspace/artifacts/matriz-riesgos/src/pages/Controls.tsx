import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, RotateCcw, ShieldCheck, Settings } from "lucide-react";

// 1. ESTRUCTURA DE PARÁMETROS DE PONDERACIÓN
export interface ParametrosControl {
  pesos: {
    clase: number;       // Peso PARAMETROS!$E$6 (ej. 0.35)
    tipo: number;        // Peso PARAMETROS!$G$6 (ej. 0.30)
    frecuencia: number;  // Peso PARAMETROS!$I$6 (ej. 0.20)
    formalidad: number;  // Peso PARAMETROS!$K$6 (ej. 0.15)
  };
  valores: {
    clase: Record<string, number>;
    tipo: Record<string, number>;
    frecuencia: Record<string, number>;
    formalidad: Record<string, number>;
  };
}

export const PARAMETROS_DEFAULT: ParametrosControl = {
  pesos: {
    clase: 0.35,
    tipo: 0.30,
    frecuencia: 0.20,
    formalidad: 0.15,
  },
  valores: {
    clase: {
      "Preventivo": 100,
      "Detectivo": 70,
      "Correctivo": 40,
    },
    tipo: {
      "Automático": 100,
      "Semiautomático": 70,
      "Manual": 40,
    },
    frecuencia: {
      "Continuo / En tiempo real": 100,
      "Diario": 90,
      "Semanal": 80,
      "Mensual": 70,
      "Bimestral": 60,
      "Trimestral": 50,
      "Semestral": 40,
      "Anual": 30,
      "Ocasional": 20,
    },
    formalidad: {
      "Documentado y Formalizado": 100,
      "Documentado no Formalizado": 60,
      "No Documentado": 20,
    },
  },
};

export interface ControlRow {
  id: string;
  codigo: string;
  control: string;
  clase: string;
  tipo: string;
  frecuencia: string;
  formalidad: string;
  responsable?: string;
  evidencia?: string;
}

// 2. FÓRMULA DE PONDERACIÓN FIEL A EXCEL
// =@SI.ERROR((($D2*PARAMETROS!$E$6))+(($F2*PARAMETROS!$G$6))+(($H2*PARAMETROS!$I$6))+(($J2*PARAMETROS!$K$6));NOD())
export function calcularPonderacion(
  clase: string,
  tipo: string,
  frecuencia: string,
  formalidad: string,
  parametrosCustom?: ParametrosControl
): number {
  const params = parametrosCustom || obtenerParametrosGuardados();

  const vClase = params.valores.clase[clase] ?? 0;
  const vTipo = params.valores.tipo[tipo] ?? 0;
  const vFrecuencia = params.valores.frecuencia[frecuencia] ?? 0;
  const vFormalidad = params.valores.formalidad[formalidad] ?? 0;

  const pClase = params.pesos.clase;
  const pTipo = params.pesos.tipo;
  const pFrecuencia = params.pesos.frecuencia;
  const pFormalidad = params.pesos.formalidad;

  // Fórmula ponderada exacta
  const ponderacion = (vClase * pClase) + (vTipo * pTipo) + (vFrecuencia * pFrecuencia) + (vFormalidad * pFormalidad);

  return Math.round(ponderacion);
}

export function obtenerParametrosGuardados(): ParametrosControl {
  try {
    const saved = localStorage.getItem("laft_parametros_controles_v1");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error cargando parámetros de controles:", e);
  }
  return PARAMETROS_DEFAULT;
}

export const CONTROLES_OFICIALES: ControlRow[] = [
  {
    id: "1",
    codigo: "CTR-LAFT-01",
    control: "Consulta previa en listas restrictivas y vinculante antes del enrolamiento",
    clase: "Preventivo",
    tipo: "Automático",
    frecuencia: "Continuo / En tiempo real",
    formalidad: "Documentado y Formalizado",
    responsable: "Analista Sagrilaft",
    evidencia: "Logs de consulta en sistema"
  },
  {
    id: "2",
    codigo: "CTR-LAFT-02",
    control: "Verificación periódica de contrapartes existentes en listas de sanción",
    clase: "Detectivo",
    tipo: "Semiautomático",
    frecuencia: "Mensual",
    formalidad: "Documentado y Formalizado",
    responsable: "Oficial de Cumplimiento",
    evidencia: "Reportes mensuales de coincidencias"
  },
  {
    id: "3",
    codigo: "CTR-LAFT-03",
    control: "Monitoreo y conciliación de transacciones inusuales de cartera",
    clase: "Detectivo",
    tipo: "Manual",
    frecuencia: "Diario",
    formalidad: "Documentado no Formalizado",
    responsable: "Líder de Cartera",
    evidencia: "Planilla de inconsistencias"
  }
];

export default function Controls() {
  const [parametros, setParametros] = useState<ParametrosControl>(obtenerParametrosGuardados);
  const [controles, setControles] = useState<ControlRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_catalogo_controles_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar controles:", e);
    }
    return CONTROLES_OFICIALES;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showParams, setShowParams] = useState(false);

  const [formData, setFormData] = useState<ControlRow>({
    id: "",
    codigo: "",
    control: "",
    clase: "Preventivo",
    tipo: "Automático",
    frecuencia: "Mensual",
    formalidad: "Documentado y Formalizado",
    responsable: "",
    evidencia: ""
  });

  useEffect(() => {
    localStorage.setItem("laft_catalogo_controles_v3", JSON.stringify(controles));
  }, [controles]);

  useEffect(() => {
    localStorage.setItem("laft_parametros_controles_v1", JSON.stringify(parametros));
  }, [parametros]);

  const handleSaveControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.control) {
      alert("Por favor ingrese código y descripción del control.");
      return;
    }

    if (editingId) {
      setControles(prev => prev.map(c => c.id === editingId ? formData : c));
      setEditingId(null);
    } else {
      setControles(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }

    setFormData({
      id: "",
      codigo: `CTR-LAFT-0${controles.length + 2}`,
      control: "",
      clase: "Preventivo",
      tipo: "Automático",
      frecuencia: "Mensual",
      formalidad: "Documentado y Formalizado",
      responsable: "",
      evidencia: ""
    });
  };

  const handleEdit = (item: ControlRow) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Desea eliminar este control?")) {
      setControles(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-[1500px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catálogo de Controles LAFT</h1>
            <p className="text-xs text-slate-500">Ponderación parametrizada según fórmula de matriz de riesgo</p>
          </div>
        </div>

        <button
          onClick={() => setShowParams(!showParams)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-600" />
          {showParams ? "Ocultar Parámetros" : "Configurar Pesos de Parámetros"}
        </button>
      </div>

      {/* PANEL CONFIGURACIÓN DE PARÁMETROS (SI SE ACTIVA) */}
      {showParams && (
        <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Pesos de los Atributos (Ponderación = Clase × P1 + Tipo × P2 + Frecuencia × P3 + Formalidad × P4)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Peso Clase (D2 * E6)</label>
              <input
                type="number"
                step="0.05"
                value={parametros.pesos.clase}
                onChange={e => setParametros({
                  ...parametros,
                  pesos: { ...parametros.pesos, clase: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Peso Tipo (F2 * G6)</label>
              <input
                type="number"
                step="0.05"
                value={parametros.pesos.tipo}
                onChange={e => setParametros({
                  ...parametros,
                  pesos: { ...parametros.pesos, tipo: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Peso Frecuencia (H2 * I6)</label>
              <input
                type="number"
                step="0.05"
                value={parametros.pesos.frecuencia}
                onChange={e => setParametros({
                  ...parametros,
                  pesos: { ...parametros.pesos, frecuencia: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-slate-300 rounded font-bold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Peso Formalidad (J2 * K6)</label>
              <input
                type="number"
                step="0.05"
                value={parametros.pesos.formalidad}
                onChange={e => setParametros({
                  ...parametros,
                  pesos: { ...parametros.pesos, formalidad: parseFloat(e.target.value) || 0 }
                })}
                className="w-full p-2 border border-slate-300 rounded font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO AGREGAR / EDITAR CONTROL */}
      <form onSubmit={handleSaveControl} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          {editingId ? "Editar Control" : "Registrar Nuevo Control"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Código *</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={e => setFormData({ ...formData, codigo: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
              placeholder="Ej. CTR-LAFT-04"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block font-medium text-slate-700 mb-1">Nombre / Descripción del Control *</label>
            <input
              type="text"
              value={formData.control}
              onChange={e => setFormData({ ...formData, control: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
              placeholder="Describa el control aplicable..."
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Clase</label>
            <select
              value={formData.clase}
              onChange={e => setFormData({ ...formData, clase: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
            >
              {Object.keys(parametros.valores.clase).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Tipo</label>
            <select
              value={formData.tipo}
              onChange={e => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
            >
              {Object.keys(parametros.valores.tipo).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Frecuencia</label>
            <select
              value={formData.frecuencia}
              onChange={e => setFormData({ ...formData, frecuencia: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
            >
              {Object.keys(parametros.valores.frecuencia).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Formalidad</label>
            <select
              value={formData.formalidad}
              onChange={e => setFormData({ ...formData, formalidad: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
            >
              {Object.keys(parametros.valores.formalidad).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
          >
            <Save className="w-4 h-4" />
            {editingId ? "Actualizar Control" : "Guardar Control"}
          </button>
        </div>
      </form>

      {/* TABLA DE CONTROLES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
              <th className="p-3">Código</th>
              <th className="p-3">Control</th>
              <th className="p-3">Clase</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Frecuencia</th>
              <th className="p-3">Formalidad</th>
              <th className="p-3 text-center bg-indigo-50 text-indigo-900 border-x border-indigo-200">
                Ponderación (%)
              </th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {controles.map(c => {
              const ponderacion = calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad, parametros);
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{c.codigo}</td>
                  <td className="p-3 font-medium text-slate-800">{c.control}</td>
                  <td className="p-3 text-slate-600">{c.clase}</td>
                  <td className="p-3 text-slate-600">{c.tipo}</td>
                  <td className="p-3 text-slate-600">{c.frecuencia}</td>
                  <td className="p-3 text-slate-600">{c.formalidad}</td>
                  <td className="p-3 text-center font-extrabold text-indigo-700 bg-indigo-50/50 border-x border-indigo-100 font-mono text-sm">
                    {ponderacion}%
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1 text-slate-500 hover:text-indigo-600">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1 text-slate-400 hover:text-rose-600">
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
  );
}