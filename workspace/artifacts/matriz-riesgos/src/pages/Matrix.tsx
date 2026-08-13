import React, { useState, useEffect } from "react";
import { 
  Plus, 
  RotateCcw, 
  Search, 
  Trash2
} from "lucide-react";
import { CONTROLES_OFICIALES, ControlRow, calcularPonderacion } from "./Controls";

export interface RiesgoRow {
  id: string;
  codigo: string;
  proceso: string;
  factorRiesgo: "Clientes / Contrapartes" | "Productos / Servicios" | "Canales de Distribución" | "Jurisdicciones";
  riesgo: string;
  causa: string;
  consecuencia: string;
  probabilidadInherente: number; // 1 a 5
  impactoInherente: number; // 1 a 5
  controlCodigo: string; // Código del control asignado (ej. "CTR-LAFT-01")
  observaciones: string;
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

// Riesgos Iniciales SAGRILAFT de Muestra
export const RIESGOS_INICIALES: RiesgoRow[] = [
  {
    id: "1",
    codigo: "RIE-LAFT-01",
    proceso: "Comercial / Vinculación",
    factorRiesgo: "Clientes / Contrapartes",
    riesgo: "Vinculación de clientes o contrapartes en listas restrictivas o con antecedentes LAFT",
    causa: "Falta de verificación en listas restrictivas o actualización extemporánea",
    consecuencia: "Sanciones administrativas de la Superintendencia de Sociedades y daño reputacional",
    probabilidadInherente: 4,
    impactoInherente: 5,
    controlCodigo: "CTR-LAFT-01",
    observaciones: "Control preventivo crítico de consulta permanente en listas"
  },
  {
    id: "2",
    codigo: "RIE-LAFT-02",
    proceso: "Tesorería / Cartera",
    factorRiesgo: "Productos / Servicios",
    riesgo: "Recaudo de efectivo o transferencias desde cuentas de origen no justificado",
    causa: "Pagos de terceros no identificados o falta de conciliación bancaria diaria",
    consecuencia: "Ingreso de recursos ilícitos a la contabilidad de la organización",
    probabilidadInherente: 3,
    impactoInherente: 4,
    controlCodigo: "CTR-LAFT-05",
    observaciones: "Validación y causación de recibos de caja por cartera"
  },
  {
    id: "3",
    codigo: "RIE-LAFT-03",
    proceso: "Talento Humano",
    factorRiesgo: "Clientes / Contrapartes",
    riesgo: "Contratación de empleados vinculados con actividades de lavado de activos o financiación del terrorismo",
    causa: "Estudios de seguridad o debida diligencia incompletos al momento del ingreso",
    consecuencia: "Uso de la infraestructura organizacional para operaciones sospechosas",
    probabilidadInherente: 3,
    impactoInherente: 4,
    controlCodigo: "CTR-LAFT-18",
    observaciones: "Procedimiento de debida diligencia en selección de personal"
  },
  {
    id: "4",
    codigo: "RIE-LAFT-04",
    proceso: "Compras / Contratación",
    factorRiesgo: "Clientes / Contrapartes",
    riesgo: "Pagos a proveedores ficticios o empresas fachada para canalizar recursos ilegales",
    causa: "Falta de validación del beneficiario final y certificación bancaria",
    consecuencia: "Infracciones normativas SAGRILAFT y pérdida de activos",
    probabilidadInherente: 3,
    impactoInherente: 5,
    controlCodigo: "CTR-LAFT-13",
    observaciones: "Política de pagos exclusivamente bancarizados a cuentas del titular"
  }
];

export default function Matrix() {
  // Cargar lista de controles (desde localStorage o Catálogo Oficial)
  const [controles, setControles] = useState<ControlRow[]>(() => {
    const saved = localStorage.getItem("laft_catalogo_controles_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar controles en Matriz:", e);
      }
    }
    return CONTROLES_OFICIALES;
  });

  // Cargar lista de riesgos
  const [riesgos, setRiesgos] = useState<RiesgoRow[]>(() => {
    const saved = localStorage.getItem("laft_matriz_riesgos_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar matriz de riesgos:", e);
      }
    }
    return RIESGOS_INICIALES;
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("laft_matriz_riesgos_v3", JSON.stringify(riesgos));
  }, [riesgos]);

  // Recargar controles si cambian en la otra pestaña
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("laft_catalogo_controles_v3");
      if (saved) {
        try {
          setControles(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleRiesgoChange = (id: string, field: keyof RiesgoRow, value: any) => {
    setRiesgos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRiesgo = () => {
    const nextNum = riesgos.length + 1;
    const nextCode = `RIE-LAFT-${nextNum < 10 ? "0" + nextNum : nextNum}`;
    const newRiesgo: RiesgoRow = {
      id: Date.now().toString(),
      codigo: nextCode,
      proceso: "General",
      factorRiesgo: "Clientes / Contrapartes",
      riesgo: "Nuevo evento de riesgo identificado...",
      causa: "Causa raíz del evento...",
      consecuencia: "Impacto potencial en la organización...",
      probabilidadInherente: 3,
      impactoInherente: 3,
      controlCodigo: "CTR-LAFT-01",
      observaciones: "",
    };
    setRiesgos([...riesgos, newRiesgo]);
  };

  const handleDeleteRiesgo = (id: string) => {
    if (confirm("¿Está seguro de eliminar este riesgo de la matriz?")) {
      setRiesgos(riesgos.filter((r) => r.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("¿Desea restablecer los riesgos iniciales de la matriz?")) {
      setRiesgos(RIESGOS_INICIALES);
    }
  };

  const filteredRiesgos = riesgos.filter(
    (r) =>
      r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.riesgo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.proceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.controlCodigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Encabezado Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Matriz de Riesgos LAFT / PADM
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluación del Riesgo Inherente y cálculo automático del Riesgo Residual en función de la Ponderación de los Controles.
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
            onClick={handleAddRiesgo}
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
          placeholder="Buscar riesgo por código, proceso, descripción o control asignado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Tabla Matriz de Riesgos - Diseño Exacto al Original */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-white font-semibold text-xs border-b border-slate-700">
                <th className="p-3.5 w-28 bg-[#1a2332]">Código</th>
                <th className="p-3.5 w-36 bg-[#1a2332]">Proceso</th>
                <th className="p-3.5 w-40 bg-[#1a2332]">Factor Riesgo</th>
                <th className="p-3.5 min-w-[280px] bg-[#1a2332]">Descripción del Riesgo</th>
                
                {/* RIESGO INHERENTE */}
                <th className="p-3.5 w-20 text-center bg-[#3f1919]">Prob. Inh.</th>
                <th className="p-3.5 w-20 text-center bg-[#3f1919]">Imp. Inh.</th>
                <th className="p-3.5 w-32 text-center bg-[#3f1919]">Riesgo Inherente</th>
                
                {/* CONTROL ASIGNADO Y PONDERACIÓN */}
                <th className="p-3.5 min-w-[320px] bg-[#1a2332]">Control Asignado (del Catálogo)</th>
                <th className="p-3.5 w-32 text-center bg-[#1f283d]">Ponderación Control (%)</th>
                
                {/* RIESGO RESIDUAL */}
                <th className="p-3.5 w-32 text-center bg-[#132c2a]">Riesgo Residual</th>
                <th className="p-3.5 w-16 text-center bg-[#1a2332]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRiesgos.map((item, idx) => {
                // Cálculo Inherente
                const inhScore = item.probabilidadInherente * item.impactoInherente;
                const inhLevel = getNivelRiesgo(inhScore);

                // Buscar el control asignado desde el Catálogo traído de Controls.tsx
                const controlObj = controles.find((c) => c.codigo === item.controlCodigo) || controles[0];
                
                // Ponderación de Mitigación del Control (%)
                const ponderacionControl = controlObj
                  ? calcularPonderacion(
                      controlObj.clase,
                      controlObj.tipo,
                      controlObj.frecuencia,
                      controlObj.formalidad
                    )
                  : 0;

                // Cálculo Riesgo Residual
                const resScore = Math.max(1, Math.round(inhScore * (1 - ponderacionControl / 100)));
                const resLevel = getNivelRiesgo(resScore);

                return (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/40 hover:bg-slate-100/60"}
                  >
                    {/* Código */}
                    <td className="p-3 font-bold text-slate-900 align-middle">
                      {item.codigo}
                    </td>

                    {/* Proceso */}
                    <td className="p-2 align-middle">
                      <input
                        type="text"
                        value={item.proceso}
                        onChange={(e) => handleRiesgoChange(item.id, "proceso", e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:border-indigo-500 bg-white"
                      />
                    </td>

                    {/* Factor de Riesgo */}
                    <td className="p-2 align-middle">
                      <select
                        value={item.factorRiesgo}
                        onChange={(e) => handleRiesgoChange(item.id, "factorRiesgo", e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:border-indigo-500 bg-white"
                      >
                        <option value="Clientes / Contrapartes">Clientes / Contrapartes</option>
                        <option value="Productos / Servicios">Productos / Servicios</option>
                        <option value="Canales de Distribución">Canales de Distribución</option>
                        <option value="Jurisdicciones">Jurisdicciones</option>
                      </select>
                    </td>

                    {/* Riesgo Descripción */}
                    <td className="p-2 align-middle">
                      <textarea
                        rows={2}
                        value={item.riesgo}
                        onChange={(e) => handleRiesgoChange(item.id, "riesgo", e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded-md focus:border-indigo-500 bg-white resize-y"
                      />
                    </td>

                    {/* Probabilidad Inherente */}
                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.probabilidadInherente}
                        onChange={(e) => handleRiesgoChange(item.id, "probabilidadInherente", Number(e.target.value))}
                        className="w-full text-xs p-1.5 border border-amber-400 rounded-md text-center font-bold bg-amber-50/60 text-slate-800"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </td>

                    {/* Impacto Inherente */}
                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.impactoInherente}
                        onChange={(e) => handleRiesgoChange(item.id, "impactoInherente", Number(e.target.value))}
                        className="w-full text-xs p-1.5 border border-amber-400 rounded-md text-center font-bold bg-amber-50/60 text-slate-800"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </td>

                    {/* Nivel Inherente (Badge) */}
                    <td className="p-2 align-middle text-center">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs tracking-wide shadow-xs ${inhLevel.bgBadge}`}>
                        {inhScore} - {inhLevel.label}
                      </div>
                    </td>

                    {/* Selector de Control */}
                    <td className="p-2 align-middle">
                      <select
                        value={item.controlCodigo}
                        onChange={(e) => handleRiesgoChange(item.id, "controlCodigo", e.target.value)}
                        className="w-full text-xs p-2 border border-indigo-400 rounded-md font-medium bg-white focus:ring-2 focus:ring-indigo-500 text-slate-900 shadow-xs"
                      >
                        {controles.map((ctrl) => (
                          <option key={ctrl.id} value={ctrl.codigo}>
                            {ctrl.codigo} - {ctrl.control.length > 55 ? ctrl.control.substring(0, 55) + "..." : ctrl.control}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Ponderación del Control (%) */}
                    <td className="p-2 align-middle text-center font-extrabold text-indigo-700 bg-indigo-50/40 text-sm">
                      {ponderacionControl}%
                    </td>

                    {/* Riesgo Residual (Badge) */}
                    <td className="p-2 align-middle text-center">
                      <div className={`px-2.5 py-1.5 rounded-lg text-xs tracking-wide shadow-xs ${resLevel.bgBadge}`}>
                        {resScore} - {resLevel.label}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="p-2 align-middle text-center">
                      <button
                        onClick={() => handleDeleteRiesgo(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Eliminar riesgo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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