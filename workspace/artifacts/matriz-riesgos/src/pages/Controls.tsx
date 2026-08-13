import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  RotateCcw,
  Search,
  FileText,
  Percent,
  Sliders,
  Layers,
  Trash2,
  CheckCircle2
} from "lucide-react";

export interface ControlRow {
  id: string;
  codigo: string;
  control: string;
  clase: "Preventivo" | "Detectivo" | "Correctivo";
  tipo: "Automático" | "Semiautomático" | "Manual";
  frecuencia: "Permanente" | "Ocasional";
  formalidad: "DODI" | "NODO";
}

// Funciones de cálculo de pesos e índice de ponderación SAGRILAFT
export function getPesoClase(clase: string): number {
  switch (clase) {
    case "Preventivo": return 45;
    case "Detectivo": return 40;
    case "Correctivo": return 35;
    default: return 40;
  }
}

export function getPesoTipo(tipo: string): number {
  switch (tipo) {
    case "Automático": return 45;
    case "Semiautomático": return 35;
    case "Manual": return 20;
    default: return 35;
  }
}

export function getPesoFrecuencia(frecuencia: string): number {
  switch (frecuencia) {
    case "Permanente": return 45;
    case "Ocasional": return 30;
    default: return 30;
  }
}

export function getPesoFormalidad(formalidad: string): number {
  switch (formalidad) {
    case "DODI": return 45; // Documentado y Divulgado
    case "NODO": return 15; // No Documentado / No Divulgado
    default: return 15;
  }
}

export function calcularPonderacion(
  clase: string,
  tipo: string,
  frecuencia: string,
  formalidad: string
): number {
  const pClase = getPesoClase(clase);
  const pTipo = getPesoTipo(tipo);
  const pFrec = getPesoFrecuencia(frecuencia);
  const pForm = getPesoFormalidad(formalidad);
  return Math.round((pClase + pTipo + pFrec + pForm) / 4);
}

