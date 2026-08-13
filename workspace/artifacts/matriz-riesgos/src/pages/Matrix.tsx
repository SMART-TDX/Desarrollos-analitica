import React, { useState, useEffect } from "react";
import { 
  Plus, 
  RotateCcw, 
  Search, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Edit3, 
  ShieldCheck,
  Check
} from "lucide-react";
import { CONTROLES_OFICIALES, ControlRow, calcularPonderacion } from "./Controls";

export interface RiesgoRow {
  id: string;
  codigo: string;
  proceso: string;
  subproceso?: string;
  descripcion: string;
  riesgo?: string; // Compatibilidad con versiones anteriores
  banderas?: {
    laft: boolean;
    operativo: boolean;
    legal: boolean;
    reputacional: boolean;
    contagio: boolean;
  };
  factorRiesgo: string;
  tipologia?: string;
  causa?: string;
  consecuencia?: string;
  probabilidadInherente: number;
  impactoInherente: number;
  controlCodigos?: string[]; // SOPORTE PARA MÚLTIPLES CONTROLES
  controlCodigo?: string;    // Compatibilidad con versión previa
  observaciones?: string;
}

export function getNivelRiesgo(score: number): { label: string; bgBadge: string } {
  if (score <= 4) {
    return { label: "BAJO", bgBadge: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold" };
  } else if (score <= 9) {
    return { label: "MEDIO", bgBadge: "bg-amber-100 text-amber-900 border border-amber-300 font-bold" };
  } else if (score <= 15) {
    return { label: "ALTO", bgBadge: "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold" };
  } else {
    return { label: "EXTREMO", bgBadge: "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold" };
  }
}

// Cálculo de Mitigación Combinada para Múltiples Controles
export function calcularMitigacionMultiple(ponderaciones: number[]): number {
  if (!ponderaciones || ponderaciones.length === 0) return 0;
  let factorResidual = 1;
  ponderaciones.forEach((p) => {
    factorResidual *= (1 - (p || 0) / 100);
  });
  const mitigacion = Math.round((1 - factorResidual) * 100);
  return Math.min(mitigacion, 95);
}

// Normalizador seguro para obtener lista de códigos de control de cualquier versión
function obtenerCodigosControlSeguros(item: RiesgoRow): string[] {
  if (Array.isArray(item.controlCodigos) && item.controlCodigos.length > 0) {
    return item.controlCodigos;
  }
  if (item.controlCodigo) {
    return [item.controlCodigo];
  }
  return [];
}

// Datos Iniciales de Muestra
export const RIESGOS_INICIALES: RiesgoRow[] = [
  {
    id: "1",
    codigo: "RIE-LAFT-01",
    proceso: "Comercial / Vinculación",
    subproceso: "Onboarding Clientes",
    descripcion: "Vinculación de clientes o contrapartes en listas restrictivas o con antecedentes LAFT",
    banderas: { laft: true, operativo: true, legal: true, reputacional: true, contagio: false },
    factorRiesgo: "Clientes / Contrapartes",
    tipologia: "Lavado mediante empresas fachada",
    causa: "Falta de verificación en listas restrictivas o actualización extemporánea",
    consecuencia: "Sanciones administrativas de la Superintendencia y daño reputacional",
    probabilidadInherente: 4,
    impactoInherente: 5,
    controlCodigos: ["CTR-LAFT-01", "CTR-LAFT-02"],
    observaciones: "Control preventivo crítico de consulta permanente en listas"
  },
  {
    id: "2",
    codigo: "RIE-LAFT-02",
    proceso: "Tesorería / Cartera",
    subproceso: "Recaudos y Pagos",
    descripcion: "Recaudo de efectivo o transferencias desde cuentas de origen no justificado",
    banderas: { laft: true, operativo: true, legal: false, reputacional: true, contagio: false },
    factorRiesgo: "Productos / Servicios",
    tipologia: "Paso de dinero de origen ilícito",
    causa: "Pagos de terceros no identificados o falta de conciliación bancaria diaria",
    consecuencia: "Ingreso de recursos ilícitos a la contabilidad de la organización",
    probabilidadInherente: 3,
    impactoInherente: 4,
    controlCodigos: ["CTR-LAFT-05"],
    observaciones: "Validación y causación de recibos de caja por cartera"
  },
  {
    id: "3",
    codigo: "RIE-LAFT-03",
    proceso: "Talento Humano",
    subproceso: "Contratación",
    descripcion: "Contratación de empleados vinculados con actividades de lavado de activos o financiación del terrorismo",
    banderas: { laft: true, operativo: false, legal: true, reputacional: true, contagio: false },
    factorRiesgo: "Clientes / Contrapartes",
    tipologia: "Complicidad interna",
    causa: "Estudios de seguridad o debida diligencia incompletos al momento del ingreso",
    consecuencia: "Uso de la infraestructura organizacional para operaciones sospechosas",
    probabilidadInherente: 3,
    impactoInherente: 4,
    controlCodigos: ["CTR-LAFT-18"],
    observaciones: "Procedimiento de debida diligencia en selección de personal"
  },
  {
    id: "4",
    codigo: "RIE-LAFT-04",
    proceso: "Compras / Contratación",
    subproceso: "Proveedores",
    descripcion: "Pagos a proveedores ficticios o empresas fachada para canalizar recursos ilegales",
    banderas: { laft: true, operativo: true, legal: true, reputacional: false, contagio: false },
    factorRiesgo: "Clientes / Contrapartes",
    tipologia: "Facturación falsa",
    causa: "Falta de validación del beneficiario final y certificación bancaria",
    consecuencia: "Infracciones normativas SAGRILAFT y pérdida de activos",
    probabilidadInherente: 3,
    impactoInherente: 5,
    controlCodigos: ["CTR-LAFT-09", "CTR-LAFT-13"],
    observaciones: "Política de pagos exclusivamente bancarizados a cuentas del titular"
  }
];

export default function Matrix() {
  const [controles, setControles] = useState<ControlRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_catalogo_controles_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar catálogo:", e);
    }
    return CONTROLES_OFICIALES;
  });

  const [riesgos, setRiesgos] = useState<RiesgoRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_matriz_riesgos_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalizar elementos para asegurar que tengan el campo descripcion y controlCodigos
          return parsed.map((r: any) => ({
            ...r,
            descripcion: r.descripcion || r.riesgo || "",
            controlCodigos: obtenerCodigosControlSeguros(r)
          }));
        }
      }
    } catch (e) {
      console.error("Error al cargar riesgos:", e);
    }
    return RIESGOS_INICIALES;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "form">("table");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<RiesgoRow>({
    id: "",
    codigo: "",
    proceso: "",
    subproceso: "",
    descripcion: "",
    banderas: { laft: true, operativo: false, legal: false, reputacional: false, contagio: false },
    factorRiesgo: "Clientes / Contrapartes",
    tipologia: "",
    causa: "",
    consecuencia: "",
    probabilidadInherente: 3,
    impactoInherente: 3,
    controlCodigos: [],
    observaciones: ""
  });

  useEffect(() => {
    try {
      localStorage.setItem("laft_matriz_riesgos_v3", JSON.stringify(riesgos));
    } catch (e) {
      console.error("Error al guardar en localStorage:", e);
    }
  }, [riesgos]);

  const handleOpenNewForm = () => {
    const nextNum = riesgos.length + 1;
    const nextCode = `RIE-LAFT-${nextNum < 10 ? "0" + nextNum : nextNum}`;
    setFormData({
      id: Date.now().toString(),
      codigo: nextCode,
      proceso: "",
      subproceso: "",
      descripcion: "",
      banderas: { laft: true, operativo: false, legal: false, reputacional: false, contagio: false },
      factorRiesgo: "Clientes / Contrapartes",
      tipologia: "",
      causa: "",
      consecuencia: "",
      probabilidadInherente: 3,
      impactoInherente: 3,
      controlCodigos: ["CTR-LAFT-01"],
      observaciones: ""
    });
    setEditingId(null);
    setViewMode("form");
  };

  const handleOpenEditForm = (item: RiesgoRow) => {
    setFormData({
      ...item,
      descripcion: item.descripcion || item.riesgo || "",
      controlCodigos: obtenerCodigosControlSeguros(item),
      banderas: item.banderas || { laft: true, operativo: false, legal: false, reputacional: false, contagio: false }
    });
    setEditingId(item.id);
    setViewMode("form");
  };

  const handleSaveRiesgo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.descripcion) {
      alert("Por favor ingrese al menos el código y la descripción del riesgo.");
      return;
    }

    if (editingId) {
      setRiesgos((prev) => prev.map((r) => (r.id === editingId ? formData : r)));
    } else {
      setRiesgos((prev) => [...prev, formData]);
    }

    setViewMode("table");
  };

  const handleDeleteRiesgo = (id: string) => {
    if (confirm("¿Está seguro de eliminar este riesgo de la matriz?")) {
      setRiesgos((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("¿Desea restablecer los riesgos iniciales de la matriz?")) {
      setRiesgos(RIESGOS_INICIALES);
      localStorage.removeItem("laft_matriz_riesgos_v3");
    }
  };

  const toggleControlInForm = (codigo: string) => {
    setFormData((prev) => {
      const currentCodigos = prev.controlCodigos || [];
      const exists = currentCodigos.includes(codigo);
      return {
        ...prev,
        controlCodigos: exists
          ? currentCodigos.filter((c) => c !== codigo)
          : [...currentCodigos, codigo]
      };
    });
  };

  const filteredRiesgos = riesgos.filter((r) => {
    const desc = (r.descripcion || r.riesgo || "").toLowerCase();
    const cod = (r.codigo || "").toLowerCase();
    const proc = (r.proceso || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return desc.includes(term) || cod.includes(term) || proc.includes(term);
  });

  // VISTA 1: FORMULARIO NUEVO / EDITAR RIESGO
  if (viewMode === "form") {
    const formControlCodigos = formData.controlCodigos || [];

    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
        {/* Encabezado Formulario */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("table")}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {editingId ? "Editar Riesgo" : "Nuevo Riesgo"}
              </h1>
              <p className="text-xs text-slate-500">
                Información detallada para la matriz LAFT
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveRiesgo}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Riesgo
          </button>
        </div>

        {/* Sección Identificación del Riesgo */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identificación del Riesgo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Código *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej. R-LAFT015"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Proceso *</label>
              <input
                type="text"
                value={formData.proceso}
                onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                placeholder="-- Seleccione o escriba --"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Subproceso</label>
              <input
                type="text"
                value={formData.subproceso || ""}
                onChange={(e) => setFormData({ ...formData, subproceso: e.target.value })}
                placeholder="-- Seleccione o escriba --"
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs">
              Descripción del Riesgo *
            </label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              placeholder="Describa claramente el evento de riesgo..."
            />
          </div>

          {/* Clasificación (Banderas) */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-500 mb-2 text-xs">
              Clasificación (Banderas)
            </label>
            <div className="flex flex-wrap gap-6 text-xs text-slate-700">
              {(["laft", "operativo", "legal", "reputacional", "contagio"] as const).map((flag) => (
                <label key={flag} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={formData.banderas?.[flag] || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        banderas: {
                          ...(formData.banderas || { laft: false, operativo: false, legal: false, reputacional: false, contagio: false }),
                          [flag]: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                  />
                  <span>{flag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Análisis Cualitativo */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Análisis Cualitativo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Factor de Riesgo</label>
              <select
                value={formData.factorRiesgo}
                onChange={(e) => setFormData({ ...formData, factorRiesgo: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600"
              >
                <option value="Clientes / Contrapartes">Clientes / Contrapartes</option>
                <option value="Productos / Servicios">Productos / Servicios</option>
                <option value="Canales de Distribución">Canales de Distribución</option>
                <option value="Jurisdicciones">Jurisdicciones</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipología</label>
              <input
                type="text"
                value={formData.tipologia || ""}
                onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                placeholder="Tipología LAFT identificada..."
                className="w-full p-2.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Causa Raíz</label>
              <textarea
                rows={2}
                value={formData.causa || ""}
                onChange={(e) => setFormData({ ...formData, causa: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Consecuencia / Impacto</label>
              <textarea
                rows={2}
                value={formData.consecuencia || ""}
                onChange={(e) => setFormData({ ...formData, consecuencia: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Probabilidad Inherente (1 a 5)</label>
              <select
                value={formData.probabilidadInherente}
                onChange={(e) => setFormData({ ...formData, probabilidadInherente: Number(e.target.value) })}
                className="w-full p-2.5 border border-amber-300 rounded-md font-bold bg-amber-50/60"
              >
                <option value={1}>1 - Rara vez</option>
                <option value={2}>2 - Improbable</option>
                <option value={3}>3 - Posible</option>
                <option value={4}>4 - Probable</option>
                <option value={5}>5 - Casi seguro</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Impacto Inherente (1 a 5)</label>
              <select
                value={formData.impactoInherente}
                onChange={(e) => setFormData({ ...formData, impactoInherente: Number(e.target.value) })}
                className="w-full p-2.5 border border-amber-300 rounded-md font-bold bg-amber-50/60"
              >
                <option value={1}>1 - Insignificante</option>
                <option value={2}>2 - Menor</option>
                <option value={3}>3 - Moderado</option>
                <option value={4}>4 - Mayor</option>
                <option value={5}>5 - Catastrófico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección Asignación de Controles */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Asignación de Controles (Soporta Múltiples Controles)
              </h2>
              <p className="text-xs text-slate-500">
                Seleccione uno o varios controles del Catálogo oficial para este riesgo.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
              {formControlCodigos.length} Controles Asignados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50/50 text-xs">
            {controles.map((ctrl) => {
              const isSelected = formControlCodigos.includes(ctrl.codigo);
              const pCtrl = calcularPonderacion(ctrl.clase, ctrl.tipo, ctrl.frecuencia, ctrl.formalidad);

              return (
                <div
                  key={ctrl.id}
                  onClick={() => toggleControlInForm(ctrl.codigo)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-indigo-50/90 border-indigo-500 text-indigo-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                    isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">{ctrl.codigo}</span>
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-slate-200/70 rounded">
                        Ponderación: {pCtrl}%
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-600">
                      {ctrl.control}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: TABLA MATRIZ DE RIESGOS
  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Encabezado Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Matriz de Riesgos LAFT / PADM
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluación del Riesgo Inherente y cálculo de mitigación acumulada de Controles Múltiples.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer Matriz
          </button>
          <button
            onClick={handleOpenNewForm}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Riesgo
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar riesgo por código, proceso o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Tabla Matriz de Riesgos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1a2332] text-white font-semibold text-xs border-b border-slate-700">
                <th className="p-3.5 w-28">Código</th>
                <th className="p-3.5 w-36">Proceso</th>
                <th className="p-3.5 w-40">Factor Riesgo</th>
                <th className="p-3.5 min-w-[280px]">Descripción del Riesgo</th>
                
                <th className="p-3.5 w-20 text-center">Prob. Inh.</th>
                <th className="p-3.5 w-20 text-center">Imp. Inh.</th>
                <th className="p-3.5 w-32 text-center">Riesgo Inherente</th>
                
                <th className="p-3.5 min-w-[320px]">Controles Asignados (Catálogo)</th>
                <th className="p-3.5 w-32 text-center">Mitigación Acumulada (%)</th>
                
                <th className="p-3.5 w-32 text-center">Riesgo Residual</th>
                <th className="p-3.5 w-24 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRiesgos.map((item, idx) => {
                const inhScore = (item.probabilidadInherente || 1) * (item.impactoInherente || 1);
                const inhLevel = getNivelRiesgo(inhScore);

                const itemCodigos = obtenerCodigosControlSeguros(item);
                const controlesAsignados = controles.filter((c) =>
                  itemCodigos.includes(c.codigo)
                );

                const ponderaciones = controlesAsignados.map((c) =>
                  calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad)
                );

                const mitigacionTotal = calcularMitigacionMultiple(ponderaciones);
                const resScore = Math.max(1, Math.round(inhScore * (1 - mitigacionTotal / 100)));
                const resLevel = getNivelRiesgo(resScore);

                return (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/40 hover:bg-slate-100/60"}
                  >
                    <td className="p-3 font-bold text-slate-900 align-middle">
                      {item.codigo}
                    </td>

                    <td className="p-3 align-middle text-slate-700 font-medium">
                      {item.proceso}
                    </td>

                    <td className="p-3 align-middle text-slate-700">
                      {item.factorRiesgo}
                    </td>

                    <td className="p-3 align-middle text-slate-800 leading-relaxed">
                      {item.descripcion || item.riesgo}
                    </td>

                    <td className="p-2 align-middle text-center font-bold bg-amber-50/50 text-amber-900">
                      {item.probabilidadInherente}
                    </td>

                    <td className="p-2 align-middle text-center font-bold bg-amber-50/50 text-amber-900">
                      {item.impactoInherente}
                    </td>

                    <td className="p-2 align-middle text-center">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs tracking-wide shadow-xs ${inhLevel.bgBadge}`}>
                        {inhScore} - {inhLevel.label}
                      </div>
                    </td>

                    <td className="p-2 align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {controlesAsignados.length > 0 ? (
                          controlesAsignados.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded text-[11px] font-medium"
                              title={c.control}
                            >
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              <b className="font-bold">{c.codigo}</b>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sin control asignado</span>
                        )}
                      </div>
                    </td>

                    <td className="p-2 align-middle text-center font-extrabold text-indigo-700 bg-indigo-50/40 text-sm">
                      {mitigacionTotal}%
                    </td>

                    <td className="p-2 align-middle text-center">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs tracking-wide shadow-xs ${resLevel.bgBadge}`}>
                        {resScore} - {resLevel.label}
                      </div>
                    </td>

                    <td className="p-2 align-middle text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditForm(item)}
                          className="text-slate-500 hover:text-indigo-600 transition-colors p-1"
                          title="Editar riesgo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRiesgo(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Eliminar riesgo"
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
    </div>
  );
}