import React, { useState, useEffect } from "react";

const RIESGOS_KEY = "laft_riesgos_v1";

interface RiskItem {
  id: string;
  codigo: string;
  proceso: string;
  descripcion: string;
  banderas: string[];
  probabilidadInherente: number;
  impactoInherente: number;
  perfilInherente: string;
  efectividad: number;
  probabilidadResidual: number;
  impactoResidual: number;
  perfilResidual: string;
}

const DEFAULT_RIESGOS: RiskItem[] = [
  {
    id: "1",
    codigo: "R-LAFT001",
    proceso: "Gestión Comercial",
    descripcion: "Infiltración de recursos de origen ilícito a través de nuevos clientes.",
    banderas: ["CLIENTE", "LAFT"],
    probabilidadInherente: 2,
    impactoInherente: 3,
    perfilInherente: "TOLERABLE",
    efectividad: 60,
    probabilidadResidual: 1,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE"
  },
  {
    id: "2",
    codigo: "R-LAFT002",
    proceso: "Gestión Administrativa y Financiera",
    descripcion: "Pago a proveedores no verificados en listas restrictivas.",
    banderas: ["PROVEEDOR", "OP"],
    probabilidadInherente: 3,
    impactoInherente: 4,
    perfilInherente: "MODERADO",
    efectividad: 50,
    probabilidadResidual: 2,
    impactoResidual: 3,
    perfilResidual: "TOLERABLE"
  },
  {
    id: "3",
    codigo: "R-LAFT004",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    descripcion: "Operaciones sospechosas no detectadas a tiempo.",
    banderas: ["LAFT"],
    probabilidadInherente: 5,
    impactoInherente: 3,
    perfilInherente: "ALTO",
    efectividad: 40,
    probabilidadResidual: 2,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE"
  }
];

const AVAILABLE_FLAGS = ["LAFT", "OP", "PIERNA", "REPS", "ESTAFA", "CLIENTE", "PROVEEDOR"];