// Catálogo Oficial SAGRILAFT de 26 Controles Base
export const CONTROLES_OFICIALES: ControlRow[] = [
  { id: "1", codigo: "CTR-LAFT-01", control: "Consulta en listas restrictivas y sancionatorias (OFAC, ONU, PEPs, Fiscalías) para vinculación de contrapartes", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "2", codigo: "CTR-LAFT-02", control: "Formulario de debida diligencia de conocimiento del cliente (KYC) y actualización anual", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "3", codigo: "CTR-LAFT-03", control: "Verificación y validación del Beneficiario Final (participación igual o superior al 5%)", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "4", codigo: "CTR-LAFT-04", control: "Monitoreo transaccional de alertas por comportamientos atípicos o montos inusuales", clase: "Detectivo", tipo: "Automático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "5", codigo: "CTR-LAFT-05", control: "Conciliación bancaria diaria y verificación de origen de fondos en cuentas de recaudo", clase: "Detectivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "6", codigo: "CTR-LAFT-06", control: "Prohibición de recibo de efectivo en ventanilla para valores superiores a los umbrales autorizados", clase: "Preventivo", tipo: "Manual", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "7", codigo: "CTR-LAFT-07", control: "Inclusión de cláusula SAGRILAFT de origen de fondos y autorización de listas en contratos con proveedores", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "8", codigo: "CTR-LAFT-08", control: "Debida diligencia intensificada (DDI) para Contrapartes en Jurisdicciones de Alto Riesgo o PEPs", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "9", codigo: "CTR-LAFT-09", control: "Verificación de certificaciones bancarias y vigencia de RUT en proveedores antes de orden de pago", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "10", codigo: "CTR-LAFT-10", control: "Segmentación de clientes, productos, canales y jurisdicciones según matriz de factores de riesgo", clase: "Preventivo", tipo: "Automático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "11", codigo: "CTR-LAFT-11", control: "Revisión y auditoría anual del Oficial de Cumplimiento sobre la efectividad del SAGRILAFT", clase: "Detectivo", tipo: "Manual", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "12", codigo: "CTR-LAFT-12", control: "Capacitación anual obligatoria en SAGRILAFT / PADM para el 100% de los colaboradores", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "13", codigo: "CTR-LAFT-13", control: "Bancarización del 100% de los pagos a proveedores y terceros vinculados", clase: "Preventivo", tipo: "Automático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "14", codigo: "CTR-LAFT-14", control: "Análisis de operaciones sospechosas (ROS) y reporte a la UIAF en los plazos reglamentarios", clase: "Detectivo", tipo: "Semiautomático", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "15", codigo: "CTR-LAFT-15", control: "Reporte de Ausencia de Operaciones Sospechosas (AROS) trimestral ante la UIAF", clase: "Detectivo", tipo: "Semiautomático", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "16", codigo: "CTR-LAFT-16", control: "Custodia y conservación de documentos de debida diligencia por el término mínimo legal de 10 años", clase: "Preventivo", tipo: "Automático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "17", codigo: "CTR-LAFT-17", control: "Validación de poderes y vigencia de certificados de existencia y representación legal", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "18", codigo: "CTR-LAFT-18", control: "Debida diligencia en selección de personal (estudios de seguridad y consulta en listas)", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "19", codigo: "CTR-LAFT-19", control: "Seguimiento y control de anticipos otorgados a contratistas o proveedores", clase: "Detectivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "20", codigo: "CTR-LAFT-20", control: "Monitoreo y bloqueo automático de transacciones vinculadas a países de la lista negra GAFI", clase: "Preventivo", tipo: "Automático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "21", codigo: "CTR-LAFT-21", control: "Verificación de coincidencia entre titular de factura y titular de cuenta bancaria receptora", clase: "Detectivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "22", codigo: "CTR-LAFT-22", control: "Evaluación semestral de efectividad de los controles por parte de la Auditoría Interna / Revisoría", clase: "Detectivo", tipo: "Manual", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "23", codigo: "CTR-LAFT-23", control: "Canal ético / Línea de denuncias anónimas para reportes de irregularidades o sospechas", clase: "Detectivo", tipo: "Semiautomático", frecuencia: "Permanente", formalidad: "DODI" },
  { id: "24", codigo: "CTR-LAFT-24", control: "Actualización periódica de la política de SAGRILAFT conforme a modificaciones normativas", clase: "Preventivo", tipo: "Manual", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "25", codigo: "CTR-LAFT-25", control: "Control y autorización de firmas para operaciones financieras extraordinarias", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Ocasional", formalidad: "DODI" },
  { id: "26", codigo: "CTR-LAFT-26", control: "Validación de la no existencia de sanciones en la Superintendencia de Sociedades", clase: "Preventivo", tipo: "Semiautomático", frecuencia: "Ocasional", formalidad: "DODI" },
];

export default function Controls() {
  const [controles, setControles] = useState<ControlRow[]>(() => {
    const saved = localStorage.getItem("laft_catalogo_controles_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error cargando controles guardados:", e);
      }
    }
    return CONTROLES_OFICIALES;
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("laft_catalogo_controles_v3", JSON.stringify(controles));
  }, [controles]);

  const handleControlChange = (id: string, field: keyof ControlRow, value: any) => {
    setControles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAddControl = () => {
    const nextNum = controles.length + 1;
    const nextCode = `CTR-LAFT-${nextNum < 10 ? "0" + nextNum : nextNum}`;
    const newControl: ControlRow = {
      id: Date.now().toString(),
      codigo: nextCode,
      control: "Nuevo control parametrizado para gestión de riesgos...",
      clase: "Preventivo",
      tipo: "Semiautomático",
      frecuencia: "Permanente",
      formalidad: "DODI",
    };
    setControles([...controles, newControl]);
  };

  const handleDeleteControl = (id: string) => {
    if (confirm("¿Desea eliminar este control del catálogo?")) {
      setControles(controles.filter((c) => c.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("¿Restablecer los 26 controles oficializados al estado original?")) {
      setControles(CONTROLES_OFICIALES);
    }
  };

  // Cálculos estadísticos
  const totalControles = controles.length;
  const preventivosCount = controles.filter((c) => c.clase === "Preventivo").length;
  const detectivosCount = controles.filter((c) => c.clase === "Detectivo").length;

  const promedioPonderacion = totalControles > 0
    ? Math.round(
        controles.reduce(
          (acc, c) => acc + calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad),
          0
        ) / totalControles
      )
    : 0;

  const filteredControles = controles.filter(
    (c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.control.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1700px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Panel Superior Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <Shield className="w-4 h-4" />
            <span>SISTEMA DE GESTIÓN SAGRILAFT</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Catálogo de Controles LAFT
          </h1>
          <p className="text-sm text-slate-500">
            Matriz parametrizada con cálculo automático de pesos y porcentaje de ponderación por control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer {CONTROLES_OFICIALES.length} Controles
          </button>
          <button
            onClick={handleAddControl}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Control
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalControles}</div>
            <div className="text-xs font-medium text-slate-500">Total Controles Registrados</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{promedioPonderacion}%</div>
            <div className="text-xs font-medium text-slate-500">Ponderación Promedio General</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{preventivosCount} / {detectivosCount}</div>
            <div className="text-xs font-medium text-slate-500">Preventivos / Detectivos</div>
          </div>
        </div>

        {/* Parámetros SAGRILAFT de Referencia */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1.5 leading-relaxed text-slate-600">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Parámetros y Pesos SAGRILAFT</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
            <div>• Preventivo: <b className="text-slate-800">45%</b></div>
            <div>• Detectivo: <b className="text-slate-800">40%</b></div>
            <div>• Automático: <b className="text-slate-800">45%</b></div>
            <div>• Semiautomático: <b className="text-slate-800">35%</b></div>
            <div>• Permanente: <b className="text-slate-800">45%</b></div>
            <div>• Ocasional: <b className="text-slate-800">30%</b></div>
            <div>• DODI (Doc/Div): <b className="text-slate-800">45%</b></div>
            <div>• NODO (No Doc): <b className="text-slate-800">15%</b></div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Buscar por código, descripción de control o clase..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Tabla Uniforme de Controles (Sin bloques rojos/marrón) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Encabezado Unificado Slate Oscuro */}
              <tr className="bg-slate-900 text-slate-100 font-semibold tracking-wide border-b border-slate-800">
                <th className="p-3.5 w-28">Código</th>
                <th className="p-3.5 min-w-[320px]">Control</th>
                <th className="p-3.5 w-36 text-center">CLASE</th>
                <th className="p-3.5 w-16 text-center bg-slate-800/60">PESO</th>
                <th className="p-3.5 w-40 text-center">TIPO</th>
                <th className="p-3.5 w-16 text-center bg-slate-800/60">PESO</th>
                <th className="p-3.5 w-36 text-center">FRECUENCIA</th>
                <th className="p-3.5 w-16 text-center bg-slate-800/60">PESO</th>
                <th className="p-3.5 w-36 text-center">Formalidad del Control</th>
                <th className="p-3.5 w-16 text-center bg-slate-800/60">PESO</th>
                <th className="p-3.5 w-28 text-center bg-indigo-950 text-indigo-200">PONDERACION</th>
                <th className="p-3.5 w-16 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredControles.map((item, idx) => {
                const pClase = getPesoClase(item.clase);
                const pTipo = getPesoTipo(item.tipo);
                const pFrec = getPesoFrecuencia(item.frecuencia);
                const pForm = getPesoFormalidad(item.formalidad);
                const ponderacion = calcularPonderacion(
                  item.clase,
                  item.tipo,
                  item.frecuencia,
                  item.formalidad
                );

                return (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/40 hover:bg-slate-100/60"}
                  >
                    {/* Código */}
                    <td className="p-3 font-bold text-slate-900 align-middle">
                      {item.codigo}
                    </td>

                    {/* Descripción del Control */}
                    <td className="p-2 align-middle">
                      <textarea
                        rows={2}
                        value={item.control}
                        onChange={(e) => handleControlChange(item.id, "control", e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-transparent focus:bg-white resize-y"
                      />
                    </td>

                    {/* Clase */}
                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.clase}
                        onChange={(e) => handleControlChange(item.id, "clase", e.target.value as any)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded font-medium bg-white focus:border-indigo-500"
                      >
                        <option value="Preventivo">Preventivo</option>
                        <option value="Detectivo">Detectivo</option>
                        <option value="Correctivo">Correctivo</option>
                      </select>
                    </td>

                    {/* Peso Clase */}
                    <td className="p-2 align-middle text-center font-mono font-semibold text-slate-600 bg-slate-100/50">
                      {pClase}%
                    </td>

                    {/* Tipo */}
                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.tipo}
                        onChange={(e) => handleControlChange(item.id, "tipo", e.target.value as any)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded font-medium bg-white focus:border-indigo-500"
                      >
                        <option value="Automático">Automático</option>
                        <option value="Semiautomático">Semiautomático</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </td>

                    {/* Peso Tipo */}
                    <td className="p-2 align-middle text-center font-mono font-semibold text-slate-600 bg-slate-100/50">
                      {pTipo}%
                    </td>

                    {/* Frecuencia */}
                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.frecuencia}
                        onChange={(e) => handleControlChange(item.id, "frecuencia", e.target.value as any)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded font-medium bg-white focus:border-indigo-500"
                      >
                        <option value="Permanente">Permanente</option>
                        <option value="Ocasional">Ocasional</option>
                      </select>
                    </td>

                    {/* Peso Frecuencia */}
                    <td className="p-2 align-middle text-center font-mono font-semibold text-slate-600 bg-slate-100/50">
                      {pFrec}%
                    </td>

                    {/* Formalidad */}
                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.formalidad}
                        onChange={(e) => handleControlChange(item.id, "formalidad", e.target.value as any)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded font-medium bg-white focus:border-indigo-500"
                      >
                        <option value="DODI">DODI (Doc / Div)</option>
                        <option value="NODO">NODO (No Doc)</option>
                      </select>
                    </td>

                    {/* Peso Formalidad */}
                    <td className="p-2 align-middle text-center font-mono font-semibold text-slate-600 bg-slate-100/50">
                      {pForm}%
                    </td>

                    {/* Ponderación Final Calculada */}
                    <td className="p-2 align-middle text-center bg-emerald-50/60">
                      <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-extrabold font-mono text-xs shadow-xs">
                        {ponderacion}%
                      </span>
                    </td>

                    {/* Eliminar */}
                    <td className="p-2 align-middle text-center">
                      <button
                        onClick={() => handleDeleteControl(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Eliminar control"
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