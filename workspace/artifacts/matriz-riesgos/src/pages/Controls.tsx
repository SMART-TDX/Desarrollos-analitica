import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Plus, 
  RotateCcw, 
  Search, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  FileText,
  Trash2
} from "lucide-react";

export interface ControlRow {
  id: string;
  codigo: string;
  control: string;
  clase: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
  tipo: "AUTOMÁTICO" | "SEMIAUTOMÁTICO" | "MANUAL";
  frecuencia: "PERMANENTE" | "OCASIONAL" | "PERIÓDICO";
  formalidad: "DODI" | "NODO";
}

// 1. Mapeos oficiales de PESO según SAGRILAFT
export const PESO_CLASE: Record<string, number> = {
  PREVENTIVO: 45,
  DETECTIVO: 40,
  CORRECTIVO: 30,
};

export const PESO_TIPO: Record<string, number> = {
  "AUTOMÁTICO": 45,
  "SEMIAUTOMÁTICO": 35,
  "MANUAL": 20,
};

export const PESO_FRECUENCIA: Record<string, number> = {
  PERMANENTE: 45,
  OCASIONAL: 30,
  "PERIÓDICO": 20,
};

export const PESO_FORMALIDAD: Record<string, number> = {
  DODI: 45, // Documentado y Divulgado
  NODO: 15, // No Documentado
};

// 2. Función de cálculo automático de Ponderación
export function calcularPonderacion(
  clase: string,
  tipo: string,
  frecuencia: string,
  formalidad: string
): number {
  const pClase = PESO_CLASE[clase] || 0;
  const pTipo = PESO_TIPO[tipo] || 0;
  const pFrec = PESO_FRECUENCIA[frecuencia] || 0;
  const pForm = PESO_FORMALIDAD[formalidad] || 0;

  const suma = pClase + pTipo + pFrec + pForm;
  return Math.round(suma / 4);
}

