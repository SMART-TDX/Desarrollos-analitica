import { useState } from "react";
import { useGetMapaCalor, getGetMapaCalorQueryKey } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API = `${BASE_URL}/api`;

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

type HeatItem = {
  riesgoId?: number;
  eventoId?: number;
  codigo: string;
  descripcion: string;
  probabilidad: number;
  impacto: number;
  perfil: string;
  riesgoId2?: number;
  codigoRiesgo?: string;
};

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
                  <span className="text-primary">{it.codigo}</span>{" "}
                  <span className="text-muted-foreground">{it.descripcion.slice(0, 70)}…</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Custom hook for eventos heat map (not in generated client yet)
function useEventosMapaCalor() {
  const [data, setData] = useState<{ inherente: HeatItem[]; residual: HeatItem[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch_ = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/dashboard/mapa-calor-eventos`);
      if (res.ok) setData(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, refetch: fetch_ };
}

export default function HeatMap() {
  const [activeMap, setActiveMap] = useState<"riesgos" | "eventos">("riesgos");

  const { data: riesgosData, isLoading: riesgosLoading } = useGetMapaCalor({
    query: { queryKey: getGetMapaCalorQueryKey() },
  });

  const [eventosData, setEventosData] = useState<{ inherente: HeatItem[]; residual: HeatItem[] } | null>(null);
  const [eventosLoading, setEventosLoading] = useState(false);
  const [eventosLoaded, setEventosLoaded] = useState(false);

  const loadEventos = async () => {
    if (eventosLoaded) return;
    setEventosLoading(true);
    try {
      const res = await fetch(`${API}/dashboard/mapa-calor-eventos`);
      if (res.ok) setEventosData(await res.json());
      setEventosLoaded(true);
    } finally {
      setEventosLoading(false);
    }
  };

  const handleTabChange = (tab: "riesgos" | "eventos") => {
    setActiveMap(tab);
    if (tab === "eventos") loadEventos();
  };

  const isLoading = activeMap === "riesgos" ? riesgosLoading : eventosLoading;

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
            onClick={() => handleTabChange("riesgos")}
          >
            Mapa de Riesgos
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeMap === "eventos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => handleTabChange("eventos")}
          >
            Mapa de Eventos de Riesgo
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Generando mapas de calor...</div>
        ) : activeMap === "riesgos" ? (
          riesgosData && (
            <div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <HeatGrid
                  data={riesgosData.inherente as HeatItem[]}
                  title="Perfil Inherente — Riesgos"
                  probLabels={RIESGO_PROB_LABELS}
                  emptyMessage="Sin riesgos configurados"
                />
                <HeatGrid
                  data={riesgosData.residual as HeatItem[]}
                  title="Perfil Residual — Riesgos"
                  probLabels={RIESGO_PROB_LABELS}
                  emptyMessage="Sin riesgos configurados"
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                <strong>Escala de Probabilidad:</strong> 1=Raro · 2=Poco probable · 3=Posible · 4=Probable · 5=Casi con certeza
              </div>
            </div>
          )
        ) : (
          eventosData && (
            <div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <HeatGrid
                  data={eventosData.inherente}
                  title="Perfil Inherente — Eventos de Riesgo"
                  probLabels={EVENTO_PROB_LABELS}
                  emptyMessage="Sin eventos registrados. Añada eventos en la sección Eventos."
                />
                <HeatGrid
                  data={eventosData.residual}
                  title="Perfil Residual — Eventos de Riesgo"
                  probLabels={EVENTO_PROB_LABELS}
                  emptyMessage="Sin eventos con calificación residual."
                />
              </div>
              <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                <strong>Escala de Probabilidad:</strong> 1=Raro · 2=Improbable · 3=Posible · 4=Probable · 5=Casi certeza
              </div>
            </div>
          )
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
