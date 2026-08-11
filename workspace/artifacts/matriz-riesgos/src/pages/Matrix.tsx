import React, { useState, useEffect } from "react";

const RIESGOS_KEY = "laft_riesgos_v1";
const PARAMETROS_KEY = "laft_parametros_v1";

interface ControlItem {
  codigo: string;
  descripcion: string;
  clase: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
  ponderacion: number;
}

interface RiskItem {
  id: string;
  codigo: string;
  proceso: string;
  subproceso: string;
  descripcion: string;
  banderas: string[];
  factorRiesgo: string;
  tipologia: string;
  quePuedeSuceder: string;
  porQuePuedeSuceder: string;
  probabilidadInherente: number;
  impactoInherente: number;
  perfilInherente: string;
  controles: ControlItem[];
  efectividad: number;
  probabilidadResidual: number;
  impactoResidual: number;
  perfilResidual: string;
}

const DEFAULT_PROCESOS = [
  "GESTION ADMINISTRATIVA Y FINANCIERA",
  "Gestión Académica",
  "Gestión Comercial",
  "Gestión Humana",
  "Gestión Jurídica",
  "Gestión de Tecnología"
];

const DEFAULT_SUBPROCESOS = [
  "CARTERA",
  "COMERCIAL-TELEMERCADEO-VENTAS",
  "COMERCIAL-TELEMERCADEO-VENTAS-CORPORATIVO Y PERSONALIZADO-EXAMENES INTERNACIONALES-INSTITUTO-SMART ONLINE",
  "COMPRAS",
  "CONTABILIDAD"
];

const DEFAULT_CONTROLES: ControlItem[] = [
  {
    codigo: "CTR-LAFT-01",
    descripcion: "Consulta en las listas para todas las personas naturales y jurídicas a vincular.",
    clase: "PREVENTIVO",
    ponderacion: 42.5
  },
  {
    codigo: "CTR-LAFT-04",
    descripcion: "Chequeo de información pública en medios de comunicación o fuentes abiertas.",
    clase: "PREVENTIVO",
    ponderacion: 42.5
  }
];

const DEFAULT_RIESGOS: RiskItem[] = [
  {
    id: "1",
    codigo: "R-LAFT001",
    proceso: "Gestión Comercial",
    subproceso: "COMERCIAL-TELEMERCADEO-VENTAS",
    descripcion: "Infiltración de recursos de origen ilícito a través de nuevos clientes.",
    banderas: ["CLIENTE", "Laft"],
    factorRiesgo: "CLIENTE",
    tipologia: "Cliente sin verificar",
    quePuedeSuceder: "Vinculación de fondos ilícitos",
    porQuePuedeSuceder: "Omitir lista restrictiva",
    probabilidadInherente: 2,
    impactoInherente: 3,
    perfilInherente: "TOLERABLE(6)",
    controles: DEFAULT_CONTROLES,
    efectividad: 60,
    probabilidadResidual: 1,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE"
  }
];

const PROB_OPTIONS = [
  { val: 1, label: "1 — Raro" },
  { val: 2, label: "2 — Poco probable" },
  { val: 3, label: "3 — Posible" },
  { val: 4, label: "4 — Probable" },
  { val: 5, label: "5 — Casi con certeza" },
];

const IMP_OPTIONS = [
  { val: 1, label: "1 — Insignificante" },
  { val: 2, label: "2 — Menor" },
  { val: 3, label: "3 — Moderado" },
  { val: 4, label: "4 — Mayor" },
  { val: 5, label: "5 — Catastrófico" },
];

const BANDERAS_LIST = ["Laft", "Operativo", "Legal", "Reputacional", "Contagio"];

function getPerfilInherente(prob: number, imp: number) {
  const score = prob * imp;
  let label = "ACEPTABLE";
  let bg = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (score >= 15) {
    label = "CRÍTICO";
    bg = "bg-red-200 text-red-900 border-red-400";
  } else if (score >= 10) {
    label = "MODERADO";
    bg = "bg-amber-100 text-amber-900 border-amber-300";
  } else if (score >= 5) {
    label = "TOLERABLE";
    bg = "bg-yellow-100 text-yellow-900 border-yellow-300";
  }

  return { label: `${label}(${score})`, bg };
}

