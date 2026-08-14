import React, { useState, useEffect, useCallback } from "react";
import { FileText, Layers, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { RiesgoRow, RIESGOS_INICIALES, getNivelRiesgo, calcularMitigacionMultiple } from "./Matrix";
import { CONTROLES_OFICIALES, calcularPonderacion } from "./Controls";

// Tipos para los mapas
type ActiveTab = "riesgos" | "eventos";

// Matriz de colores 5x5 según Probabilidad (X: 1-5) e Impacto (Y: 5-1)
function getCellBgColor(prob: number, imp: number): string {
  const score = prob * imp;
  if (score <= 4) return "bg-emerald-500 text-white";
  if (score <= 9) return "bg-amber-400 text-slate-900";
  if (score <= 15) return "bg-orange-500 text-white";
  return "bg-rose-600 text-white";
}

function getCellBgColorPDF(prob: number, imp: number): string {
  const score = prob * imp;
  if (score <= 4) return "#10b981";
  if (score <= 9) return "#fbbf24";
  if (score <= 15) return "#f97316";
  return "#e11d48";
}

// Cargar Riesgos guardados en LocalStorage
const getRiesgosFromStorage = (): RiesgoRow[] => {
  try {
    const saved = localStorage.getItem("laft_matriz_riesgos_v3");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return RIESGOS_INICIALES;
};

// Cargar Eventos guardados en LocalStorage (Hoja de Eventos)
const getEventosFromStorage = (): any[] => {
  const possibleKeys = [
    "laft_eventos_v1",
    "laft_eventos",
    "laft_matriz_eventos",
    "laft_eventos_riesgos",
    "eventos_laft"
  ];

  for (const key of possibleKeys) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Búsqueda dinámica en LocalStorage si tiene otro nombre de clave
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.toLowerCase().includes("evento")) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
  }

  return [];
};