const FLAG_COLORS: Record<string, string> = {
  LAFT: "bg-blue-100 text-blue-800 border-blue-200",
  OP: "bg-slate-200 text-slate-800 border-slate-300",
  PIERNA: "bg-amber-100 text-amber-900 border-amber-200",
  REPS: "bg-purple-100 text-purple-800 border-purple-200",
  ESTAFA: "bg-pink-100 text-pink-800 border-pink-200",
  CLIENTE: "bg-cyan-100 text-cyan-800 border-cyan-200",
  PROVEEDOR: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function getPerfil(prob: number, imp: number) {
  const score = prob * imp;
  if (score <= 4) return { label: "ACEPTABLE", bg: "bg-emerald-600 text-white" };
  if (score <= 9) return { label: "TOLERABLE", bg: "bg-amber-500 text-white" };
  if (score <= 14) return { label: "MODERADO", bg: "bg-orange-500 text-white" };
  if (score <= 19) return { label: "ALTO", bg: "bg-red-500 text-white" };
  return { label: "CRITICO", bg: "bg-red-700 text-white" };
}

export default function Matrix() {
  const [riesgos, setRiesgos] = useState<RiskItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    codigo: "",
    proceso: "",
    descripcion: "",
    banderas: [] as string[],
    probabilidadInherente: 3,
    impactoInherente: 3,
    efectividad: 30,
    probabilidadResidual: 1,
    impactoResidual: 2,
  });

  // Load risks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RIESGOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((item: any) => ({
            ...item,
            banderas: Array.isArray(item.banderas)
              ? item.banderas
              : item.flags ? [item.flags] : ["LAFT"]
          }));
          setRiesgos(normalized);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setRiesgos(DEFAULT_RIESGOS);
    localStorage.setItem(RIESGOS_KEY, JSON.stringify(DEFAULT_RIESGOS));
  }, []);

  const saveToStorage = (updatedList: RiskItem[]) => {
    setRiesgos(updatedList);
    localStorage.setItem(RIESGOS_KEY, JSON.stringify(updatedList));
  };

  const handleOpenCreate = () => {
    setEditingRisk(null);
    setFormData({
      codigo: `R-LAFT00${riesgos.length + 1}`,
      proceso: "Gestión Operativa",
      descripcion: "",
      banderas: ["LAFT", "OP"],
      probabilidadInherente: 3,
      impactoInherente: 3,
      efectividad: 50,
      probabilidadResidual: 1,
      impactoResidual: 2,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (risk: RiskItem) => {
    setEditingRisk(risk);
    setFormData({
      codigo: risk.codigo,
      proceso: risk.proceso,
      descripcion: risk.descripcion,
      banderas: Array.isArray(risk.banderas) ? risk.banderas : ["LAFT"],
      probabilidadInherente: risk.probabilidadInherente || 1,
      impactoInherente: risk.impactoInherente || 1,
      efectividad: risk.efectividad || 0,
      probabilidadResidual: risk.probabilidadResidual || 1,
      impactoResidual: risk.impactoResidual || 1,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este riesgo de la matriz?")) {
      const updated = riesgos.filter((r) => r.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const perfilInh = getPerfil(Number(formData.probabilidadInherente), Number(formData.impactoInherente)).label;
    const perfilRes = getPerfil(Number(formData.probabilidadResidual), Number(formData.impactoResidual)).label;

    if (editingRisk) {
      const updated = riesgos.map((r) =>
        r.id === editingRisk.id
          ? {
              ...r,
              codigo: formData.codigo,
              proceso: formData.proceso,
              descripcion: formData.descripcion,
              banderas: formData.banderas,
              probabilidadInherente: Number(formData.probabilidadInherente),
              impactoInherente: Number(formData.impactoInherente),
              perfilInherente: perfilInh,
              efectividad: Number(formData.efectividad),
              probabilidadResidual: Number(formData.probabilidadResidual),
              impactoResidual: Number(formData.impactoResidual),
              perfilResidual: perfilRes,
            }
          : r
      );
      saveToStorage(updated);
    } else {
      const newRisk: RiskItem = {
        id: Date.now().toString(),
        codigo: formData.codigo,
        proceso: formData.proceso,
        descripcion: formData.descripcion,
        banderas: formData.banderas,
        probabilidadInherente: Number(formData.probabilidadInherente),
        impactoInherente: Number(formData.impactoInherente),
        perfilInherente: perfilInh,
        efectividad: Number(formData.efectividad),
        probabilidadResidual: Number(formData.probabilidadResidual),
        impactoResidual: Number(formData.impactoResidual),
        perfilResidual: perfilRes,
      };
      saveToStorage([...riesgos, newRisk]);
    }
    setIsModalOpen(false);
  };

  const toggleFlag = (flag: string) => {
    if (formData.banderas.includes(flag)) {
      setFormData({ ...formData, banderas: formData.banderas.filter((f) => f !== flag) });
    } else {
      setFormData({ ...formData, banderas: [...formData.banderas, flag] });
    }
  };

  const exportExcel = () => {
    const headers = ["Código", "Proceso", "Descripción", "Banderas", "P.I.", "I.I.", "Perfil Inh.", "Efectividad %", "P.R.", "I.R.", "Perfil Res."];
    const rows = riesgos.map((r) => [
      r.codigo,
      `"${r.proceso}"`,
      `"${r.descripcion}"`,
      `"${(r.banderas || []).join(", ")}"`,
      r.probabilidadInherente,
      r.impactoInherente,
      r.perfilInherente,
      `${r.efectividad}%`,
      r.probabilidadResidual,
      r.impactoResidual,
      r.perfilResidual,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Matriz_de_Riesgos_LAFT.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRiesgos = riesgos.filter(
    (r) =>
      r.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.proceso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 w-full max-w-full overflow-x-hidden bg-background min-h-screen">
      {/* Estilos CSS para Scrollbar Horizontal Visible y Forzada */}
      <style>{`
        .table-scroll-container::-webkit-scrollbar {
          height: 12px;
        }
        .table-scroll-container::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 6px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb {
          background: #0f766e;
          border-radius: 6px;
          border: 2px solid #e2e8f0;
        }
        .table-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #0d9488;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matriz de Riesgos</h1>
          <p className="text-muted-foreground text-sm">Vista consolidada de todos los riesgos evaluados.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Sobresalir / Excel
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Riesgo
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6 max-w-md">
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

      {/* Contenedor principal de la Tabla con scrollbar horizontal visible */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="table-scroll-container overflow-x-auto w-full pb-2">
          <table className="min-w-[1250px] w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold tracking-wider">
                <th className="p-2.5 w-24">Código</th>
                <th className="p-2.5 w-36">Proceso</th>
                <th className="p-2.5 w-64">Descripción</th>
                <th className="p-2.5 w-44">Banderas</th>
                <th className="p-2.5 text-center w-10">P.I.</th>
                <th className="p-2.5 text-center w-10">I.I.</th>
                <th className="p-2.5 text-center w-28">Perfil Inh.</th>
                <th className="p-2.5 text-center w-20">Efectividad</th>
                <th className="p-2.5 text-center w-10">P.R.</th>
                <th className="p-2.5 text-center w-10">I.R.</th>
                <th className="p-2.5 text-center w-28">Perfil Res.</th>
                <th className="p-2.5 text-center w-24 bg-muted/80 font-bold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRiesgos.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-muted-foreground italic">
                    No se encontraron riesgos registrados.
                  </td>
                </tr>
              ) : (
                filteredRiesgos.map((item) => {
                  const perfilInh = getPerfil(item.probabilidadInherente, item.impactoInherente);
                  const perfilRes = getPerfil(item.probabilidadResidual, item.impactoResidual);
                  const flags = Array.isArray(item.banderas) ? item.banderas : ["LAFT"];

                  return (
                    <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-2.5 font-bold text-xs whitespace-nowrap">{item.codigo}</td>
                      <td className="p-2.5 text-xs text-muted-foreground">{item.proceso}</td>
                      <td className="p-2.5 text-xs line-clamp-2 max-w-[260px]">{item.descripcion}</td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {flags.map((f, i) => (
                            <span
                              key={i}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${FLAG_COLORS[f] || "bg-gray-100 text-gray-700 border-gray-200"}`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-medium text-xs">{item.probabilidadInherente}</td>
                      <td className="p-2.5 text-center font-medium text-xs">{item.impactoInherente}</td>
                      <td className="p-2.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md inline-block min-w-[75px] ${perfilInh.bg}`}>
                          {perfilInh.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-center text-xs font-mono font-semibold">
                        {item.efectividad < 1 ? Math.round(item.efectividad * 100) : item.efectividad}%
                      </td>
                      <td className="p-2.5 text-center font-medium text-xs">{item.probabilidadResidual}</td>
                      <td className="p-2.5 text-center font-medium text-xs">{item.impactoResidual}</td>
                      <td className="p-2.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md inline-block min-w-[75px] ${perfilRes.bg}`}>
                          {perfilRes.label}
                        </span>
                      </td>
                      {/* Acciones Column */}
                      <td className="p-2.5 text-center whitespace-nowrap bg-muted/20">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Editar riesgo"
                            className="p-1.5 text-muted-foreground hover:text-teal-700 hover:bg-teal-100 dark:hover:bg-teal-950 rounded transition-colors border border-transparent hover:border-teal-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar riesgo"
                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950 rounded transition-colors border border-transparent hover:border-red-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

      {/* Modal Edit / Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-card border rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/20">
              <h3 className="text-lg font-bold">
                {editingRisk ? `Editar Riesgo: ${editingRisk.codigo}` : "Nuevo Riesgo LAFT"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xl font-bold px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Proceso</label>
                  <input
                    type="text"
                    required
                    value={formData.proceso}
                    onChange={(e) => setFormData({ ...formData, proceso: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Descripción del Riesgo</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Banderas / Factores de Riesgo</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AVAILABLE_FLAGS.map((flag) => {
                    const isSelected = formData.banderas.includes(flag);
                    return (
                      <button
                        type="button"
                        key={flag}
                        onClick={() => toggleFlag(flag)}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold border transition-all ${
                          isSelected
                            ? `${FLAG_COLORS[flag] || "bg-teal-700 text-white"} ring-2 ring-teal-500`
                            : "bg-muted text-muted-foreground border-transparent hover:border-border"
                        }`}
                      >
                        {isSelected ? `✓ ${flag}` : `+ ${flag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-muted/20 p-3 rounded-md">
                  <h4 className="font-bold text-xs uppercase text-teal-700">Riesgo Inherente</h4>
                  <div>
                    <label className="block text-xs font-medium mb-1">Probabilidad Inherente (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      required
                      value={formData.probabilidadInherente}
                      onChange={(e) => setFormData({ ...formData, probabilidadInherente: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Impacto Inherente (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      required
                      value={formData.impactoInherente}
                      onChange={(e) => setFormData({ ...formData, impactoInherente: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Perfil Inherente: </span>
                    <span className="font-bold text-teal-800">
                      {getPerfil(formData.probabilidadInherente, formData.impactoInherente).label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/20 p-3 rounded-md">
                  <h4 className="font-bold text-xs uppercase text-teal-700">Controles & Residual</h4>
                  <div>
                    <label className="block text-xs font-medium mb-1">Efectividad de Controles (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={formData.efectividad}
                      onChange={(e) => setFormData({ ...formData, efectividad: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Prob. Residual</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        required
                        value={formData.probabilidadResidual}
                        onChange={(e) => setFormData({ ...formData, probabilidadResidual: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Impacto Residual</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        required
                        value={formData.impactoResidual}
                        onChange={(e) => setFormData({ ...formData, impactoResidual: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 border rounded text-sm bg-background"
                      />
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Perfil Residual: </span>
                    <span className="font-bold text-emerald-800">
                      {getPerfil(formData.probabilidadResidual, formData.impactoResidual).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}