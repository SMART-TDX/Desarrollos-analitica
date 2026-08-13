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
  FileText,
  AlertTriangle,
  Activity
} from "lucide-react";
import { CONTROLES_OFICIALES, ControlRow, calcularPonderacion } from "./Controls";

export interface RiesgoRow {
  id: string;
  codigo: string;
  proceso: string;
  subproceso?: string;
  quePuedeSuceder?: string;
  descripcionEvento?: string;
  descripcion?: string; // Para compatibilidad
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
  responsable?: string;
  controlCodigos?: string[];
  controlCodigo?: string;
  observaciones?: string;
}

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

// CALIFICACIÓN DEL PERFIL DE RIESGO
export function getNivelRiesgo(score: number): { label: string; bgBadge: string } {
  if (score <= 3) {
    return { 
      label: "ACEPTABLE", 
      bgBadge: "bg-emerald-400 text-emerald-950 font-bold border border-emerald-500" 
    };
  } else if (score <= 12) {
    return { 
      label: "TOLERABLE", 
      bgBadge: "bg-yellow-300 text-yellow-950 font-bold border border-yellow-400" 
    };
  } else {
    return { 
      label: "INACEPTABLE", 
      bgBadge: "bg-rose-500 text-white font-extrabold border border-rose-600" 
    };
  }
}

