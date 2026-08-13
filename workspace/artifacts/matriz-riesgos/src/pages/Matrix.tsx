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
  Check,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { CONTROLES_OFICIALES, ControlRow, calcularPonderacion } from "./Controls";

export interface RiesgoRow {
  id: string;
  codigo: string;
  proceso: string;
  subproceso?: string;
  descripcion: string;
  quePuedeSuceder?: string;
  banderas?: {
    laft: boolean;
    operativo: boolean;
    legal: boolean;
    reputacional: boolean;
    contagio: boolean;
  };
  factorRiesgo: string;
  tipologia?: string;
  porQuePuedeSuceder?: string;
  causa?: string;
  consecuencia?: string;
  probabilidadInherente: number;
  impactoInherente: number;
  probabilidadResidual?: number;
  impactoResidual?: number;
  tipoMonitoreo?: string;
  responsable?: string;
  controlCodigos?: string[];
  controlCodigo?: string;
  observaciones?: string;
}

// Valores por defecto estandarizados
const DEFAULTS_PROCESOS = [
  "GESTION ADMINISTRATIVA Y FINANCIERA",
  "Gestión Académica",
  "Gestión Comercial",
  "Gestión Humana",
  "Gestión Jurídica",
  "Gestión de Tecnología"
];

const DEFAULTS_SUBPROCESOS = [
  "CARTERA",
  "COMERCIALL-TELEMERCADEO-VENTAS",
  "COMERCIALL-TELEMERCADEO-VENTAS-CORPORATIVO Y PERSONALIZADO-EXAMENES INTERNACIONALES-INSTITUTO-SMART ONLINE",
  "COMPRAS",
  "CONTABILIDAD",
  "INSTITUTO"
];

const DEFAULTS_FACTORES = [
  "ALIADOS ESTRATÉGICOS",
  "CANALES DE DISTRIBUCIÓN",
  "Colaboradores",
  "EMPLEADOS",
  "ESTUDIANTES",
  "PRODUCTOS Y SERVICIOS",
  "PROVEEDORES",
  "TECNOLÓGICO"
];

const OPCIONES_MONITOREO = [
  "Continuo / En tiempo real",
  "Diario",
  "Semanal",
  "Mensual",
  "Bimestral",
  "Trimestral",
  "Semestral",
  "Anual"
];

