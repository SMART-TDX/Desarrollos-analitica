import React, { useState, useEffect } from "react";

export const CONTROLES_KEY = "laft_controles_v5_force";

export interface CatalogControl {
  id: string;
  codigo: string;
  descripcion: string;
  clase: string;
  pesoClase: number;
  tipo: string;
  pesoTipo: number;
  frecuencia: string;
  pesoFrecuencia: number;
  formalidad: string;
  pesoFormalidad: number;
  ponderacion: number;
}

export const DEFAULT_CATALOG_CONTROLES: CatalogControl[] = [
  {
    id: "1",
    codigo: "CTR-LAFT-01",
    descripcion: "Consulta en las listas para todas las personas naturales o jurídicas que se vinculen con la compañía y solicitud de Certificación SAGRILAFT",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 43
  },
  {
    id: "2",
    codigo: "CTR-LAFT-02",
    descripcion: "Aceptacion de clausula SAGRILAFT sobre origen y destino de los recursos, incluida en los contratos Smart",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 43
  },
  {
    id: "3",
    codigo: "CTR-LAFT-03",
    descripcion: "Aprobacion por parte de gerencia para los casos que pueden llegar a representar un riesgo para la academia",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "OCASIONAL",
    pesoFrecuencia: 30,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 34
  },
  {
    id: "4",
    codigo: "CTR-LAFT-04",
    descripcion: "Chequeo de información pública en medios de comunicación (Internet, Prensa, Radio, TV, Redes Sociales, Diario Oficial, Gaceta Distrital y otras) para las novedades en listas.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 43
  },
  {
    id: "5",
    codigo: "CTR-LAFT-05",
    descripcion: "Validacion y causacion de recibos de caja por parte de facturacion y cartera de los pagos realizados por los diferentes canales de recaudo.",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 42
  },
  {
    id: "6",
    codigo: "CTR-LAFT-06",
    descripcion: "Identificacion y seguimiento de las partidas pendientes por identificar en los Bancos (cartera)",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 38
  },
  {
    id: "7",
    codigo: "CTR-LAFT-07",
    descripcion: "Revision por parte de sagrilaft de los reportes diarios gestionados por cartera de los canales de recaudo.",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERIODICO",
    pesoFrecuencia: 20,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 29
  },
  {
    id: "8",
    codigo: "CTR-LAFT-08",
    descripcion: "Adquirir un servicio de consulta en listas por medio de un proveedor tecnologico de para el manejo de listas",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 43
  },
  {
    id: "9",
    codigo: "CTR-LAFT-09",
    descripcion: "Analisis y aprobacion por parte de facturacion y matriculas de los documentos cargados en schoolpack",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "10",
    codigo: "CTR-LAFT-10",
    descripcion: "Aplicacion de los procedimientos para verificacion y aprobacion de los documentos suministrados por los Clientes por parte de facturacion y matriculas.",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 42
  },
  {
    id: "11",
    codigo: "CTR-LAFT-11",
    descripcion: "Realizar capacitaciones a los colaboradores de la academia en temas como gestion documental,señales de alerta, identificacion de Operaciones sospechosas, cambios importantes en la regulacion y concientizar sobre la prevencion del LA/FT/PADM.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERIODICO",
    pesoFrecuencia: 20,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 34
  },
  {
    id: "12",
    codigo: "CTR-LAFT-12",
    descripcion: "Aplicación del procedimiento para identificación y conocimiento para identificar los clientes naturales y jurídicos, junto con los beneficiarios finales, validando la documentación entregada.",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 38
  },
  {
    id: "13",
    codigo: "CTR-LAFT-13",
    descripcion: "Politica sobre el pago a contrapartes unicamente a través de medios bancarios, como transferencias bancarias a cuentas certificadas a nombre de la contraparte con quien se realiza la compra del producto o prestacion del servicio.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "AUTOMÁTICO",
    pesoTipo: 45,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 45
  },
  {
    id: "14",
    codigo: "CTR-LAFT-14",
    descripcion: "Concepto del oficial de cumplimiento para vincular una contrapartes, posterior a la revision inicial de los analistas del proceso.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "15",
    codigo: "CTR-LAFT-15",
    descripcion: "Validacion por parte del proceso de juridica encunato a que los inmuebles en los que se va a realizar la actividad economica no presenten procesos judiciales, cautelares que puedan generar un riesgo para Smart.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "16",
    codigo: "CTR-LAFT-16",
    descripcion: "Conocimiento por parte de los empleados del listado de señales de alerta y del mecanismo de reporte",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 38
  },
  {
    id: "17",
    codigo: "CTR-LAFT-17",
    descripcion: "Divulgación del Código de Etica y Conducta y lineamientos para la prevención y control del riesgo LA/FT",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "18",
    codigo: "CTR-LAFT-18",
    descripcion: "Aplicación del procedimiento de Talento Humano para la vinculación de nuevos colaboradores.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "19",
    codigo: "CTR-LAFT-19",
    descripcion: "Revision del cumplimiento de debida diligencia de los los proveedores registrados en el CONTROL DE FACTURACION ELECTRONICA 2024, que maneja contabilidad por parte de sagrilaft",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 42
  },
  {
    id: "20",
    codigo: "CTR-LAFT-20",
    descripcion: "Identificacion de cumplimiento de protocolos de seguridad de las herramientas, aplicaciones, Software y Hardware, que procesan, almacenan y gestionan información y/o operaciones financieras de la academia",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "21",
    codigo: "CTR-LAFT-21",
    descripcion: "Politicas de seguridad respecto al uso y restriccion de usuarios de equipos, aplicaciones y plataformas por parte de los colaboradores.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 39
  },
  {
    id: "22",
    codigo: "CTR-LAFT-22",
    descripcion: "Administracion de usuarios por niveles de seguridad de acuerdo al cargo al Area y la informacio que requiera.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERIODICO",
    pesoFrecuencia: 20,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 30
  },
  {
    id: "23",
    codigo: "CTR-LAFT-23",
    descripcion: "Analisis de los factores de riesgo por parte de Sagrilaft, antes del lanzamiento de un nuevo producto o aperturas de sedes.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "OCASIONAL",
    pesoFrecuencia: 30,
    formalidad: "NODO",
    pesoFormalidad: 15,
    ponderacion: 28
  },
  {
    id: "24",
    codigo: "CTR-LAFT-24",
    descripcion: "Analisis de Jurisdicciones donde la academia realiza o proyecta sus actividades comerciales.",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "OCASIONAL",
    pesoFrecuencia: 30,
    formalidad: "NODO",
    pesoFormalidad: 15,
    ponderacion: 28
  },
  {
    id: "25",
    codigo: "CTR-LAFT-25",
    descripcion: "Revision y actualizacion de la Matriz legal de Smart",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERIODICO",
    pesoFrecuencia: 20,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 29
  },
  {
    id: "26",
    codigo: "CTR-LAFT-26",
    descripcion: "Divulgación de las obligaciones normativas Frente al cumplimiento del sistema Sagrilaft",
    clase: "DETECTIVO",
    pesoClase: 40,
    tipo: "MANUAL",
    pesoTipo: 20,
    frecuencia: "PERIODICO",
    pesoFrecuencia: 20,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 29
  }
];