function getColorsPDF(label: string): { bg: string; text: string } {
  switch (label) {
    case "ACEPTABLE": return { bg: "#86efac", text: "#064e3b" };
    case "TOLERABLE": return { bg: "#fde047", text: "#713f12" };
    case "INACEPTABLE": default: return { bg: "#f87171", text: "#ffffff" };
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
    quePuedeSuceder: "El Estudiante o el responsable del pago se encuentre realizando o vinculado en actividades delictivas.",
    descripcionEvento: "Vinculación de clientes o contrapartes en listas restrictivas o con antecedentes LAFT sin previo filtro.",
    banderas: { laft: true, operativo: true, legal: true, reputacional: true, contagio: false },
    factorRiesgo: "ESTUDIANTES",
    tipologia: "Renuencia del cliente a suministrar la información y documentación solicitada por la academia",
    porQuePuedeSuceder: "No se realiza una identificación de los clientes y los responsables del pago antes de prestarle servicios",
    consecuencia: "Sanciones administrativas de la Superintendencia de Sociedades y severo daño reputacional.",
    probabilidadInherente: 3,
    impactoInherente: 3,
    probabilidadResidual: 1,
    impactoResidual: 2,
    responsable: "Analista Sagrilaft",
    controlCodigos: ["CTR-LAFT-01", "CTR-LAFT-02", "CTR-LAFT-03"],
    observaciones: "Monitoreo continuo de listas restrictivas"
  },
  {
    id: "2",
    codigo: "RIE-LAFT-02",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    subproceso: "CARTERA",
    quePuedeSuceder: "Aceptación de pagos por matrícula o servicios con fondos cuyo origen ilícito no es justificado.",
    descripcionEvento: "Recaudo de efectivo o transferencias desde cuentas de origen no justificado o de terceros sin vinculación formal.",
    banderas: { laft: true, operativo: true, legal: true, reputacional: true, contagio: false },
    factorRiesgo: "PRODUCTOS Y SERVICIOS",
    tipologia: "Paso de dinero de origen ilícito mediante consignaciones en efectivo de terceros",
    porQuePuedeSuceder: "Pagos de terceros no identificados o falta de conciliación bancaria diaria.",
    consecuencia: "Ingreso de recursos ilícitos a la contabilidad de la organización e investigaciones penales.",
    probabilidadInherente: 2,
    impactoInherente: 3,
    probabilidadResidual: 1,
    impactoResidual: 3,
    responsable: "Líder de Cartera y Tesorería",
    controlCodigos: ["CTR-LAFT-01"],
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
            quePuedeSuceder: r.quePuedeSuceder || r.descripcion || "",
            descripcionEvento: r.descripcionEvento || r.descripcion || "",
            porQuePuedeSuceder: r.porQuePuedeSuceder || r.causa || "",
            controlCodigos: obtenerCodigosControlSeguros(r),
            banderas: r.banderas || { laft: true, operativo: false, legal: false, reputacional: false, contagio: false }
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
    quePuedeSuceder: "",
    descripcionEvento: "",
    banderas: { laft: true, operativo: false, legal: false, reputacional: false, contagio: false },
    factorRiesgo: DEFAULTS_FACTORES[0] || "",
    tipologia: "",
    porQuePuedeSuceder: "",
    consecuencia: "",
    probabilidadInherente: 3,
    impactoInherente: 3,
    probabilidadResidual: 1,
    impactoResidual: 2,
    responsable: "Analista Sagrilaft",
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
      quePuedeSuceder: "",
      descripcionEvento: "",
      banderas: { laft: true, operativo: true, legal: true, reputacional: true, contagio: false },
      factorRiesgo: listaFactores[0] || "",
      tipologia: "",
      porQuePuedeSuceder: "",
      consecuencia: "",
      probabilidadInherente: 3,
      impactoInherente: 3,
      probabilidadResidual: 1,
      impactoResidual: 2,
      responsable: "Analista Sagrilaft",
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
      descripcionEvento: item.descripcionEvento || item.descripcion || "",
      porQuePuedeSuceder: item.porQuePuedeSuceder || item.causa || "",
      probabilidadResidual: item.probabilidadResidual || 1,
      impactoResidual: item.impactoResidual || 2,
      responsable: item.responsable || "Analista Sagrilaft",
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
      descripcion: formData.quePuedeSuceder || formData.descripcionEvento || "",
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
    const desc = (r.quePuedeSuceder || r.descripcionEvento || r.descripcion || "").toLowerCase();
    const cod = (r.codigo || "").toLowerCase();
    const proc = (r.proceso || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return desc.includes(term) || cod.includes(term) || proc.includes(term);
  });

  const handleExportExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "Código;Proceso;Subproceso;Factor Riesgo;¿Qué puede suceder?;Descripción Evento;Tipología;¿Por qué puede suceder?;Consecuencias;Riesgos Asociados;Prob. Inh.;Imp. Inh.;Perfil Inherente;Controles;Mitigación (%);Prob. Res.;Imp. Res.;Perfil Residual;Responsable;Observaciones\n";

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

      const b = r.banderas || { laft: false, operativo: false, legal: false, reputacional: false, contagio: false };
      const listaBanderas = Object.keys(b).filter(k => (b as any)[k]).map(k => k.toUpperCase()).join(", ");

      const row = [
        `"${r.codigo}"`,
        `"${r.proceso}"`,
        `"${r.subproceso || ''}"`,
        `"${r.factorRiesgo}"`,
        `"${(r.quePuedeSuceder || '').replace(/"/g, '""')}"`,
        `"${(r.descripcionEvento || r.descripcion || '').replace(/"/g, '""')}"`,
        `"${(r.tipologia || '').replace(/"/g, '""')}"`,
        `"${(r.porQuePuedeSuceder || r.causa || '').replace(/"/g, '""')}"`,
        `"${(r.consecuencia || '').replace(/"/g, '""')}"`,
        `"${listaBanderas}"`,
        r.probabilidadInherente,
        r.impactoInherente,
        `"${inhLevel}"`,
        `"${listaControles.replace(/"/g, '""')}"`,
        `"${mitigacionTotal}%"`,
        resProb,
        resImp,
        `"${resLevel}"`,
        `"${r.responsable || ''}"`,
        `"${(r.observaciones || '').replace(/"/g, '""')}"`
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

      return `
        <tr style="page-break-inside: avoid;">
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${item.codigo}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;"><b>${item.proceso}</b><br/><span style="color:#64748b; font-size:8px;">${item.subproceso || ''}</span></td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;"><b>${item.factorRiesgo}</b><br/><span style="color:#0284c7; font-size:8px;">${item.tipologia || ''}</span></td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">
            <b>¿Qué puede suceder?:</b> ${item.quePuedeSuceder || ''}<br/>
            <b>Descripción del Evento:</b> ${item.descripcionEvento || item.descripcion || ''}<br/>
            <span style="color:#475569;"><b>Por qué:</b> ${item.porQuePuedeSuceder || item.causa || ''}</span><br/>
            <span style="color:#dc2626;"><b>Consecuencia:</b> ${item.consecuencia || ''}</span>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 8px;">P:${item.probabilidadInherente} I:${item.impactoInherente}</div>
            <div style="padding: 4px; border-radius: 4px; font-weight: bold; background-color: ${inhColors.bg}; color: ${inhColors.text};">
              ${inhLevel.label}
            </div>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 8px;">P:${resProb} I:${resImp}</div>
            <div style="padding: 4px; border-radius: 4px; font-weight: bold; background-color: ${resColors.bg}; color: ${resColors.text};">
              ${resLevel.label}
            </div>
          </td>
          <td style="padding: 6px; border: 1px solid #cbd5e1;">
            <div><b>Responsable:</b> ${item.responsable || 'N/A'}</div>
            <div><span style="color:#64748b; font-size:8px;">${item.observaciones || ''}</span></div>
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
          <h1>Reporte General de Perfil de Riesgos</h1>
          <table>
            <thead>
              <tr>
                <th style="width: 70px;">Código</th>
                <th style="width: 110px;">Proceso / Subp.</th>
                <th style="width: 110px;">Factor / Tipología</th>
                <th>Detalle del Riesgo</th>
                <th style="width: 90px; text-align: center;">Perfil Inherente</th>
                <th style="width: 90px; text-align: center;">Perfil Residual</th>
                <th style="width: 120px;">Responsable / Obs.</th>
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

  // ==========================================
  // VISTA FORMULARIO (EDICIÓN / CREACIÓN)
  // ==========================================
  if (viewMode === "form") {
    const formControlCodigos = formData.controlCodigos || [];
    const controlesSeleccionados = controles.filter((c) => formControlCodigos.includes(c.codigo));
    const ponderacionesForm = controlesSeleccionados.map((c) => calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad));
    const mitigacionForm = calcularMitigacionMultiple(ponderacionesForm);

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
                Formulario completo de identificación, detalle del riesgo y seguimiento
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

        {/* SECCIÓN 1: IDENTIFICACIÓN DEL RIESGO */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            Identificación del Riesgo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Código *</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej. RIE-LAFT-01"
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-bold text-slate-900"
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
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600 text-slate-700"
              >
                <option value="">-- Seleccione Subproceso --</option>
                {opcionesSubprocesos.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DETALLE DEL RIESGO (CON CAMPOS SEPARADOS) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Detalle del Riesgo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Factor de Riesgo *</label>
              <select
                value={formData.factorRiesgo}
                onChange={(e) => setFormData({ ...formData, factorRiesgo: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-semibold"
              >
                <option value="">-- Seleccione Factor de Riesgo --</option>
                {opcionesFactores.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipología</label>
              <input
                type="text"
                value={formData.tipologia || ""}
                onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                placeholder="Ej. Renuencia del cliente a suministrar la información..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600 text-slate-800"
              />
            </div>
          </div>

          {/* CAMPOS SEPARADOS: ¿QUÉ PUEDE SUCEDER? Y DESCRIPCIÓN DEL EVENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ¿Qué puede suceder? *
              </label>
              <textarea
                rows={3}
                value={formData.quePuedeSuceder || ""}
                onChange={(e) => setFormData({ ...formData, quePuedeSuceder: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="Ej. El estudiante o responsable del pago se encuentre realizando o vinculado en actividades ilícitas..."
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Descripción del Evento *
              </label>
              <textarea
                rows={3}
                value={formData.descripcionEvento || ""}
                onChange={(e) => setFormData({ ...formData, descripcionEvento: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="Describa a detalle las circunstancias, origen o modalidad del evento de riesgo..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">¿Por qué puede suceder? (Causa Raíz)</label>
              <textarea
                rows={2}
                value={formData.porQuePuedeSuceder || formData.causa || ""}
                onChange={(e) => setFormData({ ...formData, porQuePuedeSuceder: e.target.value, causa: e.target.value })}
                placeholder="Indique las causas originadoras o vulnerabilidades..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Consecuencias / Impacto</label>
              <textarea
                rows={2}
                value={formData.consecuencia || ""}
                onChange={(e) => setFormData({ ...formData, consecuencia: e.target.value })}
                placeholder="Detalle los efectos negativos (sanciones, pérdidas financieras, reputacionales, etc)..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>
          </div>

          {/* RIESGOS ASOCIADOS (BANDERAS) */}
          <div>
            <label className="block font-medium text-slate-700 mb-2 text-xs">Riesgos Asociados (Banderas)</label>
            <div className="flex flex-wrap gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              {[
                { key: "laft", label: "LAFT" },
                { key: "operativo", label: "OPERATIVO" },
                { key: "legal", label: "LEGAL" },
                { key: "reputacional", label: "REPUTACIONAL" },
                { key: "contagio", label: "CONTAGIO" }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.banderas?.[key as keyof typeof formData.banderas] || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      banderas: {
                        ...(formData.banderas || { laft: false, operativo: false, legal: false, reputacional: false, contagio: false }),
                        [key]: e.target.checked
                      }
                    })}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: EVALUACIÓN DE PERFILES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Evaluación y Perfilamiento del Riesgo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* INHERENTE */}
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200 space-y-3">
              <h3 className="font-bold text-amber-900 border-b border-amber-200 pb-1">Perfil Inherente</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Probabilidad (1 a 5)</label>
                  <select
                    value={formData.probabilidadInherente}
                    onChange={(e) => setFormData({ ...formData, probabilidadInherente: Number(e.target.value) })}
                    className="w-full p-2 border border-amber-300 rounded font-bold bg-white focus:ring-1 focus:ring-amber-500"
                  >
                    <option value={1}>1 - Raro</option>
                    <option value={2}>2 - Improbable</option>
                    <option value={3}>3 - Posible</option>
                    <option value={4}>4 - Probable</option>
                    <option value={5}>5 - Casi Seguro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Impacto (1 a 5)</label>
                  <select
                    value={formData.impactoInherente}
                    onChange={(e) => setFormData({ ...formData, impactoInherente: Number(e.target.value) })}
                    className="w-full p-2 border border-amber-300 rounded font-bold bg-white focus:ring-1 focus:ring-amber-500"
                  >
                    <option value={1}>1 - Insignificante</option>
                    <option value={2}>2 - Menor</option>
                    <option value={3}>3 - Moderado</option>
                    <option value={4}>4 - Mayor</option>
                    <option value={5}>5 - Catastrófico</option>
                  </select>
                </div>
              </div>

              {(() => {
                const scoreInh = formData.probabilidadInherente * formData.impactoInherente;
                const infoInh = getNivelRiesgo(scoreInh);
                return (
                  <div className="pt-2 flex justify-between items-center text-xs border-t border-amber-200/60">
                    <span className="font-semibold text-slate-700">Puntuación: {scoreInh}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] ${infoInh.bgBadge}`}>
                      {infoInh.label}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* RESIDUAL */}
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-3">
              <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">Perfil Residual</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Probabilidad (1 a 5)</label>
                  <select
                    value={formData.probabilidadResidual || 1}
                    onChange={(e) => setFormData({ ...formData, probabilidadResidual: Number(e.target.value) })}
                    className="w-full p-2 border border-emerald-300 rounded font-bold bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={1}>1 - Raro</option>
                    <option value={2}>2 - Improbable</option>
                    <option value={3}>3 - Posible</option>
                    <option value={4}>4 - Probable</option>
                    <option value={5}>5 - Casi Seguro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Impacto (1 a 5)</label>
                  <select
                    value={formData.impactoResidual || 1}
                    onChange={(e) => setFormData({ ...formData, impactoResidual: Number(e.target.value) })}
                    className="w-full p-2 border border-emerald-300 rounded font-bold bg-white focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={1}>1 - Insignificante</option>
                    <option value={2}>2 - Menor</option>
                    <option value={3}>3 - Moderado</option>
                    <option value={4}>4 - Mayor</option>
                    <option value={5}>5 - Catastrófico</option>
                  </select>
                </div>
              </div>

              {(() => {
                const scoreRes = (formData.probabilidadResidual || 1) * (formData.impactoResidual || 1);
                const infoRes = getNivelRiesgo(scoreRes);
                return (
                  <div className="pt-2 flex justify-between items-center text-xs border-t border-emerald-200/60">
                    <span className="font-semibold text-slate-700">Puntuación: {scoreRes}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] ${infoRes.bgBadge}`}>
                      {infoRes.label}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: ASIGNACIÓN DE CONTROLES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Controles Asignados
            </h2>
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-semibold">
              Mitigación Calculada: {mitigacionForm}%
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2 text-xs bg-slate-50/50">
            {controles.map((ctrl) => {
              const isSelected = formControlCodigos.includes(ctrl.codigo);
              const pond = calcularPonderacion(ctrl.clase, ctrl.tipo, ctrl.frecuencia, ctrl.formalidad);
              return (
                <div
                  key={ctrl.id || ctrl.codigo}
                  onClick={() => toggleControlInForm(ctrl.codigo)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? "bg-teal-50 border-teal-300 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900">{ctrl.codigo} - {ctrl.control}</span>
                      <span className="font-semibold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded text-[10px]">
                        Eficiencia: {pond}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{ctrl.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 5: MONITOREO Y SEGUIMIENTO (2 COLUMNAS, SIN TIPO DE MONITOREO) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Monitoreo y Seguimiento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Responsable */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Responsable
              </label>
              <input
                type="text"
                value={formData.responsable || ""}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600 text-xs"
                placeholder="Ej. Analista Sagrilaft"
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Observaciones
              </label>
              <input
                type="text"
                value={formData.observaciones || ""}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-600 focus:border-teal-600 text-xs"
                placeholder="Ingrese observaciones o notas del seguimiento..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA TABLA (MATRIZ GENERAL)
  // ==========================================
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* HEADER DE LA TABLA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Matriz de Riesgos LAFT
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión integral de riesgos, perfiles inherentes/residuales y asignación de controles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            title="Restablecer a valores iniciales"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenNewForm}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Riesgo
          </button>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar riesgo por código, proceso, que puede suceder o descripción del evento..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* TABLA PRINCIPAL DE RIESGOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-3">Código</th>
                <th className="p-3">Proceso / Subp.</th>
                <th className="p-3">Factor / Tipología</th>
                <th className="p-3 min-w-[280px]">Detalle del Riesgo</th>
                <th className="p-3 text-center">Riesgos Assoc.</th>
                <th className="p-3 text-center">Perfil Inherente</th>
                <th className="p-3 min-w-[180px]">Controles / Mitigación</th>
                <th className="p-3 text-center">Perfil Residual</th>
                <th className="p-3">Responsable</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRiesgos.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron riesgos registrados.
                  </td>
                </tr>
              ) : (
                filteredRiesgos.map((item) => {
                  const inhScore = (item.probabilidadInherente || 1) * (item.impactoInherente || 1);
                  const inhInfo = getNivelRiesgo(inhScore);

                  const resProb = item.probabilidadResidual || 1;
                  const resImp = item.impactoResidual || 1;
                  const resScore = resProb * resImp;
                  const resInfo = getNivelRiesgo(resScore);

                  const codigosControles = obtenerCodigosControlSeguros(item);
                  const ctrs = controles.filter((c) => codigosControles.includes(c.codigo));
                  const pongs = ctrs.map((c) => calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad));
                  const mitigacion = calcularMitigacionMultiple(pongs);

                  const flags = item.banderas || { laft: false, operativo: false, legal: false, reputacional: false, contagio: false };
                  const activeFlags = Object.keys(flags).filter((k) => (flags as any)[k]);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        {item.codigo}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{item.proceso}</div>
                        {item.subproceso && (
                          <div className="text-[10px] text-slate-500">{item.subproceso}</div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{item.factorRiesgo}</div>
                        {item.tipologia && (
                          <div className="text-[10px] text-teal-700 font-medium">{item.tipologia}</div>
                        )}
                      </td>

                      <td className="p-3 space-y-1">
                        {item.quePuedeSuceder && (
                          <div>
                            <span className="font-bold text-slate-800">¿Qué puede suceder?: </span>
                            <span className="text-slate-700">{item.quePuedeSuceder}</span>
                          </div>
                        )}
                        {item.descripcionEvento && (
                          <div>
                            <span className="font-bold text-slate-800">Evento: </span>
                            <span className="text-slate-600">{item.descripcionEvento}</span>
                          </div>
                        )}
                        {(item.porQuePuedeSuceder || item.causa) && (
                          <div className="text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600">Por qué: </span>
                            {item.porQuePuedeSuceder || item.causa}
                          </div>
                        )}
                        {item.consecuencia && (
                          <div className="text-[11px] text-rose-700">
                            <span className="font-medium">Consecuencia: </span>
                            {item.consecuencia}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {activeFlags.map((f) => (
                            <span
                              key={f}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-700"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">
                          P:{item.probabilidadInherente} | I:{item.impactoInherente}
                        </div>
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] ${inhInfo.bgBadge}`}>
                          {inhInfo.label}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex justify-between items-center mb-1 text-[11px]">
                          <span className="font-semibold text-slate-700">Mitigación:</span>
                          <span className="font-bold text-teal-700">{mitigacion}%</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ctrs.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">Sin controles</span>
                          ) : (
                            ctrs.map((c) => (
                              <span
                                key={c.codigo}
                                className="px-1.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-medium"
                                title={c.control}
                              >
                                {c.codigo}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="text-[10px] text-slate-500 mb-1">
                          P:{resProb} | I:{resImp}
                        </div>
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] ${resInfo.bgBadge}`}>
                          {resInfo.label}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-800">{item.responsable || "N/A"}</div>
                        {item.observaciones && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={item.observaciones}>
                            {item.observaciones}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditForm(item)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                            title="Editar riesgo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRiesgo(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Eliminar riesgo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}