export function getNivelRiesgo(score: number): { label: string; bgBadge: string } {
  if (score <= 4) {
    return { label: "BAJO", bgBadge: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold" };
  } else if (score <= 9) {
    return { label: "MEDIO", bgBadge: "bg-amber-100 text-amber-900 border border-amber-300 font-bold" };
  } else if (score <= 15) {
    return { label: "ALTO", bgBadge: "bg-orange-100 text-orange-900 border border-orange-300 font-extrabold" };
  } else {
    return { label: "EXTREMO", bgBadge: "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold" };
  }
}

function getColorsPDF(label: string): { bg: string; text: string } {
  switch (label) {
    case "BAJO": return { bg: "#d1fae5", text: "#065f46" };
    case "MEDIO": return { bg: "#fef3c7", text: "#92400e" };
    case "ALTO": return { bg: "#ffedd5", text: "#9a3412" };
    case "EXTREMO": default: return { bg: "#ffe4e6", text: "#9f1239" };
  }
}

export function calcularMitigacionMultiple(ponderaciones: number[]): number {
  if (!ponderaciones || ponderaciones.length === 0) return 0;
  let factorResidual = 1;
  ponderaciones.forEach((p) => {
    factorResidual *= (1 - (p || 0) / 100);
  });
  const mitigacion = Math.round((1 - factorResidual) * 100);
  return Math.min(mitigacion, 95);
}

function obtenerCodigosControlSeguros(item: RiesgoRow): string[] {
  if (Array.isArray(item.controlCodigos) && item.controlCodigos.length > 0) {
    return item.controlCodigos;
  }
  if (item.controlCodigo) {
    return [item.controlCodigo];
  }
  return [];
}

export const RIESGOS_INICIALES: RiesgoRow[] = [
  {
    id: "1",
    codigo: "RIE-LAFT-01",
    proceso: "Gestión Comercial",
    subproceso: "COMERCIALL-TELEMERCADEO-VENTAS",
    descripcion: "Vinculación de clientes o contrapartes en listas restrictivas o con antecedentes LAFT",
    quePuedeSuceder: "Ingreso o vinculación de un cliente que figure en listas restrictivas de control o antecedentes vinculados a LAFT.",
    banderas: { laft: true, operativo: true, legal: true, reputacional: true, contagio: false },
    factorRiesgo: "ESTUDIANTES",
    tipologia: "Renuencia del cliente a suministrar la información y documentación solicitada por la academia",
    porQuePuedeSuceder: "Falta de verificación en listas restrictivas o actualización extemporánea de las herramientas de consulta.",
    causa: "Falta de verificación en listas restrictivas o actualización extemporánea de las herramientas de consulta.",
    consecuencia: "Sanciones administrativas de la Superintendencia de Sociedades y daño reputacional.",
    probabilidadInherente: 4,
    impactoInherente: 5,
    probabilidadResidual: 2,
    impactoResidual: 2,
    tipoMonitoreo: "Mensual",
    responsable: "Oficial de Cumplimiento",
    controlCodigos: ["CTR-LAFT-01", "CTR-LAFT-02"],
    observaciones: "Control preventivo crítico de consulta permanente en listas"
  },
  {
    id: "2",
    codigo: "RIE-LAFT-02",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    subproceso: "CARTERA",
    descripcion: "Recaudo de efectivo o transferencias desde cuentas de origen no justificado",
    quePuedeSuceder: "Aceptación de pagos por matrícula o servicios con fondos cuyo origen ilícito no es justificado.",
    banderas: { laft: true, operativo: true, legal: false, reputacional: true, contagio: false },
    factorRiesgo: "PRODUCTOS Y SERVICIOS",
    tipologia: "Paso de dinero de origen ilícito mediante consignaciones en efectivo de terceros",
    porQuePuedeSuceder: "Pagos de terceros no identificados o falta de conciliación bancaria diaria.",
    causa: "Pagos de terceros no identificados o falta de conciliación bancaria diaria.",
    consecuencia: "Ingreso de recursos ilícitos a la contabilidad de la organización e investigaciones penales.",
    probabilidadInherente: 3,
    impactoInherente: 4,
    probabilidadResidual: 1,
    impactoResidual: 2,
    tipoMonitoreo: "Continuo / En tiempo real",
    responsable: "Líder de Cartera y Tesorería",
    controlCodigos: ["CTR-LAFT-05"],
    observaciones: "Validación y causación de recibos de caja por cartera"
  }
];

export default function Matrix() {
  const [controles] = useState<ControlRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_catalogo_controles_v3");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar catálogo:", e);
    }
    return CONTROLES_OFICIALES;
  });

  // Parámetros Dinámicos
  const [listaProcesos, setListaProcesos] = useState<string[]>(DEFAULTS_PROCESOS);
  const [listaSubprocesos, setListaSubprocesos] = useState<string[]>(DEFAULTS_SUBPROCESOS);
  const [listaFactores, setListaFactores] = useState<string[]>(DEFAULTS_FACTORES);

  useEffect(() => {
    try {
      const savedParams = localStorage.getItem("laft_parametros_v1");
      if (savedParams) {
        const parsed = JSON.parse(savedParams);
        if (parsed.procesos?.length) setListaProcesos(parsed.procesos);
        if (parsed.subprocesos?.length) setListaSubprocesos(parsed.subprocesos);
        if (parsed.factores?.length) setListaFactores(parsed.factores);
      } else {
        const pProcesos = localStorage.getItem("laft_param_procesos");
        if (pProcesos) setListaProcesos(JSON.parse(pProcesos));
        const pSubprocesos = localStorage.getItem("laft_param_subprocesos");
        if (pSubprocesos) setListaSubprocesos(JSON.parse(pSubprocesos));
        const pFactores = localStorage.getItem("laft_param_factores");
        if (pFactores) setListaFactores(JSON.parse(pFactores));
      }
    } catch (e) {
      console.error("Error al cargar parámetros:", e);
    }
  }, []);

  const [riesgos, setRiesgos] = useState<RiesgoRow[]>(() => {
    try {
      const saved = localStorage.getItem("laft_matriz_riesgos_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => ({
            ...r,
            descripcion: r.descripcion || r.quePuedeSuceder || r.riesgo || "",
            quePuedeSuceder: r.quePuedeSuceder || r.descripcion || "",
            porQuePuedeSuceder: r.porQuePuedeSuceder || r.causa || "",
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

  const [formData, setFormData] = useState<RiesgoRow>({
    id: "",
    codigo: "",
    proceso: DEFAULTS_PROCESOS[0] || "",
    subproceso: DEFAULTS_SUBPROCESOS[0] || "",
    descripcion: "",
    quePuedeSuceder: "",
    banderas: { laft: true, operativo: false, legal: false, reputacional: false, contagio: false },
    factorRiesgo: DEFAULTS_FACTORES[0] || "",
    tipologia: "",
    porQuePuedeSuceder: "",
    consecuencia: "",
    probabilidadInherente: 3,
    impactoInherente: 3,
    probabilidadResidual: 2,
    impactoResidual: 2,
    tipoMonitoreo: "Mensual",
    responsable: "Oficial de Cumplimiento",
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
      proceso: listaProcesos[0] || "",
      subproceso: listaSubprocesos[0] || "",
      descripcion: "",
      quePuedeSuceder: "",
      banderas: { laft: true, operativo: false, legal: false, reputacional: false, contagio: false },
      factorRiesgo: listaFactores[0] || "",
      tipologia: "",
      porQuePuedeSuceder: "",
      consecuencia: "",
      probabilidadInherente: 3,
      impactoInherente: 3,
      probabilidadResidual: 2,
      impactoResidual: 2,
      tipoMonitoreo: "Mensual",
      responsable: "Oficial de Cumplimiento",
      controlCodigos: ["CTR-LAFT-01"],
      observaciones: ""
    });
    setEditingId(null);
    setViewMode("form");
  };

  const handleOpenEditForm = (item: RiesgoRow) => {
    setFormData({
      ...item,
      proceso: item.proceso || listaProcesos[0] || "",
      subproceso: item.subproceso || listaSubprocesos[0] || "",
      factorRiesgo: item.factorRiesgo || listaFactores[0] || "",
      quePuedeSuceder: item.quePuedeSuceder || item.descripcion || "",
      porQuePuedeSuceder: item.porQuePuedeSuceder || item.causa || "",
      probabilidadResidual: item.probabilidadResidual || 2,
      impactoResidual: item.impactoResidual || 2,
      tipoMonitoreo: item.tipoMonitoreo || "Mensual",
      responsable: item.responsable || "Oficial de Cumplimiento",
      controlCodigos: obtenerCodigosControlSeguros(item),
      banderas: item.banderas || { laft: true, operativo: false, legal: false, reputacional: false, contagio: false }
    });
    setEditingId(item.id);
    setViewMode("form");
  };

  const handleSaveRiesgo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo) {
      alert("Por favor ingrese el código del riesgo.");
      return;
    }

    const payload = {
      ...formData,
      descripcion: formData.quePuedeSuceder || formData.descripcion,
      causa: formData.porQuePuedeSuceder || formData.causa
    };

    if (editingId) {
      setRiesgos((prev) => prev.map((r) => (r.id === editingId ? payload : r)));
    } else {
      setRiesgos((prev) => [...prev, payload]);
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
    const desc = (r.quePuedeSuceder || r.descripcion || "").toLowerCase();
    const cod = (r.codigo || "").toLowerCase();
    const proc = (r.proceso || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return desc.includes(term) || cod.includes(term) || proc.includes(term);
  });

  // Exportar Excel
  const handleExportExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Código;Proceso;Subproceso;Factor Riesgo;¿Qué puede suceder?;Tipología;¿Por qué puede suceder?;Consecuencias;Prob. Inh.;Imp. Inh.;Riesgo Inherente;Controles;Mitigación (%);Prob. Res.;Imp. Res.;Riesgo Residual;Tipo Monitoreo;Responsable\n";

    filteredRiesgos.forEach((r) => {
      const inhScore = (r.probabilidadInherente || 1) * (r.impactoInherente || 1);
      const inhLevel = getNivelRiesgo(inhScore).label;
      const resProb = r.probabilidadResidual || 1;
      const resImp = r.impactoResidual || 1;
      const resScoreManual = resProb * resImp;
      const resLevel = getNivelRiesgo(resScoreManual).label;

      const itemCodigos = obtenerCodigosControlSeguros(r);
      const controlesAsignados = controles.filter((c) => itemCodigos.includes(c.codigo));
      const ponderaciones = controlesAsignados.map((c) => calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad));
      const mitigacionTotal = calcularMitigacionMultiple(ponderaciones);

      const listaControles = controlesAsignados.map(c => `[${c.codigo}] ${c.control}`).join(" | ");

      const row = [
        `"${r.codigo}"`,
        `"${r.proceso}"`,
        `"${r.subproceso || ''}"`,
        `"${r.factorRiesgo}"`,
        `"${(r.quePuedeSuceder || r.descripcion || '').replace(/"/g, '""')}"`,
        `"${(r.tipologia || '').replace(/"/g, '""')}"`,
        `"${(r.porQuePuedeSuceder || r.causa || '').replace(/"/g, '""')}"`,
        `"${(r.consecuencia || '').replace(/"/g, '""')}"`,
        r.probabilidadInherente,
        r.impactoInherente,
        `"${inhScore} - ${inhLevel}"`,
        `"${listaControles.replace(/"/g, '""')}"`,
        `"${mitigacionTotal}%"`,
        resProb,
        resImp,
        `"${resScoreManual} - ${resLevel}"`,
        `"${r.tipoMonitoreo || ''}"`,
        `"${r.responsable || ''}"`
      ].join(";");

      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Matriz_Riesgos_LAFT_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar PDF
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHTML = filteredRiesgos.map((item) => {
      const inhScore = (item.probabilidadInherente || 1) * (item.impactoInherente || 1);
      const inhLevel = getNivelRiesgo(inhScore);
      const inhColors = getColorsPDF(inhLevel.label);

      const resProb = item.probabilidadResidual || 1;
      const resImp = item.impactoResidual || 1;
      const resScore = resProb * resImp;
      const resLevel = getNivelRiesgo(resScore);
      const resColors = getColorsPDF(resLevel.label);

      const itemCodigos = obtenerCodigosControlSeguros(item);
      const controlesAsignados = controles.filter((c) => itemCodigos.includes(c.codigo));

      return `
        <tr style="page-break-inside: avoid;">
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${item.codigo}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;"><b>${item.proceso}</b><br/><span style="color:#64748b; font-size:8px;">${item.subproceso || ''}</span></td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;"><b>${item.factorRiesgo}</b><br/><span style="color:#0284c7; font-size:8px;">${item.tipologia || ''}</span></td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">
            <b>¿Qué puede suceder?:</b> ${item.quePuedeSuceder || item.descripcion || ''}<br/>
            <span style="color:#475569;"><b>Por qué:</b> ${item.porQuePuedeSuceder || item.causa || ''}</span><br/>
            <span style="color:#dc2626;"><b>Consecuencia:</b> ${item.consecuencia || ''}</span>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 8px;">P:${item.probabilidadInherente} I:${item.impactoInherente}</div>
            <div style="padding: 3px; border-radius: 4px; font-weight: bold; background-color: ${inhColors.bg}; color: ${inhColors.text};">
              ${inhScore} - ${inhLevel.label}
            </div>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 8px;">P:${resProb} I:${resImp}</div>
            <div style="padding: 3px; border-radius: 4px; font-weight: bold; background-color: ${resColors.bg}; color: ${resColors.text};">
              ${resScore} - ${resLevel.label}
            </div>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">
            <div><b>Monitoreo:</b> ${item.tipoMonitoreo || 'N/A'}</div>
            <div><b>Responsable:</b> ${item.responsable || 'N/A'}</div>
          </td>
        </tr>
      `;
    }).join("");

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Matriz de Riesgos LAFT</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { font-family: Arial, sans-serif; font-size: 9px; color: #0f172a; margin: 0; padding: 5px; }
            h1 { font-size: 15px; margin: 0 0 4px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Reporte General de Riesgos y Análisis Cualitativo</h1>
          <table>
            <thead>
              <tr>
                <th style="width: 70px;">Código</th>
                <th style="width: 110px;">Proceso / Subp.</th>
                <th style="width: 110px;">Factor / Tipología</th>
                <th>Análisis Cualitativo del Riesgo</th>
                <th style="width: 80px; text-align: center;">R. Inherente</th>
                <th style="width: 80px; text-align: center;">R. Residual</th>
                <th style="width: 120px;">Monitoreo / Resp.</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const opcionesProcesos = Array.from(new Set([...listaProcesos, formData.proceso])).filter(Boolean);
  const opcionesSubprocesos = Array.from(new Set([...listaSubprocesos, formData.subproceso || ""])).filter(Boolean);
  const opcionesFactores = Array.from(new Set([...listaFactores, formData.factorRiesgo])).filter(Boolean);

  // VISTA 1: FORMULARIO
  if (viewMode === "form") {
    const formControlCodigos = formData.controlCodigos || [];

    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
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
                Formulario de identificación y análisis cualitativo estandarizado
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

        {/* IDENTIFICACIÓN GENERAL */}
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
                placeholder="Ej. RIE-LAFT-05"
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Proceso *</label>
              <select
                value={formData.proceso}
                onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-medium"
              >
                <option value="">-- Seleccione Proceso --</option>
                {opcionesProcesos.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Subproceso</label>
              <select
                value={formData.subproceso || ""}
                onChange={(e) => setFormData({ ...formData, subproceso: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              >
                <option value="">-- Seleccione Subproceso --</option>
                {opcionesSubprocesos.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>

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

        {/* ANÁLISIS CUALITATIVO REESTRUCTURADO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Análisis Cualitativo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. FACTOR DE RIESGO */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Factor de Riesgo *</label>
              <select
                value={formData.factorRiesgo}
                onChange={(e) => setFormData({ ...formData, factorRiesgo: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-medium"
              >
                <option value="">-- Seleccione Factor de Riesgo --</option>
                {opcionesFactores.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* 3. TIPOLOGÍA */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipología</label>
              <input
                type="text"
                value={formData.tipologia || ""}
                onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                placeholder="Ej. Renuencia del cliente a suministrar información..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>
          </div>

          {/* 2. ¿QUÉ PUEDE SUCEDER? */}
          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs">
              ¿Qué puede suceder? *
            </label>
            <textarea
              rows={2}
              value={formData.quePuedeSuceder || formData.descripcion || ""}
              onChange={(e) => setFormData({ ...formData, quePuedeSuceder: e.target.value, descripcion: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              placeholder="Describa el evento de riesgo o situación que puede ocurrir..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 4. ¿POR QUÉ PUEDE SUCEDER? */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">¿Por qué puede suceder? (Causa Raíz)</label>
              <textarea
                rows={2}
                value={formData.porQuePuedeSuceder || formData.causa || ""}
                onChange={(e) => setFormData({ ...formData, porQuePuedeSuceder: e.target.value, causa: e.target.value })}
                placeholder="Indique las causas, falencias o factores desencadenantes..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            {/* 5. CONSECUENCIAS */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Consecuencias / Impacto</label>
              <textarea
                rows={2}
                value={formData.consecuencia || ""}
                onChange={(e) => setFormData({ ...formData, consecuencia: e.target.value })}
                placeholder="Detalle el impacto legal, operativo, financiero o reputacional..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>
          </div>

          {/* 6. PROBABILIDAD E IMPACTO INHERENTE */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Evaluación del Riesgo Inherente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Probabilidad Inherente (1 a 5)</label>
                <select
                  value={formData.probabilidadInherente}
                  onChange={(e) => setFormData({ ...formData, probabilidadInherente: Number(e.target.value) })}
                  className="w-full p-2.5 border border-amber-300 rounded-md font-bold bg-amber-50/60 focus:ring-1 focus:ring-amber-500"
                >
                  <option value={1}>1 - Raro</option>
                  <option value={2}>2 - Improbable</option>
                  <option value={3}>3 - Posible</option>
                  <option value={4}>4 - Probable</option>
                  <option value={5}>5 - Casi Seguro</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Impacto Inherente (1 a 5)</label>
                <select
                  value={formData.impactoInherente}
                  onChange={(e) => setFormData({ ...formData, impactoInherente: Number(e.target.value) })}
                  className="w-full p-2.5 border border-amber-300 rounded-md font-bold bg-amber-50/60 focus:ring-1 focus:ring-amber-500"
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

          {/* 7. PROBABILIDAD E IMPACTO RESIDUAL */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Evaluación del Riesgo Residual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Probabilidad Residual (1 a 5)</label>
                <select
                  value={formData.probabilidadResidual || 2}
                  onChange={(e) => setFormData({ ...formData, probabilidadResidual: Number(e.target.value) })}
                  className="w-full p-2.5 border border-emerald-300 rounded-md font-bold bg-emerald-50/60 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={1}>1 - Raro</option>
                  <option value={2}>2 - Improbable</option>
                  <option value={3}>3 - Posible</option>
                  <option value={4}>4 - Probable</option>
                  <option value={5}>5 - Casi Seguro</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Impacto Residual (1 a 5)</label>
                <select
                  value={formData.impactoResidual || 2}
                  onChange={(e) => setFormData({ ...formData, impactoResidual: Number(e.target.value) })}
                  className="w-full p-2.5 border border-emerald-300 rounded-md font-bold bg-emerald-50/60 focus:ring-1 focus:ring-emerald-500"
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

          {/* 8 y 9. TIPO DE MONITOREO Y RESPONSABLE */}
          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tipo de Monitoreo</label>
                <select
                  value={formData.tipoMonitoreo || "Mensual"}
                  onChange={(e) => setFormData({ ...formData, tipoMonitoreo: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600"
                >
                  {OPCIONES_MONITOREO.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Responsable</label>
                <input
                  type="text"
                  value={formData.responsable || ""}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  placeholder="Ej. Oficial de Cumplimiento / Líder de Proceso"
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ASIGNACIÓN DE CONTROLES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Asignación de Controles Mitigantes
              </h2>
              <p className="text-xs text-slate-500">
                Seleccione los controles aplicables del catálogo.
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

  // VISTA 2: TABLA PRINCIPAL
  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Matriz de Riesgos LAFT / PADM
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión cualitativa y cuantitativa de riesgos con controles asignados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-300"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors border border-rose-300"
          >
            <FileText className="w-4 h-4 text-rose-700" />
            PDF
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>

          <button
            onClick={handleOpenNewForm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Riesgo
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código, proceso, factor o qué puede suceder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold text-xs border-b-2 border-slate-300">
                <th className="p-3.5 w-24">Código</th>
                <th className="p-3.5 w-32">Proceso</th>
                <th className="p-3.5 w-36">Factor / Tipología</th>
                <th className="p-3.5 min-w-[280px]">¿Qué puede suceder?</th>
                <th className="p-3.5 w-24 text-center">R. Inherente</th>
                <th className="p-3.5 min-w-[220px]">Controles</th>
                <th className="p-3.5 w-24 text-center">R. Residual</th>
                <th className="p-3.5 w-32">Monitoreo / Resp.</th>
                <th className="p-3.5 w-20 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRiesgos.map((item, idx) => {
                const inhScore = (item.probabilidadInherente || 1) * (item.impactoInherente || 1);
                const inhLevel = getNivelRiesgo(inhScore);

                const resProb = item.probabilidadResidual || 1;
                const resImp = item.impactoResidual || 1;
                const resScore = resProb * resImp;
                const resLevel = getNivelRiesgo(resScore);

                const itemCodigos = obtenerCodigosControlSeguros(item);
                const controlesAsignados = controles.filter((c) => itemCodigos.includes(c.codigo));

                return (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/40 hover:bg-slate-100/60"}
                  >
                    <td className="p-3 font-bold text-slate-900 align-top">
                      {item.codigo}
                    </td>

                    <td className="p-3 align-top text-slate-700">
                      <div className="font-semibold">{item.proceso}</div>
                      <div className="text-[10px] text-slate-400">{item.subproceso}</div>
                    </td>

                    <td className="p-3 align-top text-slate-700">
                      <div className="font-bold text-slate-800">{item.factorRiesgo}</div>
                      {item.tipologia && (
                        <div className="text-[10px] text-teal-700 font-medium mt-0.5">{item.tipologia}</div>
                      )}
                    </td>

                    <td className="p-3 align-top text-slate-800 leading-relaxed">
                      <div className="font-medium text-slate-900">{item.quePuedeSuceder || item.descripcion}</div>
                      {(item.porQuePuedeSuceder || item.causa) && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          <b className="text-slate-600">Por qué:</b> {item.porQuePuedeSuceder || item.causa}
                        </div>
                      )}
                    </td>

                    <td className="p-2 align-top text-center">
                      <div className="text-[10px] text-slate-500 font-mono mb-1">P:{item.probabilidadInherente} | I:{item.impactoInherente}</div>
                      <div className={`px-2 py-1 rounded-md text-[11px] tracking-wide ${inhLevel.bgBadge}`}>
                        {inhScore} - {inhLevel.label}
                      </div>
                    </td>

                    <td className="p-2 align-top">
                      <div className="flex flex-wrap gap-1">
                        {controlesAsignados.length > 0 ? (
                          controlesAsignados.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded text-[10px] font-medium"
                              title={c.control}
                            >
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              <b>{c.codigo}</b>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">Sin controles</span>
                        )}
                      </div>
                    </td>

                    <td className="p-2 align-top text-center">
                      <div className="text-[10px] text-slate-500 font-mono mb-1">P:{resProb} | I:{resImp}</div>
                      <div className={`px-2 py-1 rounded-md text-[11px] tracking-wide ${resLevel.bgBadge}`}>
                        {resScore} - {resLevel.label}
                      </div>
                    </td>

                    <td className="p-3 align-top text-slate-700 text-[11px]">
                      <div><b>Monitoreo:</b> {item.tipoMonitoreo || "N/A"}</div>
                      <div className="text-slate-500 mt-0.5"><b>Resp:</b> {item.responsable || "N/A"}</div>
                    </td>

                    <td className="p-2 align-top text-center">
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