// 3. Catálogo Oficial de 26 Controles de la Imagen
export const CONTROLES_OFICIALES: ControlRow[] = [
  {
    id: "1",
    codigo: "CTR-LAFT-01",
    control: "Consulta en las listas para todas las personas naturales o juridicas que se vinculen con la compañía y solicitud de Certificación SAGRILAFT",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "2",
    codigo: "CTR-LAFT-02",
    control: "Aceptacion de clausula SAGRILAFT sobre origen y destino de los recursos, incluida en los contratos Smart",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "3",
    codigo: "CTR-LAFT-03",
    control: "Aprobacion por parte de gerencia para los casos que pueden llegar a representen un riesgo para la academia",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "OCASIONAL",
    formalidad: "DODI"
  },
  {
    id: "4",
    codigo: "CTR-LAFT-04",
    control: "Chequeo de información pública en medios comunicacion (Internet, Prensa, Radio, TV, Redes Sociales, Diario Oficial, Gaceta Distrital y otras) para las novedades en listas.",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "5",
    codigo: "CTR-LAFT-05",
    control: "Validacion y causacion de recibos de caja por parte de facturacion y cartera de los pagos realizados por los diferentes canales de recaudo.",
    clase: "DETECTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "6",
    codigo: "CTR-LAFT-06",
    control: "Identificacion y seguimiento de las partidas pendientes por identificar en los Bancos (cartera)",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "7",
    codigo: "CTR-LAFT-07",
    control: "Revision por parte de sdagrilaft de los reportes diarios gestionados por cartera de los canales de recaudo.",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERIÓDICO",
    formalidad: "DODI"
  },
  {
    id: "8",
    codigo: "CTR-LAFT-08",
    control: "Adquirir un servicio de consulta en listas por medio de un proveedor tecnologico de para el manejo de Listas",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "9",
    codigo: "CTR-LAFT-09",
    control: "Analisis y aprobacion por parte de facturacion y matriculas de los documentos cargados en schoolpack",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "10",
    codigo: "CTR-LAFT-10",
    control: "Aplicacion de los procedimientos para verificacion y aprobacion de los documentos suministrados por los Clientes por parte de facturacion y matriculas.",
    clase: "DETECTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "11",
    codigo: "CTR-LAFT-11",
    control: "Realizar capacitaciones a los colaboradores de la academia en temas como gestion documental,Señales de alerta, identificacion de Operaciones sospechosas, cambios importantes en la regulacion y concientizar sobre la prevención del LA/FT/PADM.",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERIÓDICO",
    formalidad: "DODI"
  },
  {
    id: "12",
    codigo: "CTR-LAFT-12",
    control: "Aplicación del procedimiento para identificación y conocimiento para identificar los clientes naturales y juridicos, junto con los beneficiarios finales, validando la documentación entregada.",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "13",
    codigo: "CTR-LAFT-13",
    control: "Politica sobre el pago a contrapartes unicamente a través de medios bancarios, como transferencias bancarias a cuentas certificadas a nombre de la contraparte con quien se realiza la compra del producto o prestacion del servicio.",
    clase: "PREVENTIVO",
    tipo: "AUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "14",
    codigo: "CTR-LAFT-14",
    control: "Concepto del oficial de cumplimiento para vincular una contrapartes, posterior a la revision inicial de los analistas del proceso.",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "15",
    codigo: "CTR-LAFT-15",
    control: "Validacion por parte del proceso de juridica encunato a que los inmuebles en los que se va a realizar la actividad economica no presenten procesos judiciales, cautelares que puedan generar un riesgo para Smart.",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "16",
    codigo: "CTR-LAFT-16",
    control: "Conocimiento por parte de los empleados del listado de señales de alerta y del mecanismo de reporte",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "17",
    codigo: "CTR-LAFT-17",
    control: "Divulgación del Código de Etica y Conducta y lineamientos para la prevencion y control del riesgo LA/FT",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "18",
    codigo: "CTR-LAFT-18",
    control: "Aplicación del procedimiento de Talento Humano para la vinculacion de nuevos colaboradores.",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "19",
    codigo: "CTR-LAFT-19",
    control: "Revision del cumplimiento de debida diligencia de los los proveedores registrados en el CONTROL DE FACTURACIÓN ELECTRONICA 2024, que maneja contabilidad por parte de sagrilaft",
    clase: "DETECTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "20",
    codigo: "CTR-LAFT-20",
    control: "Identificación de cumplimiento de protocolos de seguridad de las herramientas, aplicaciones, Software y Hardware, que procesan, almacenan y gestionan información y/o operaciones financieras de la academia",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "21",
    codigo: "CTR-LAFT-21",
    control: "Politicas de seguridad respecto al uso y restriccion de usuarios de equipos, aplicaciones y plataformas por parte de los colaboradores",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    formalidad: "DODI"
  },
  {
    id: "22",
    codigo: "CTR-LAFT-22",
    control: "Administracion de usuarios por niveles de seguridad de acuerdo al cargo al Area y la informacio que requiera.",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "PERIÓDICO",
    formalidad: "DODI"
  },
  {
    id: "23",
    codigo: "CTR-LAFT-23",
    control: "Analisis de los factores de riesgo por parte de Sagrilaft, antes del lanzamiento de un nuevo producto o aperturas de sedes.",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "OCASIONAL",
    formalidad: "NODO"
  },
  {
    id: "24",
    codigo: "CTR-LAFT-24",
    control: "Analizis de Jurisdicciones donde la academia realiza o proyecta sus actividades comerciales-",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "OCASIONAL",
    formalidad: "NODO"
  },
  {
    id: "25",
    codigo: "CTR-LAFT-25",
    control: "Revision y actualizacion de la Matriz legal de Smart",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERIÓDICO",
    formalidad: "DODI"
  },
  {
    id: "26",
    codigo: "CTR-LAFT-26",
    control: "Divulgación de las obligaciones normativas Frente al cumplimiento del sistema Sagrilaft",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERIÓDICO",
    formalidad: "DODI"
  }
];

// Alias para evitar errores de importación en otros componentes
export const CONTROLES_INICIALES = CONTROLES_OFICIALES;

