import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ShieldAlert, CheckCircle, AlertOctagon, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

// Claves posibles donde las pestañas de Matriz, Controles y Eventos pueden estar guardando información
const RIESGOS_KEYS = ["laft_riesgos_v1", "laft_riesgos", "matriz_riesgos", "riesgos"];
const CONTROLES_KEYS = ["laft_controles_v1", "laft_controles", "controles"];
const EVENTOS_KEYS = ["laft_eventos_v1", "laft_eventos", "eventos"];

const COLORS: Record<string, string> = {
  Aceptable: "#16a34a",
  Bajo: "#16a34a",
  Tolerable: "#f59e0b",
  Moderado: "#f97316",
  Alto: "#ea580c",
  Crítico: "#dc2626",
  Extremo: "#991b1b"
};

// Helper para obtener datos desde el localStorage probando múltiples claves probables
const getStoredData = (keys: string[]) => {
  for (const key of keys) {
    const item = localStorage.getItem(key);
    if (item) {
      try {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(`Error al parsear ${key}:`, e);
      }
    }
  }
  return [];
};

// Helper para normalizar texto (quita tildes, mayúsculas y espacios innecesarios)
const normalizeStr = (str: string) =>
  str
    ? str
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : "";

export default function Dashboard() {
  const [resumen, setResumen] = useState<{
    totalRiesgos: number;
    totalControles: number;
    controlesActivos: number;
    eventosPorEstado: { estado: string; count: number }[];
    riesgosPorPerfil: { perfil: string; count: number }[];
    riesgosPorProceso: { proceso: string; count: number }[];
  }>({
    totalRiesgos: 0,
    totalControles: 0,
    controlesActivos: 0,
    eventosPorEstado: [],
    riesgosPorPerfil: [],
    riesgosPorProceso: [],
  });

  const cargarDatos = useCallback(() => {
    // 1. Obtener datos reales guardados en localStorage
    const riesgos = getStoredData(RIESGOS_KEYS);
    const controles = getStoredData(CONTROLES_KEYS);
    const eventos = getStoredData(EVENTOS_KEYS);

    // --- Calcular Perfiles de Riesgo ---
    const perfilCounts: Record<string, number> = {};
    riesgos.forEach((r: any) => {
      const pRaw = r.perfilInherente || r.perfilResidual || r.perfil || "Tolerable";
      const p = pRaw.charAt(0).toUpperCase() + pRaw.slice(1).toLowerCase();
      perfilCounts[p] = (perfilCounts[p] || 0) + 1;
    });

    const riesgosPorPerfil = Object.entries(perfilCounts).map(([perfil, count]) => ({
      perfil,
      count
    }));

    // --- Calcular Procesos (con unificación inteligente de duplicados) ---
    const procesoMap: Record<string, { label: string; count: number }> = {};

    riesgos.forEach((r: any) => {
      const rawProc = (r.proceso || "Sin Clasificar").trim();
      const normKey = normalizeStr(rawProc);

      if (!normKey) return;

      if (procesoMap[normKey]) {
        procesoMap[normKey].count += 1;
      } else {
        // Formatear bonita la etiqueta visual manteniendo la ortografía limpia
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
      (c: any) => (c.estado || "ACTIVO").toUpperCase() === "ACTIVO"
    ).length;

    // --- Calcular Eventos por Estado ---
    const eventoCounts: Record<string, number> = {};
    eventos.forEach((e: any) => {
      const est = e.estado || "REGISTRADO";
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
      eventosPorEstado,
      riesgosPorPerfil,
      riesgosPorProceso
    });
  }, []);

  useEffect(() => {
    // Cargar datos inmediatamente al montar
    cargarDatos();

    // Eventos de escucha para reactividad instantánea
    window.addEventListener("storage", cargarDatos);
    window.addEventListener("laft-data-updated", cargarDatos);
    window.addEventListener("focus", cargarDatos);

    // Polling ligero cada 1.5 segundos
    const interval = setInterval(cargarDatos, 1500);

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
        <p className="text-muted-foreground text-sm mt-1">Resumen general de la matriz de riesgos LAFT</p>
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
            <div className="text-3xl font-bold">
              {resumen.eventosPorEstado.reduce((acc, curr) => acc + curr.count, 0)}
            </div>
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
              <div className="text-muted-foreground text-sm">No hay datos registrados en la Matriz</div>
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
                  No se encontraron riesgos asignados a procesos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}