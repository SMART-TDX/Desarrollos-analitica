import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RIESGOS_KEY = "laft_riesgos_v1";
const EVENTOS_KEY = "laft_eventos_v1";

const DEFAULT_RIESGOS = [
  {
    id: "1",
    codigo: "R-LAFT001",
    descripcion: "Infiltración de recursos de origen ilícito a través de nuevos clientes.",
    probabilidadInherente: 2,
    impactoInherente: 3,
    perfilInherente: "TOLERABLE",
    probabilidadResidual: 1,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE"
  },
  {
    id: "2",
    codigo: "R-LAFT002",
    descripcion: "Pago a proveedores no verificados en listas restrictivas.",
    probabilidadInherente: 3,
    impactoInherente: 4,
    perfilInherente: "MODERADO",
    probabilidadResidual: 2,
    impactoResidual: 3,
    perfilResidual: "TOLERABLE"
  }
];

const DEFAULT_EVENTOS = [
  {
    id: "1",
    codigo: "E-LAFT001",
    descripcion: "Transacción inusual detectada en canal digital no reportada a tiempo.",
    probabilidad: 3,
    impacto: 3,
    perfil: "TOLERABLE",
    probabilidadResidual: 2,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE"
  }
];

type HeatItem = {
  riesgoId?: number | string;
  eventoId?: number | string;
  codigo: string;
  descripcion: string;
  probabilidad: number;
  impacto: number;
  perfil: string;
};

// Zone color by prob x impact score
function zoneColor(prob: number, impact: number): string {
  const s = prob * impact;
  if (s <= 4) return "bg-green-500";
  if (s <= 9) return "bg-yellow-400";
  if (s <= 14) return "bg-orange-500";
  if (s <= 19) return "bg-red-500";
  return "bg-red-700";
}

function zoneLabel(prob: number, impact: number): string {
  const s = prob * impact;
  if (s <= 4) return "ACEPTABLE";
  if (s <= 9) return "TOLERABLE";
  if (s <= 14) return "MODERADO";
  if (s <= 19) return "ALTO";
  return "CRITICO";
}

const RIESGO_PROB_LABELS: Record<number, string> = {
  1: "Raro", 2: "Poco probable", 3: "Posible", 4: "Probable", 5: "Casi con certeza",
};
const EVENTO_PROB_LABELS: Record<number, string> = {
  1: "Raro", 2: "Improbable", 3: "Posible", 4: "Probable", 5: "Casi certeza",
};