export default function Heatmap() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("riesgos");
  const [riesgos, setRiesgos] = useState<RiesgoRow[]>(getRiesgosFromStorage);
  const [eventos, setEventos] = useState<any[]>(getEventosFromStorage);

  // Cargar y actualizar datos en tiempo real
  const cargarDatos = useCallback(() => {
    setRiesgos(getRiesgosFromStorage());
    setEventos(getEventosFromStorage());
  }, []);

  useEffect(() => {
    cargarDatos();
    window.addEventListener("storage", cargarDatos);
    window.addEventListener("laft-data-updated", cargarDatos);
    window.addEventListener("focus", cargarDatos);

    return () => {
      window.removeEventListener("storage", cargarDatos);
      window.removeEventListener("laft-data-updated", cargarDatos);
      window.removeEventListener("focus", cargarDatos);
    };
  }, [cargarDatos]);

  // Mapeo de frecuencias 5x5
  const mapInherente: Record<string, number> = {};
  const mapResidual: Record<string, number> = {};
  const mapEventos: Record<string, number> = {};

  // 1. Calcular Perfil Inherente y Perfil Residual de los Riesgos
  riesgos.forEach((r) => {
    // Inherente
    const pInh = r.probabilidadInherente || 1;
    const iInh = r.impactoInherente || 1;
    const keyInh = `${pInh}-${iInh}`;
    mapInherente[keyInh] = (mapInherente[keyInh] || 0) + 1;

    // Residual (Post-controles)
    const itemCodigos = Array.isArray(r.controlCodigos) ? r.controlCodigos : [];
    const controlesAsignados = CONTROLES_OFICIALES.filter((c) => itemCodigos.includes(c.codigo));
    const ponderaciones = controlesAsignados.map((c) =>
      calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad)
    );
    const mitigacion = calcularMitigacionMultiple(ponderaciones);
    const inhScore = pInh * iInh;
    const resScore = Math.max(1, Math.round(inhScore * (1 - mitigacion / 100)));

    let pRes = Math.min(pInh, Math.max(1, Math.ceil(resScore / iInh)));
    let iRes = Math.min(iInh, Math.max(1, Math.round(resScore / pRes)));
    const keyRes = `${pRes}-${iRes}`;
    mapResidual[keyRes] = (mapResidual[keyRes] || 0) + 1;
  });

  // 2. Calcular Mapa de Eventos de Riesgo desde la Hoja de Eventos
  if (eventos.length > 0) {
    eventos.forEach((evt) => {
      // Buscar el código del riesgo relacionado
      const codRiesgo = (evt.codigoRiesgo || evt.riesgoCodigo || evt.riesgo || "").toString().replace("-", "").toUpperCase();
      const riesgoAsociado = riesgos.find(
        (r) => (r.codigo || "").toString().replace("-", "").toUpperCase() === codRiesgo
      );

      // Probabilidad e Impacto resultantes del evento u hoja de brechas
      let p = Number(evt.probabilidadResidual || evt.probabilidadEvento || evt.probabilidad || evt.p || 0);
      let i = Number(evt.impactoResidual || evt.impactoEvento || evt.impacto || evt.i || 0);

      // Si el evento no especifica coordenadas propias, usa el Perfil Residual del riesgo asociado
      if ((!p || !i) && riesgoAsociado) {
        const itemCodigos = Array.isArray(riesgoAsociado.controlCodigos) ? riesgoAsociado.controlCodigos : [];
        const controlesAsignados = CONTROLES_OFICIALES.filter((c) => itemCodigos.includes(c.codigo));
        const ponderaciones = controlesAsignados.map((c) =>
          calcularPonderacion(c.clase, c.tipo, c.frecuencia, c.formalidad)
        );
        const mitigacion = calcularMitigacionMultiple(ponderaciones);
        const pInh = riesgoAsociado.probabilidadInherente || 1;
        const iInh = riesgoAsociado.impactoInherente || 1;
        const inhScore = pInh * iInh;
        const resScore = Math.max(1, Math.round(inhScore * (1 - mitigacion / 100)));

        p = p || Math.min(pInh, Math.max(1, Math.ceil(resScore / iInh)));
        i = i || Math.min(iInh, Math.max(1, Math.round(resScore / p)));
      }

      p = Math.max(1, Math.min(5, p || 1));
      i = Math.max(1, Math.min(5, i || 1));

      const keyEv = `${p}-${i}`;
      mapEventos[keyEv] = (mapEventos[keyEv] || 0) + 1;
    });
  } else {
    // Si aún no hay registros en la Hoja de Eventos, tomar aproximación por defecto
    const riesgosConEventos = riesgos.slice(0, 2);
    riesgosConEventos.forEach((r) => {
      const p = Math.max(1, r.probabilidadInherente - 1);
      const i = r.impactoInherente;
      const keyEv = `${p}-${i}`;
      mapEventos[keyEv] = (mapEventos[keyEv] || 0) + 1;
    });
  }

  // Exportar PDF del Mapa de Calor
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const renderGridHTML = (dataMap: Record<string, number>, title: string) => {
      let gridHTML = `<div style="flex: 1; min-width: 320px; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1;">`;
      gridHTML += `<h3 style="margin-top: 0; font-size: 14px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">${title}</h3>`;
      gridHTML += `<table style="width: 100%; border-collapse: separate; border-spacing: 4px; margin-top: 10px;">`;

      for (let imp = 5; imp >= 1; imp--) {
        gridHTML += `<tr>`;
        gridHTML += `<td style="font-size: 9px; font-weight: bold; width: 20px; text-align: center; color: #64748b;">${imp}</td>`;
        for (let prob = 1; prob <= 5; prob++) {
          const key = `${prob}-${imp}`;
          const count = dataMap[key] || 0;
          const bg = getCellBgColorPDF(prob, imp);
          gridHTML += `
            <td style="background-color: ${bg}; height: 45px; width: 45px; border-radius: 6px; text-align: center; vertical-align: middle;">
              ${
                count > 0
                  ? `<span style="background: #ffffff; color: #0f172a; font-weight: bold; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">${count}</span>`
                  : ""
              }
            </td>
          `;
        }
        gridHTML += `</tr>`;
      }

      // Eje X
      gridHTML += `<tr><td></td>`;
      for (let prob = 1; prob <= 5; prob++) {
        gridHTML += `<td style="font-size: 8.5px; text-align: center; color: #64748b; font-weight: bold; padding-top: 4px;">${prob}</td>`;
      }
      gridHTML += `</tr></table></div>`;
      return gridHTML;
    };

    const titleGrid1 = activeTab === "riesgos" ? "Perfil Inherente — Riesgos" : "Perfil Residual — Riesgos";
    const titleGrid2 = activeTab === "riesgos" ? "Perfil Residual — Riesgos" : "Mapa de Eventos de Riesgo (Materializados)";
    const map1 = activeTab === "riesgos" ? mapInherente : mapResidual;
    const map2 = activeTab === "riesgos" ? mapResidual : mapEventos;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mapa de Calor de Riesgos LAFT / PADM</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 10px; background: #fff; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 15px; }
            h1 { font-size: 18px; margin: 0 0 4px 0; color: #0f172a; }
            p { font-size: 10px; color: #475569; margin: 0; }
            .grids-container { display: flex; gap: 20px; justify-content: space-between; margin-top: 15px; }
            .legend { display: flex; gap: 15px; margin-top: 20px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 9px; font-weight: bold; }
            .legend-item { display: flex; align-items: center; gap: 6px; }
            .box { width: 14px; height: 14px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Mapa de Calor de Riesgos LAFT / PADM</h1>
            <p>Reporte Oficial de Evaluación Visual de Perfiles de Riesgo y Eventos Materializados.</p>
          </div>

          <div class="grids-container">
            ${renderGridHTML(map1, titleGrid1)}
            ${renderGridHTML(map2, titleGrid2)}
          </div>

          <div class="legend">
            <div class="legend-item"><div class="box" style="background:#10b981;"></div> Riesgo Bajo (1 - 4)</div>
            <div class="legend-item"><div class="box" style="background:#fbbf24;"></div> Riesgo Medio (5 - 9)</div>
            <div class="legend-item"><div class="box" style="background:#f97316;"></div> Riesgo Alto (10 - 15)</div>
            <div class="legend-item"><div class="box" style="background:#e11d48;"></div> Riesgo Extremo (16 - 25)</div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const renderGrid = (dataMap: Record<string, number>, title: string) => {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
        <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
          {title}
        </h3>

        <div className="flex">
          {/* Eje Y: Impacto */}
          <div className="flex flex-col justify-between py-2 pr-2 text-[10px] font-bold text-slate-400 select-none">
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>

          {/* Grilla 5x5 */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((imp) => (
              <div key={imp} className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((prob) => {
                  const key = `${prob}-${imp}`;
                  const count = dataMap[key] || 0;
                  const colorClass = getCellBgColor(prob, imp);

                  return (
                    <div
                      key={prob}
                      className={`h-12 md:h-14 rounded-lg ${colorClass} flex items-center justify-center transition-all shadow-xs relative group`}
                    >
                      {count > 0 && (
                        <span className="w-6 h-6 rounded-full bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-md">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Eje X: Probabilidad */}
            <div className="grid grid-cols-5 gap-1.5 pt-1 text-center text-[10px] font-bold text-slate-400 select-none">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <div className="text-center text-[10px] font-extrabold tracking-wider text-slate-500 uppercase pt-1">
              PROBABILIDAD
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Superior */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mapa de Calor</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriz de evaluación gráfica $5 \times 5$ para la gestión del riesgo LAFT / PADM
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarDatos}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            Actualizar
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors border border-rose-300 shadow-xs"
          >
            <FileText className="w-4 h-4 text-rose-700" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="border-b border-slate-200 bg-white px-4 pt-2 rounded-xl shadow-xs flex gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("riesgos")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "riesgos"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Mapa de Riesgos
        </button>

        <button
          onClick={() => setActiveTab("eventos")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "eventos"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Mapa de Eventos de Riesgo
        </button>
      </div>

      {/* Vista de las dos Grillas */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Grilla 1 (Izquierda): Inherente en Tab Riesgos, Residual en Tab Eventos */}
        {activeTab === "riesgos"
          ? renderGrid(mapInherente, "Perfil Inherente — Riesgos")
          : renderGrid(mapResidual, "Perfil Residual — Riesgos")}

        {/* Grilla 2 (Derecha): Residual en Tab Riesgos, Eventos en Tab Eventos */}
        {activeTab === "riesgos"
          ? renderGrid(mapResidual, "Perfil Residual — Riesgos")
          : renderGrid(mapEventos, "Mapa de Eventos de Riesgo (Materializados)")}
      </div>
    </div>
  );
}