export default function Controls() {
  const [controles, setControles] = useState<ControlRow[]>(() => {
    const saved = localStorage.getItem("laft_catalogo_controles_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar controles:", e);
      }
    }
    return CONTROLES_OFICIALES;
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem("laft_catalogo_controles_v3", JSON.stringify(controles));
  }, [controles]);

  const handleSelectChange = (
    id: string,
    field: "clase" | "tipo" | "frecuencia" | "formalidad",
    value: string
  ) => {
    setControles((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            [field]: value,
          } as ControlRow;
        }
        return c;
      })
    );
  };

  const handleControlTextChange = (id: string, text: string) => {
    setControles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, control: text } : c))
    );
  };

  const handleAddControl = () => {
    const nextNum = controles.length + 1;
    const nextCode = `CTR-LAFT-${nextNum < 10 ? "0" + nextNum : nextNum}`;
    const newControl: ControlRow = {
      id: Date.now().toString(),
      codigo: nextCode,
      control: "Nuevo control SAGRILAFT...",
      clase: "PREVENTIVO",
      tipo: "SEMIAUTOMÁTICO",
      frecuencia: "PERMANENTE",
      formalidad: "DODI",
    };
    setControles([...controles, newControl]);
  };

  const handleDeleteControl = (id: string) => {
    if (confirm("¿Está seguro de eliminar este control?")) {
      setControles(controles.filter((c) => c.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("¿Desea restablecer los 26 controles iniciales de la matriz original?")) {
      setControles(CONTROLES_OFICIALES);
    }
  };

  const filteredControles = controles.filter(
    (c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.control.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clase.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalControles = controles.length;
  const promedioPonderacion =
    totalControles > 0
      ? Math.round(
          controles.reduce(
            (acc, c) => acc + calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad),
            0
          ) / totalControles
        )
      : 0;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Restablecer controles originales"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer 26 Controles
          </button>
          <button
            onClick={handleAddControl}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Control
          </button>
        </div>
      </div>

      {/* Tarjetas Informativas & Leyenda */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalControles}</div>
            <div className="text-xs font-medium text-slate-500">Total Controles Registrados</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{promedioPonderacion}%</div>
            <div className="text-xs font-medium text-slate-500">Ponderación Promedio General</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {controles.filter((c) => c.clase === "PREVENTIVO").length} / {controles.filter((c) => c.clase === "DETECTIVO").length}
            </div>
            <div className="text-xs font-medium text-slate-500">Preventivos / Detectivos</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Parámetros y Pesos SAGRILAFT
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-600">
            <div>• Preventivo: <span className="font-semibold text-slate-900">45%</span></div>
            <div>• Detectivo: <span className="font-semibold text-slate-900">40%</span></div>
            <div>• Automático: <span className="font-semibold text-slate-900">45%</span></div>
            <div>• Semiautomático: <span className="font-semibold text-slate-900">35%</span></div>
            <div>• Permanente: <span className="font-semibold text-slate-900">45%</span></div>
            <div>• Ocasional: <span className="font-semibold text-slate-900">30%</span></div>
            <div>• DODI (Doc/Div): <span className="font-semibold text-slate-900">45%</span></div>
            <div>• NODO (No Doc): <span className="font-semibold text-slate-900">15%</span></div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código, descripción de control o clase..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="p-3 w-28 border-b border-slate-700">Código</th>
                <th className="p-3 min-w-[320px] border-b border-slate-700">Control</th>
                
                <th className="p-3 border-b border-slate-700 text-center bg-red-900/40 w-36">CLASE</th>
                <th className="p-3 border-b border-slate-700 text-center bg-slate-700 w-16">PESO</th>
                
                <th className="p-3 border-b border-slate-700 text-center bg-red-900/40 w-40">TIPO</th>
                <th className="p-3 border-b border-slate-700 text-center bg-slate-700 w-16">PESO</th>
                
                <th className="p-3 border-b border-slate-700 text-center bg-red-900/40 w-36">FRECUENCIA</th>
                <th className="p-3 border-b border-slate-700 text-center bg-slate-700 w-16">PESO</th>
                
                <th className="p-3 border-b border-slate-700 text-center bg-red-900/40 w-36">Formalidad del Control</th>
                <th className="p-3 border-b border-slate-700 text-center bg-slate-700 w-16">PESO</th>
                
                <th className="p-3 border-b border-slate-700 text-center bg-slate-900 w-28">PONDERACION</th>
                <th className="p-3 border-b border-slate-700 text-center w-12">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredControles.map((item, idx) => {
                const pesoClase = PESO_CLASE[item.clase] || 0;
                const pesoTipo = PESO_TIPO[item.tipo] || 0;
                const pesoFrec = PESO_FRECUENCIA[item.frecuencia] || 0;
                const pesoForm = PESO_FORMALIDAD[item.formalidad] || 0;
                const ponderacion = calcularPonderacion(
                  item.clase,
                  item.tipo,
                  item.frecuencia,
                  item.formalidad
                );

                return (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-amber-50/30 hover:bg-amber-100/40" : "bg-white hover:bg-slate-50"}
                  >
                    <td className="p-2 font-bold text-slate-800 align-middle">
                      {item.codigo}
                    </td>

                    <td className="p-2 align-middle">
                      <textarea
                        rows={2}
                        value={item.control}
                        onChange={(e) => handleControlTextChange(item.id, e.target.value)}
                        className="w-full text-xs p-1.5 border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded bg-transparent focus:bg-white resize-y transition-all text-slate-800"
                      />
                    </td>

                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.clase}
                        onChange={(e) => handleSelectChange(item.id, "clase", e.target.value)}
                        className="w-full text-xs p-1 border border-slate-300 rounded font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PREVENTIVO">PREVENTIVO</option>
                        <option value="DETECTIVO">DETECTIVO</option>
                        <option value="CORRECTIVO">CORRECTIVO</option>
                      </select>
                    </td>
                    <td className="p-2 align-middle text-center font-semibold text-slate-700 bg-slate-100/80">
                      {pesoClase}%
                    </td>

                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.tipo}
                        onChange={(e) => handleSelectChange(item.id, "tipo", e.target.value)}
                        className="w-full text-xs p-1 border border-slate-300 rounded font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="AUTOMÁTICO">AUTOMÁTICO</option>
                        <option value="SEMIAUTOMÁTICO">SEMIAUTOMÁTICO</option>
                        <option value="MANUAL">MANUAL</option>
                      </select>
                    </td>
                    <td className="p-2 align-middle text-center font-semibold text-slate-700 bg-slate-100/80">
                      {pesoTipo}%
                    </td>

                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.frecuencia}
                        onChange={(e) => handleSelectChange(item.id, "frecuencia", e.target.value)}
                        className="w-full text-xs p-1 border border-slate-300 rounded font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PERMANENTE">PERMANENTE</option>
                        <option value="OCASIONAL">OCASIONAL</option>
                        <option value="PERIÓDICO">PERIÓDICO</option>
                      </select>
                    </td>
                    <td className="p-2 align-middle text-center font-semibold text-slate-700 bg-slate-100/80">
                      {pesoFrec}%
                    </td>

                    <td className="p-2 align-middle text-center">
                      <select
                        value={item.formalidad}
                        onChange={(e) => handleSelectChange(item.id, "formalidad", e.target.value)}
                        className="w-full text-xs p-1 border border-slate-300 rounded font-bold text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="DODI">DODI</option>
                        <option value="NODO">NODO</option>
                      </select>
                    </td>
                    <td className="p-2 align-middle text-center font-semibold text-slate-700 bg-slate-100/80">
                      {pesoForm}%
                    </td>

                    <td className="p-2 align-middle text-center font-bold bg-slate-200/80 text-slate-900 text-sm">
                      <span className={`inline-block px-2 py-1 rounded ${
                        ponderacion >= 40 
                          ? "bg-emerald-100 text-emerald-800" 
                          : ponderacion >= 30 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {ponderacion}%
                      </span>
                    </td>

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