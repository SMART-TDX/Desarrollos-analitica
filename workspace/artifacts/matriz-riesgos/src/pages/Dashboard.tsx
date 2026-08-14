import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ShieldAlert, CheckCircle, AlertOctagon, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const COLORS: Record<string, string> = {
  Aceptable: "#16a34a",
  Bajo: "#16a34a",
  Tolerable: "#f59e0b",
  Moderado: "#f97316",
  Alto: "#ea580c",
  Crítico: "#dc2626",
  Extremo: "#991b1b"
};

// Helper para normalizar texto (eliminar diferencias de mayúsculas y tildes)
const normalizeStr = (str: string) =>
  str
    ? str
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : "";

// Escáner dinámico e inteligente de LocalStorage
const autoDetectLocalStorageData = () => {
  let riesgos: any[] = [];
  let controles: any[] = [];
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

        // Detectar si es la lista de RIESGOS (ej. R-LAFT-001)
        if (
          keyLower.includes("riesgo") ||
          keyLower.includes("matrix") ||
          keyLower.includes("matriz") ||
          sample.codigo?.toString().toUpperCase().startsWith("R-") ||
          sample.codigo?.toString().toUpperCase().startsWith("RIE") ||
          "perfilResidual" in sample ||
          "perfilInherente" in sample ||
          ("proceso" in sample && ("mitigacion" in sample || "consecuencia" in sample))
        ) {
          if (parsed.length > riesgos.length) riesgos = parsed;
        }

        // Detectar si es la lista de CONTROLES (ej. CTR-LAFT-026)
        if (
          keyLower.includes("control") ||
          sample.codigo?.toString().toUpperCase().startsWith("CTR") ||
          "mecanismo" in sample ||
          "frecuencia" in sample ||
          "diseno" in sample
        ) {
          if (parsed.length > controles.length) controles = parsed;
        }

        // Detectar si es la lista de EVENTOS (ej. EVENTO-1)
        if (
          keyLower.includes("evento") ||
          sample.codigo?.toString().toUpperCase().startsWith("EVE") ||
          sample.codigo?.toString().toUpperCase().startsWith("EVENTO") ||
          sample.id?.toString().toUpperCase().startsWith("EVENTO") ||
          "factor" in sample ||
          "probabilidad" in sample
        ) {
          if (parsed.length > eventos.length) eventos = parsed;
        }
      }
    } catch (e) {
      // Ignorar valores que no sean JSON válido
    }
  }

  return { riesgos, controles, eventos };
};

export default function Dashboard() {
  const [resumen, setResumen] = useState<{
    totalRiesgos: number;
    totalControles: number;
    controlesActivos: number;
    totalEventos: number;
    eventosPorEstado: { estado: string; count: number }[];
    riesgosPorPerfil: { perfil: string; count: number }[];
    riesgosPorProceso: { proceso: string; count: number }[];
  }>({
    totalRiesgos: 0,
    totalControles: 0,
    controlesActivos: 0,
    totalEventos: 0,
    eventosPorEstado: [],
    riesgosPorPerfil: [],
    riesgosPorProceso: [],
  });

  const cargarDatos = useCallback(() => {
    // 1. Escanear datos reales guardados
    const { riesgos, controles, eventos } = autoDetectLocalStorageData();

    // --- Agrupar Riesgos por Perfil ---
    const perfilCounts: Record<string, number> = {};
    riesgos.forEach((r: any) => {
      const pRaw = r.perfilResidual || r.perfilInherente || r.perfil || "Tolerable";
      const p = pRaw.charAt(0).toUpperCase() + pRaw.slice(1).toLowerCase();
      perfilCounts[p] = (perfilCounts[p] || 0) + 1;
    });

    const riesgosPorPerfil = Object.entries(perfilCounts).map(([perfil, count]) => ({
      perfil,
      count
    }));

    // --- Agrupar Riesgos por Proceso ---
    const procesoMap: Record<string, { label: string; count: number }> = {};

    riesgos.forEach((r: any) => {
      const rawProc = (r.proceso || "Sin Clasificar").trim();
      const normKey = normalizeStr(rawProc);

      if (!normKey) return;

      if (procesoMap[normKey]) {
        procesoMap[normKey].count += 1;
      } else {
        const formattedLabel = rawProc
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, m => m.toUpperCase())
          .replace(/\bY\b/g, "y")
          .replace(/\bDe\b/g, "de");

        procesoMap[normKey] = {
          label: formattedLabel,
          count: 1
        };
      }
    });

    const riesgosPorProceso = Object.values(procesoMap).map(item => ({
      proceso: item.label,
      count: item.count
    }));

    // --- Calcular Controles Activos ---
    const controlesActivos = controles.filter(
      (c: any) => (c.estado || "ACTIVO").toString().toUpperCase() === "ACTIVO"
    ).length;

    // --- Eventos ---
    const eventoCounts: Record<string, number> = {};
    eventos.forEach((e: any) => {
      const est = e.estado || e.nivelRiesgo || "REGISTRADO";
      eventoCounts[est] = (eventoCounts[est] || 0) + 1;
    });

    const eventosPorEstado = Object.entries(eventoCounts).map(([estado, count]) => ({
      estado,
      count
    }));

    setResumen({
      totalRiesgos: riesgos.length,
      totalControles: controles.length,
      controlesActivos,
      totalEventos: eventos.length,
      eventosPorEstado,
      riesgosPorPerfil,
      riesgosPorProceso
    });
  }, []);

  useEffect(() => {
    cargarDatos();

    // Eventos de escucha en tiempo real
    window.addEventListener("storage", cargarDatos);
    window.addEventListener("laft-data-updated", cargarDatos);
    window.addEventListener("focus", cargarDatos);

    // Sondeo rápido cada segundo
    const interval = setInterval(cargarDatos, 1000);

    return () => {
      window.removeEventListener("storage", cargarDatos);
      window.removeEventListener("laft-data-updated", cargarDatos);
      window.removeEventListener("focus", cargarDatos);
      clearInterval(interval);
    };
  }, [cargarDatos]);

  const pieData = resumen.riesgosPorPerfil.map(item => ({
    name: item.perfil,
    value: item.count,
    color: COLORS[item.perfil] || "#64748b"
  }));

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Consolidado</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen general en tiempo real de la matriz de riesgos LAFT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Riesgos</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resumen.totalRiesgos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Controles</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resumen.totalControles}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {resumen.controlesActivos} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Registrados</CardTitle>
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resumen.totalEventos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nivel Crítico/Extremo</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {resumen.riesgosPorPerfil
                .filter(r => ["Crítico", "Extremo", "Alto"].includes(r.perfil))
                .reduce((acc, curr) => acc + curr.count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgos por Perfil Residual</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-sm">No hay riesgos registrados</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riesgos por Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumen.riesgosPorProceso.map(rp => (
                <div key={rp.proceso} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{rp.proceso}</span>
                  </div>
                  <Badge variant="secondary">{rp.count}</Badge>
                </div>
              ))}
              {resumen.riesgosPorProceso.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No hay datos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}