export default function Matrix() {
  const [riesgos, setRiesgos] = useState<RiskItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

  // Parámetros Dinámicos
  const [listaProcesos, setListaProcesos] = useState<string[]>(DEFAULT_PROCESOS);
  const [listaSubprocesos, setListaSubprocesos] = useState<string[]>(DEFAULT_SUBPROCESOS);

  // Form State
  const [formData, setFormData] = useState({
    codigo: "",
    proceso: "Gestión Comercial",
    subproceso: "COMERCIAL-TELEMERCADEO-VENTAS",
    descripcion: "",
    banderas: ["Laft"] as string[],
    factorRiesgo: "ESTUDIANTES",
    tipologia: "",
    quePuedeSuceder: "",
    porQuePuedeSuceder: "",
    probabilidadInherente: 2,
    impactoInherente: 5,
    controles: DEFAULT_CONTROLES as ControlItem[],
  });

  useEffect(() => {
    // 1. Cargar Parámetros
    try {
      const savedParams = localStorage.getItem(PARAMETROS_KEY);
      if (savedParams) {
        const parsed = JSON.parse(savedParams);
        if (parsed.procesos && Array.isArray(parsed.procesos) && parsed.procesos.length > 0) {
          setListaProcesos(parsed.procesos);
        }
        if (parsed.subprocesos && Array.isArray(parsed.subprocesos) && parsed.subprocesos.length > 0) {
          setListaSubprocesos(parsed.subprocesos);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Cargar Riesgos
    try {
      const saved = localStorage.getItem(RIESGOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRiesgos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setRiesgos(DEFAULT_RIESGOS);
    localStorage.setItem(RIESGOS_KEY, JSON.stringify(DEFAULT_RIESGOS));
  }, [isModalOpen]);

  const saveToStorage = (updatedList: RiskItem[]) => {
    setRiesgos(updatedList);
    localStorage.setItem(RIESGOS_KEY, JSON.stringify(updatedList));
  };

  const exportExcel = () => {
    const headers = [
      "Código",
      "Proceso",
      "Subproceso",
      "Descripción",
      "Banderas",
      "Factor de Riesgo",
      "Tipología",
      "P.I.",
      "I.I.",
      "Perfil Inh.",
      "Efectividad %",
      "P.R.",
      "I.R.",
      "Perfil Res."
    ];
    const rows = riesgos.map((r) => [
      r.codigo,
      `"${r.proceso}"`,
      `"${r.subproceso || ''}"`,
      `"${r.descripcion}"`,
      `"${(r.banderas || []).join(", ")}"`,
      `"${r.factorRiesgo || ''}"`,
      `"${r.tipologia || ''}"`,
      r.probabilidadInherente,
      r.impactoInherente,
      r.perfilInherente,
      `${r.efectividad}%`,
      r.probabilidadResidual || 1,
      r.impactoResidual || 2,
      r.perfilResidual || 'ACEPTABLE',
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Matriz_de_Riesgos_LAFT.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenCreate = () => {
    setEditingRisk(null);
    setFormData({
      codigo: `R-LAFT00${riesgos.length + 1}`,
      proceso: listaProcesos[0] || "Gestión Comercial",
      subproceso: listaSubprocesos[0] || "COMERCIAL-TELEMERCADEO-VENTAS",
      descripcion: "",
      banderas: ["Laft", "Operativo"],
      factorRiesgo: "ESTUDIANTES",
      tipologia: "",
      quePuedeSuceder: "",
      porQuePuedeSuceder: "",
      probabilidadInherente: 2,
      impactoInherente: 5,
      controles: DEFAULT_CONTROLES,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RiskItem) => {
    setEditingRisk(item);
    setFormData({
      codigo: item.codigo,
      proceso: item.proceso || listaProcesos[0],
      subproceso: item.subproceso || listaSubprocesos[0],
      descripcion: item.descripcion,
      banderas: item.banderas || ["Laft"],
      factorRiesgo: item.factorRiesgo || "ESTUDIANTES",
      tipologia: item.tipologia || "",
      quePuedeSuceder: item.quePuedeSuceder || "",
      porQuePuedeSuceder: item.porQuePuedeSuceder || "",
      probabilidadInherente: item.probabilidadInherente || 2,
      impactoInherente: item.impactoInherente || 5,
      controles: item.controles || DEFAULT_CONTROLES,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este riesgo?")) {
      const updated = riesgos.filter((r) => r.id !== id);
      saveToStorage(updated);
    }
  };

  const handleCheckboxBandera = (bandera: string) => {
    if (formData.banderas.includes(bandera)) {
      setFormData({ ...formData, banderas: formData.banderas.filter((b) => b !== bandera) });
    } else {
      setFormData({ ...formData, banderas: [...formData.banderas, bandera] });
    }
  };

  const handleAddControl = () => {
    const nextNum = formData.controles.length + 1;
    const newCtrl: ControlItem = {
      codigo: `CTR-LAFT-${nextNum < 10 ? '0' + nextNum : nextNum}`,
      descripcion: "Nuevo control de verificación y seguimiento automático.",
      clase: "PREVENTIVO",
      ponderacion: 40.0
    };
    setFormData({ ...formData, controles: [...formData.controles, newCtrl] });
  };

  const handleRemoveControl = (index: number) => {
    const updatedCtrls = formData.controles.filter((_, i) => i !== index);
    setFormData({ ...formData, controles: updatedCtrls });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perfilInh = getPerfilInherente(formData.probabilidadInherente, formData.impactoInherente).label;

    if (editingRisk) {
      const updated = riesgos.map((r) =>
        r.id === editingRisk.id ? { ...r, ...formData, perfilInherente: perfilInh } : r
      );
      saveToStorage(updated);
    } else {
      const newRisk: RiskItem = {
        id: Date.now().toString(),
        ...formData,
        perfilInherente: perfilInh,
        efectividad: 50,
        probabilidadResidual: 1,
        impactoResidual: 2,
        perfilResidual: "ACEPTABLE"
      };
      saveToStorage([...riesgos, newRisk]);
    }
    setIsModalOpen(false);
  };

  const filteredRiesgos = riesgos.filter(
    (r) =>
      r.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.proceso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const perfilInhCalc = getPerfilInherente(formData.probabilidadInherente, formData.impactoInherente);

  return (
    <div className="w-full space-y-6 pb-12">
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 5px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #0d9488;
          border-radius: 5px;
        }
      `}</style>

      {/* Header con Botones PDF y Excel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matriz de Riesgos</h1>
          <p className="text-muted-foreground text-sm">Vista consolidada de todos los riesgos evaluados.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors bg-card"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors bg-card"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Sobresalir / Excel
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
          >
            <span className="text-lg font-bold">+</span> Nuevo Riesgo
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por código, proceso o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Tabla Matriz */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="custom-scroll overflow-x-auto w-full pb-3">
          <table className="min-w-[1300px] w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold tracking-wider">
                <th className="p-3 w-28">Código</th>
                <th className="p-3 w-44">Proceso</th>
                <th className="p-3 min-w-[280px]">Descripción</th>
                <th className="p-3 w-48">Banderas</th>
                <th className="p-3 text-center w-12">P.I.</th>
                <th className="p-3 text-center w-12">I.I.</th>
                <th className="p-3 text-center w-32">Perfil Inh.</th>
                <th className="p-3 text-center w-12">P.R.</th>
                <th className="p-3 text-center w-12">I.R.</th>
                <th className="p-3 text-center w-32">Perfil Res.</th>
                <th className="p-3 text-center w-24 bg-muted/80 font-bold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRiesgos.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-xs whitespace-nowrap">{item.codigo}</td>
                  <td className="p-3 text-xs text-muted-foreground">{item.proceso}</td>
                  <td className="p-3 text-xs line-clamp-2 max-w-[280px]" title={item.descripcion}>{item.descripcion}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(item.banderas || []).map((b, i) => (
                        <span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 border rounded font-semibold text-slate-700 dark:text-slate-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold text-xs">{item.probabilidadInherente}</td>
                  <td className="p-3 text-center font-bold text-xs">{item.impactoInherente}</td>
                  <td className="p-3 text-center font-bold text-xs text-amber-800">{item.perfilInherente}</td>
                  <td className="p-3 text-center font-bold text-xs">{item.probabilidadResidual || 1}</td>
                  <td className="p-3 text-center font-bold text-xs">{item.impactoResidual || 2}</td>
                  <td className="p-3 text-center font-bold text-xs text-emerald-800">{item.perfilResidual || "ACEPTABLE"}</td>
                  <td className="p-3 text-center whitespace-nowrap bg-muted/20">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="p-1 hover:text-teal-600 text-base" title="Editar">✏️</button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-600 text-base" title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Formulario Completo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-background border rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto my-6">
            
            <div className="sticky top-0 bg-background z-10 border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                {editingRisk ? `Editar Riesgo: ${editingRisk.codigo}` : "Nuevo Riesgo"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-2xl font-bold px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Sección 1: Identificación del Riesgo */}
              <div className="border rounded-lg p-5 bg-card shadow-sm space-y-4">
                <h3 className="font-bold text-base text-foreground">Identificación del Riesgo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-xs font-semibold mb-1 text-foreground">Proceso *</label>
                    <select
                      required
                      value={formData.proceso}
                      onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {listaProcesos.map((p, idx) => (
                        <option key={idx} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Subproceso *</label>
                    <select
                      required
                      value={formData.subproceso}
                      onChange={(e) => setFormData({ ...formData, subproceso: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {listaSubprocesos.map((sp, idx) => (
                        <option key={idx} value={sp}>{sp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Descripción del Riesgo *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 text-foreground">Clasificación (Banderas)</label>
                  <div className="flex flex-wrap items-center gap-6">
                    {BANDERAS_LIST.map((b) => (
                      <label key={b} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={formData.banderas.includes(b)}
                          onChange={() => handleCheckboxBandera(b)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>{b}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sección 2: Análisis Cualitativo */}
              <div className="border rounded-lg p-5 bg-card shadow-sm space-y-4">
                <h3 className="font-bold text-base text-foreground">Análisis Cualitativo</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Factor de Riesgo</label>
                    <select
                      value={formData.factorRiesgo}
                      onChange={(e) => setFormData({ ...formData, factorRiesgo: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="ESTUDIANTES">ESTUDIANTES</option>
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="PROVEEDOR">PROVEEDOR</option>
                      <option value="EMPLEADO">EMPLEADO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Tipología</label>
                    <input
                      type="text"
                      value={formData.tipologia}
                      onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">¿Qué puede suceder?</label>
                    <textarea
                      rows={2}
                      value={formData.quePuedeSuceder}
                      onChange={(e) => setFormData({ ...formData, quePuedeSuceder: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">¿Por qué puede suceder?</label>
                    <textarea
                      rows={2}
                      value={formData.porQuePuedeSuceder}
                      onChange={(e) => setFormData({ ...formData, porQuePuedeSuceder: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Evaluación Inherente */}
              <div className="border rounded-lg p-5 bg-card shadow-sm space-y-4">
                <h3 className="font-bold text-base text-foreground">Evaluación Inherente</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Probabilidad Inherente</label>
                    <select
                      value={formData.probabilidadInherente}
                      onChange={(e) => setFormData({ ...formData, probabilidadInherente: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {PROB_OPTIONS.map((o) => (
                        <option key={o.val} value={o.val}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Impacto Inherente</label>
                    <select
                      value={formData.impactoInherente}
                      onChange={(e) => setFormData({ ...formData, impactoInherente: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      {IMP_OPTIONS.map((o) => (
                        <option key={o.val} value={o.val}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">Perfil Inherente</label>
                    <div className={`px-4 py-2 rounded-md font-bold text-sm border text-center ${perfilInhCalc.bg}`}>
                      {perfilInhCalc.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 4: Controles Asociados */}
              <div className="border rounded-lg p-5 bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Controles Asociados</h3>
                  <button
                    type="button"
                    onClick={handleAddControl}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs font-semibold hover:bg-muted transition-colors"
                  >
                    + Agregar control
                  </button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground uppercase font-bold">
                        <th className="p-3 w-32">Código</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3 w-32">Clase</th>
                        <th className="p-3 w-28 text-right">Ponderación</th>
                        <th className="p-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {formData.controles.map((ctrl, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="p-3 font-mono font-bold">{ctrl.codigo}</td>
                          <td className="p-3">{ctrl.descripcion}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border text-slate-800">
                              {ctrl.clase}
                            </span>
                          </td>
                          <td className="p-3 text-right font-semibold">{ctrl.ponderacion.toFixed(1).replace(".", ",")} %</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveControl(idx)}
                              className="text-muted-foreground hover:text-red-600 font-bold text-sm"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acciones */}
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
                  Guardar Riesgo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}