function HeatGrid({
  data,
  title,
  probLabels,
  emptyMessage = "Sin datos",
}: {
  data: HeatItem[];
  title: string;
  probLabels: Record<number, string>;
  emptyMessage?: string;
}) {
  const [tooltip, setTooltip] = useState<{ items: HeatItem[]; prob: number; impact: number } | null>(null);

  const cellItems = (prob: number, impact: number) =>
    data.filter((d) => Math.round(d.probabilidad) === prob && Math.round(d.impacto) === impact);

  return (
    <Card className="flex flex-col relative">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center pb-6 pt-0">
        <div className="flex items-start gap-2">
          {/* Y-axis label */}
          <div className="flex flex-col items-center justify-center mr-1" style={{ height: 320 }}>
            <span className="text-xs font-semibold text-muted-foreground tracking-widest" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              IMPACTO
            </span>
          </div>

          <div>
            {/* Y-axis numbers + grid */}
            <div className="flex gap-1">
              <div className="flex flex-col justify-between pr-1 text-xs font-medium text-muted-foreground" style={{ height: 320 }}>
                {[5, 4, 3, 2, 1].map((i) => (
                  <span key={i} className="flex items-center justify-end h-[60px]">{i}</span>
                ))}
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(5, 60px)", gridTemplateRows: "repeat(5, 60px)" }}>
                {[5, 4, 3, 2, 1].map((impact) =>
                  [1, 2, 3, 4, 5].map((prob) => {
                    const items = cellItems(prob, impact);
                    const color = zoneColor(prob, impact);
                    return (
                      <div
                        key={`${impact}-${prob}`}
                        className={`${color} bg-opacity-80 rounded flex items-center justify-center flex-wrap gap-0.5 p-1 cursor-pointer hover:ring-2 hover:ring-white/60 hover:scale-105 transition-transform relative`}
                        onMouseEnter={() => items.length > 0 && setTooltip({ items, prob, impact })}
                        onMouseLeave={() => setTooltip(null)}
                        title={`Prob: ${prob} (${probLabels[prob]}), Imp: ${impact} | ${zoneLabel(prob, impact)} | ${items.length} elemento(s)`}
                      >
                        {items.length > 0 && (
                          <div className="w-7 h-7 rounded-full bg-white/90 text-black font-bold text-xs flex items-center justify-center shadow-md z-10">
                            {items.length}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* X-axis numbers */}
            <div className="flex gap-1 mt-1 pl-6">
              {[1, 2, 3, 4, 5].map((p) => (
                <div key={p} className="text-xs font-medium text-muted-foreground text-center" style={{ width: 60 }}>{p}</div>
              ))}
            </div>

            {/* X-axis label */}
            <div className="text-center mt-1">
              <span className="text-xs font-semibold text-muted-foreground tracking-widest">PROBABILIDAD</span>
            </div>

            {/* Prob labels below */}
            <div className="flex gap-1 mt-1 pl-6">
              {[1, 2, 3, 4, 5].map((p) => (
                <div key={p} className="text-[10px] text-muted-foreground text-center leading-tight" style={{ width: 60 }}>
                  {probLabels[p]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {data.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground italic">{emptyMessage}</p>
        )}

        {/* Tooltip panel */}
        {tooltip && (
          <div className="mt-4 w-full border rounded-md bg-muted/40 p-3 text-xs">
            <p className="font-semibold mb-1">
              Prob {tooltip.prob} × Imp {tooltip.impact} = {tooltip.prob * tooltip.impact} — {zoneLabel(tooltip.prob, tooltip.impact)}
            </p>
            <ul className="space-y-0.5">
              {tooltip.items.map((it, idx) => (
                <li key={idx} className="font-mono truncate">
                  <span className="text-primary font-bold mr-1">{it.codigo}:</span>
                  <span className="text-muted-foreground">{it.descripcion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HeatMap() {
  const [activeMap, setActiveMap] = useState<"riesgos" | "eventos">("riesgos");
  const [riesgosMap, setRiesgosMap] = useState<{ inherente: HeatItem[]; residual: HeatItem[] }>({ inherente: [], residual: [] });
  const [eventosMap, setEventosMap] = useState<{ inherente: HeatItem[]; residual: HeatItem[] }>({ inherente: [], residual: [] });

  useEffect(() => {
    // 1. Cargar Riesgos desde localStorage
    let rawRiesgos = [];
    try {
      const saved = localStorage.getItem(RIESGOS_KEY);
      rawRiesgos = saved ? JSON.parse(saved) : DEFAULT_RIESGOS;
      if (!Array.isArray(rawRiesgos) || rawRiesgos.length === 0) {
        rawRiesgos = DEFAULT_RIESGOS;
        localStorage.setItem(RIESGOS_KEY, JSON.stringify(DEFAULT_RIESGOS));
      }
    } catch {
      rawRiesgos = DEFAULT_RIESGOS;
    }

    const riesgosInherentes: HeatItem[] = rawRiesgos.map((r: any) => ({
      codigo: r.codigo || "R-LAFT",
      descripcion: r.descripcion || "",
      probabilidad: Number(r.probabilidadInherente || 1),
      impacto: Number(r.impactoInherente || 1),
      perfil: r.perfilInherente || "ACEPTABLE",
    }));

    const riesgosResiduales: HeatItem[] = rawRiesgos.map((r: any) => ({
      codigo: r.codigo || "R-LAFT",
      descripcion: r.descripcion || "",
      probabilidad: Number(r.probabilidadResidual || 1),
      impacto: Number(r.impactoResidual || 1),
      perfil: r.perfilResidual || "ACEPTABLE",
    }));

    setRiesgosMap({ inherente: riesgosInherentes, residual: riesgosResiduales });

    // 2. Cargar Eventos desde localStorage
    let rawEventos = [];
    try {
      const saved = localStorage.getItem(EVENTOS_KEY);
      rawEventos = saved ? JSON.parse(saved) : DEFAULT_EVENTOS;
      if (!Array.isArray(rawEventos) || rawEventos.length === 0) {
        rawEventos = DEFAULT_EVENTOS;
        localStorage.setItem(EVENTOS_KEY, JSON.stringify(DEFAULT_EVENTOS));
      }
    } catch {
      rawEventos = DEFAULT_EVENTOS;
    }

    const eventosInherentes: HeatItem[] = rawEventos.map((e: any) => ({
      codigo: e.codigo || "E-LAFT",
      descripcion: e.descripcion || "",
      probabilidad: Number(e.probabilidad || e.probabilidadInherente || 1),
      impacto: Number(e.impacto || e.impactoInherente || 1),
      perfil: e.perfil || e.perfilInherente || "ACEPTABLE",
    }));

    const eventosResiduales: HeatItem[] = rawEventos.map((e: any) => ({
      codigo: e.codigo || "E-LAFT",
      descripcion: e.descripcion || "",
      probabilidad: Number(e.probabilidadResidual || e.probabilidad || 1),
      impacto: Number(e.impactoResidual || e.impacto || 1),
      perfil: e.perfilResidual || e.perfil || "ACEPTABLE",
    }));

    setEventosMap({ inherente: eventosInherentes, residual: eventosResiduales });
  }, []);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="flex-none p-6 border-b pb-0">
        <h1 className="text-2xl font-bold text-foreground mb-1">Mapas de Calor LAFT</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Distribución de riesgos y eventos en zonas de criticidad inherente y residual.
        </p>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeMap === "riesgos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveMap("riesgos")}
          >
            Mapa de Riesgos
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeMap === "eventos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveMap("eventos")}
          >
            Mapa de Eventos de Riesgo
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeMap === "riesgos" ? (
          <div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <HeatGrid
                data={riesgosMap.inherente}
                title="Perfil Inherente — Riesgos"
                probLabels={RIESGO_PROB_LABELS}
                emptyMessage="Sin riesgos configurados"
              />
              <HeatGrid
                data={riesgosMap.residual}
                title="Perfil Residual — Riesgos"
                probLabels={RIESGO_PROB_LABELS}
                emptyMessage="Sin riesgos configurados"
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
              <strong>Escala de Probabilidad:</strong> 1=Raro · 2=Poco probable · 3=Posible · 4=Probable · 5=Casi con certeza
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <HeatGrid
                data={eventosMap.inherente}
                title="Perfil Inherente — Eventos de Riesgo"
                probLabels={EVENTO_PROB_LABELS}
                emptyMessage="Sin eventos registrados."
              />
              <HeatGrid
                data={eventosMap.residual}
                title="Perfil Residual — Eventos de Riesgo"
                probLabels={EVENTO_PROB_LABELS}
                emptyMessage="Sin eventos con calificación residual."
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
              <strong>Escala de Probabilidad:</strong> 1=Raro · 2=Improbable · 3=Posible · 4=Probable · 5=Casi certeza
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 p-4 rounded-lg bg-card border justify-center flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium"><div className="w-4 h-4 rounded bg-green-500"></div> Aceptable (1–4)</div>
          <div className="flex items-center gap-2 text-sm font-medium"><div className="w-4 h-4 rounded bg-yellow-400"></div> Tolerable (5–9)</div>
          <div className="flex items-center gap-2 text-sm font-medium"><div className="w-4 h-4 rounded bg-orange-500"></div> Moderado (10–14)</div>
          <div className="flex items-center gap-2 text-sm font-medium"><div className="w-4 h-4 rounded bg-red-500"></div> Alto (15–19)</div>
          <div className="flex items-center gap-2 text-sm font-medium"><div className="w-4 h-4 rounded bg-red-700"></div> Crítico (20–25)</div>
        </div>
      </div>
    </div>
  );
}