export default function Controls() {
  const [controles, setControles] = useState<CatalogControl[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<CatalogControl | null>(null);

  const [formData, setFormData] = useState<Omit<CatalogControl, "id">>({
    codigo: "",
    descripcion: "",
    clase: "PREVENTIVO",
    pesoClase: 45,
    tipo: "SEMIAUTOMÁTICO",
    pesoTipo: 35,
    frecuencia: "PERMANENTE",
    pesoFrecuencia: 45,
    formalidad: "DODI",
    pesoFormalidad: 45,
    ponderacion: 43
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONTROLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 26) {
          setControles(parsed);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    setControles(DEFAULT_CATALOG_CONTROLES);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(DEFAULT_CATALOG_CONTROLES));
  }, []);

  const saveToStorage = (updated: CatalogControl[]) => {
    setControles(updated);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(updated));
  };

  const handleOpenCreate = () => {
    setEditingControl(null);
    const num = controles.length + 1;
    const codeStr = num < 10 ? `0${num}` : `${num}`;
    setFormData({
      codigo: `CTR-LAFT-${codeStr}`,
      descripcion: "",
      clase: "PREVENTIVO",
      pesoClase: 45,
      tipo: "SEMIAUTOMÁTICO",
      pesoTipo: 35,
      frecuencia: "PERMANENTE",
      pesoFrecuencia: 45,
      formalidad: "DODI",
      pesoFormalidad: 45,
      ponderacion: 43
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (control: CatalogControl) => {
    setEditingControl(control);
    setFormData({
      codigo: control.codigo,
      descripcion: control.descripcion,
      clase: control.clase,
      pesoClase: control.pesoClase,
      tipo: control.tipo,
      pesoTipo: control.pesoTipo,
      frecuencia: control.frecuencia,
      pesoFrecuencia: control.pesoFrecuencia,
      formalidad: control.formalidad,
      pesoFormalidad: control.pesoFormalidad,
      ponderacion: control.ponderacion
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar este control del catálogo?")) {
      const updated = controles.filter((c) => c.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingControl) {
      const updated = controles.map((c) =>
        c.id === editingControl.id ? { ...c, ...formData } : c
      );
      saveToStorage(updated);
    } else {
      const newControl: CatalogControl = {
        id: Date.now().toString(),
        ...formData
      };
      saveToStorage([...controles, newControl]);
    }
    setIsModalOpen(false);
  };

  const filteredControles = controles.filter(
    (c) =>
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Controles</h1>
          <p className="text-muted-foreground text-sm">Gestión del inventario central de controles LAFT.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-sm font-medium shadow-sm transition-colors"
        >
          <span className="text-lg font-bold">+</span> Nuevo Control
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar por código o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {/* Tabla Limpia Estándar */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b bg-muted/60 text-muted-foreground uppercase font-bold text-[11px] tracking-wider">
                <th className="p-3.5 w-32">Código</th>
                <th className="p-3.5 min-w-[300px]">Control / Descripción</th>
                <th className="p-3.5 text-center">Clase</th>
                <th className="p-3.5 text-center">Peso</th>
                <th className="p-3.5 text-center">Tipo</th>
                <th className="p-3.5 text-center">Peso</th>
                <th className="p-3.5 text-center">Frecuencia</th>
                <th className="p-3.5 text-center">Peso</th>
                <th className="p-3.5 text-center">Formalidad</th>
                <th className="p-3.5 text-center">Peso</th>
                <th className="p-3.5 text-center font-extrabold text-foreground bg-muted/30">Ponderación</th>
                <th className="p-3.5 text-center w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredControles.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-xs text-teal-800 dark:text-teal-400 whitespace-nowrap">
                    {item.codigo}
                  </td>
                  <td className="p-3.5 text-xs font-medium text-foreground leading-relaxed">
                    {item.descripcion}
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {item.clase}
                  </td>
                  <td className="p-3.5 text-center text-muted-foreground font-medium">
                    {item.pesoClase}%
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {item.tipo}
                  </td>
                  <td className="p-3.5 text-center text-muted-foreground font-medium">
                    {item.pesoTipo}%
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {item.frecuencia}
                  </td>
                  <td className="p-3.5 text-center text-muted-foreground font-medium">
                    {item.pesoFrecuencia}%
                  </td>
                  <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {item.formalidad}
                  </td>
                  <td className="p-3.5 text-center text-muted-foreground font-medium">
                    {item.pesoFormalidad}%
                  </td>
                  <td className="p-3.5 text-center font-bold text-sm text-teal-700 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/20">
                    {item.ponderacion}%
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 hover:text-teal-600 text-base transition-colors"
                        title="Editar Control"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:text-red-600 text-base transition-colors"
                        title="Eliminar Control"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Limpio Estándar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-background border rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-foreground">
                {editingControl ? `Editar Control: ${editingControl.codigo}` : "Nuevo Control"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-bold text-xl px-2"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-xs font-semibold mb-1 text-foreground">Descripción del Control *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Clase</label>
                  <input
                    type="text"
                    value={formData.clase}
                    onChange={(e) => setFormData({ ...formData, clase: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Peso Clase (%)</label>
                  <input
                    type="number"
                    value={formData.pesoClase}
                    onChange={(e) => setFormData({ ...formData, pesoClase: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Tipo / Ejecución</label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Peso Tipo (%)</label>
                  <input
                    type="number"
                    value={formData.pesoTipo}
                    onChange={(e) => setFormData({ ...formData, pesoTipo: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Frecuencia</label>
                  <input
                    type="text"
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Peso Frecuencia (%)</label>
                  <input
                    type="number"
                    value={formData.pesoFrecuencia}
                    onChange={(e) => setFormData({ ...formData, pesoFrecuencia: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Formalidad del Control</label>
                  <input
                    type="text"
                    value={formData.formalidad}
                    onChange={(e) => setFormData({ ...formData, formalidad: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">Peso Formalidad (%)</label>
                  <input
                    type="number"
                    value={formData.pesoFormalidad}
                    onChange={(e) => setFormData({ ...formData, pesoFormalidad: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Ponderación Total (%)</label>
                <input
                  type="number"
                  value={formData.ponderacion}
                  onChange={(e) => setFormData({ ...formData, ponderacion: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background font-bold text-teal-800"
                />
              </div>

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
                  Guardar Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}