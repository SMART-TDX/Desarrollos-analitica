import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ShieldAlert, AlertTriangle, Layers, Activity, RefreshCw } from "lucide-react";

// --- Definición de Matriz 5x5 de Colores LAFT ---
// Matriz de Severidad [Impacto][Probabilidad] (Valores de 1 a 5)
const MATRIX_COLORS: Record<string, string> = {
  // Y=5 (Impacto 5)
  "5-1": "bg-amber-400 text-amber-950",   // Tolerable
  "5-2": "bg-orange-500 text-white",       // Moderado
  "5-3": "bg-orange-500 text-white",       // Moderado
  "5-4": "bg-rose-600 text-white",         // Crítico
  "5-5": "bg-rose-700 text-white",         // Extremo

  // Y=4 (Impacto 4)
  "4-1": "bg-emerald-500 text-white",      // Aceptable
  "4-2": "bg-amber-400 text-amber-950",   // Tolerable
  "4-3": "bg-orange-500 text-white",       // Moderado
  "4-4": "bg-rose-600 text-white",         // Crítico
  "4-5": "bg-rose-700 text-white",         // Extremo

  // Y=3 (Impacto 3)
  "3-1": "bg-emerald-500 text-white",      // Aceptable
  "3-2": "bg-amber-400 text-amber-950",   // Tolerable
  "3-3": "bg-amber-400 text-amber-950",   // Tolerable
  "3-4": "bg-orange-500 text-white",       // Moderado
  "3-5": "bg-orange-500 text-white",       // Moderado

  // Y=2 (Impacto 2)
  "2-1": "bg-emerald-500 text-white",      // Aceptable
  "2-2": "bg-emerald-500 text-white",      // Aceptable
  "2-3": "bg-amber-400 text-amber-950",   // Tolerable
  "2-4": "bg-amber-400 text-amber-950",   // Tolerable
  "2-5": "bg-orange-500 text-white",       // Moderado

  // Y=1 (Impacto 1)
  "1-1": "bg-emerald-500 text-white",      // Aceptable
  "1-2": "bg-emerald-500 text-white",      // Aceptable
  "1-3": "bg-emerald-500 text-white",      // Aceptable
  "1-4": "bg-emerald-500 text-white",      // Aceptable
  "1-5": "bg-amber-400 text-amber-950",   // Tolerable
};

// Escáner dinámico para obtener datos de memoria
const getRealStorageData = () => {
  let riesgos: any[] = [];
  let eventos: any[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const sample = parsed[0];
        if (!sample || typeof sample !== "object") continue;

        const keyLower = key.toLowerCase();

        // Obtener Riesgos de la Matriz principal
        if (
          keyLower.includes("riesgo") ||
          keyLower.includes("matrix") ||
          keyLower.includes("matriz") ||
          sample.codigo?.toString().toUpperCase().startsWith("R-")
        ) {
          if (parsed.length > riesgos.length) riesgos = parsed;
        }

        // Obtener Hoja de Eventos
        if (
          keyLower.includes("evento") ||
          sample.codigo?.toString().toUpperCase().startsWith("EVE") ||
          sample.codigo?.toString().toUpperCase().startsWith("EVENT")
        ) {
          if (parsed.length > eventos.length) eventos = parsed;
        }
      }
    } catch (e) {}
  }

  return { riesgos, eventos };
};

export default function Heatmap() {
  const [activeTab, setActiveTab] = useState<"riesgos" | "eventos">("riesgos");
  const [dataRiesgos, setDataRiesgos] = useState<any[]>([]);
  const [dataEventos, setDataEventos] = useState<any[]>([]);

  const cargarDatos = useCallback(() => {
    const { riesgos, eventos } = getRealStorageData();
    setDataRiesgos(riesgos);
    setDataEventos(eventos);
  }, []);

  useEffect(() => {
    cargarDatos();
    window.addEventListener("storage", cargarDatos);
    window.addEventListener("laft-data-updated", cargarDatos);
    const interval = setInterval(cargarDatos, 1000);

    return () => {
      window.removeEventListener("storage", cargarDatos);
      window.removeEventListener("laft-data-updated", cargarDatos);
      clearInterval(interval);
    };
  }, [cargarDatos]);

  // --- Mapeo Matriz 1: Riesgos (Perfil Inherente) ---
  const mapRiesgosInherente: Record<string, any[]> = {};
  dataRiesgos.forEach(r => {
    const prob = Number(r.probabilidadInherente || r.probabilidad || 3);
    const imp = Number(r.impactoInherente || r.impacto || 3);
    const cellKey = `${imp}-${prob}`;
    if (!mapRiesgosInherente[cellKey]) mapRiesgosInherente[cellKey] = [];
    mapRiesgosInherente[cellKey].push(r);
  });

  // --- Mapeo Matriz 2: Eventos de Riesgo (BASADO EN PERFIL RESIDUAL + CONTROLES DE HOJA DE EVENTOS) ---
  const mapEventosResidual: Record<string, any[]> = {};

  dataEventos.forEach(evt => {
    // 1. Buscar el riesgo asociado en la matriz principal por código (ej: R-LAFT003, R-LAFT-003)
    const codigoRiesgoRel = (evt.codigoRiesgo || evt.riesgoCodigo || evt.riesgo || "").toString().replace("-", "").toUpperCase();
    
    const riesgoAsociado = dataRiesgos.find(r => 
      (r.codigo || "").toString().replace("-", "").toUpperCase() === codigoRiesgoRel
    );

    // 2. Determinar la Probabilidad y el Impacto RESIDUAL de partida desde la primera pestaña (Matriz de Riesgos)
    let probResidual = riesgoAsociado 
      ? Number(riesgoAsociado.probabilidadResidual || riesgoAsociado.pResidual || riesgoAsociado.probabilidad || 2)
      : Number(evt.probabilidadResidual || evt.probabilidad || 2);

    let impResidual = riesgoAsociado 
      ? Number(riesgoAsociado.impactoResidual || riesgoAsociado.iResidual || riesgoAsociado.impacto || 3)
      : Number(evt.impactoResidual || evt.impacto || 3);

    // 3. Si el evento especifica un ajuste por brecha/evaluación propia en la hoja de eventos, se aplica
    if (evt.probabilidadEvento) probResidual = Number(evt.probabilidadEvento);
    if (evt.impactoEvento) impResidual = Number(evt.impactoEvento);

    // Asegurar rango [1..5]
    probResidual = Math.max(1, Math.min(5, probResidual));
    impResidual = Math.max(1, Math.min(5, impResidual));

    const cellKey = `${impResidual}-${probResidual}`;
    if (!mapEventosResidual[cellKey]) mapEventosResidual[cellKey] = [];
    mapEventosResidual[cellKey].push({
      ...evt,
      riesgoRelacionado: riesgoAsociado,
      pRes: probResidual,
      iRes: impResidual
    });
  });

  const renderGrid = (cellDataMap: Record<string, any[]>) => {
    const rows = [5, 4, 3, 2, 1]; // Impacto (Y)
    const cols = [1, 2, 3, 4, 5]; // Probabilidad (X)

    return (
      <div className="relative w-full max-w-2xl mx-auto p-4 bg-card rounded-xl border shadow-sm">
        <div className="flex">
          {/* Eje Y - Impacto */}
          <div className="flex flex-col justify-between pr-3 py-2 text-xs font-semibold text-muted-foreground w-6">
            {rows.map(r => (
              <span key={`y-${r}`} className="h-16 flex items-center justify-center">
                {r}
              </span>
            ))}
          </div>

          {/* Grilla 5x5 */}
          <div className="flex-1 grid grid-rows-5 gap-2">
            {rows.map(imp => (
              <div key={`row-${imp}`} className="grid grid-cols-5 gap-2 h-16">
                {cols.map(prob => {
                  const key = `${imp}-${prob}`;
                  const itemsInCell = cellDataMap[key] || [];
                  const colorClass = MATRIX_COLORS[key] || "bg-gray-200";

                  return (
                    <div
                      key={key}
                      className={`relative rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm font-bold text-base ${colorClass}`}
                      title={`Impacto: ${imp}, Probabilidad: ${prob} (${itemsInCell.length} elementos)`}
                    >
                      {itemsInCell.length > 0 && (
                        <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-md border font-extrabold text-sm animate-in zoom-in-50">
                          {itemsInCell.length}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Eje X - Probabilidad */}
        <div className="flex pl-9 pt-3 text-xs font-semibold text-muted-foreground">
          <div className="flex-1 grid grid-cols-5 gap-2 text-center">
            {cols.map(c => (
              <span key={`x-${c}`}>{c}</span>
            ))}
          </div>
        </div>

        <div className="text-center mt-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Probabilidad
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mapa de Calor Sagrlaft</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualización gráfica de evaluación de riesgos y eventos de riesgo materializados
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualizar
        </button>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex gap-2 border-b mb-6 pb-2">
        <button
          onClick={() => setActiveTab("riesgos")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "riesgos"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Perfil Inherente — Riesgos
        </button>

        <button
          onClick={() => setActiveTab("eventos")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === "eventos"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Activity className="h-4 w-4" />
          Mapa de Eventos de Riesgo (Basado en Perfil Residual + Controles/Brechas)
        </button>
      </div>

      {/* Contenido según Pestaña Selección */}
      {activeTab === "riesgos" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Perfil Inherente — Riesgos (Matriz Inicial)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderGrid(mapRiesgosInherente)}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Mapa de Eventos de Riesgo (Materializados / Brechas)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              * Toma como punto de partida el <strong>Perfil Residual</strong> de la primera pestaña (post-controles) y reubica cada evento según sus brechas y controles asociados en la Hoja de Eventos.
            </p>
          </CardHeader>
          <CardContent>
            {renderGrid(mapEventosResidual)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}