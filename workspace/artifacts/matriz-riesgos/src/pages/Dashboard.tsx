import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ShieldAlert, CheckCircle, AlertOctagon, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const RIESGOS_KEY = "laft_riesgos_v1";
const CONTROLES_KEY = "laft_controles_v1";
const EVENTOS_KEY = "laft_eventos_v1";

const DEFAULT_RIESGOS = [
  { id: 1, codigo: "R-LAFT001", proceso: "Gestión Comercial", perfilInherente: "TOLERABLE" },
  { id: 2, codigo: "R-LAFT002", proceso: "GESTION ADMINISTRATIVA Y FINANCIERA", perfilInherente: "MODERADO" },
  { id: 3, codigo: "R-LAFT003", proceso: "Gestión Comercial", perfilInherente: "MODERADO" },
  { id: 4, codigo: "R-LAFT004", proceso: "GESTION ADMINISTRATIVA Y FINANCIERA", perfilInherente: "TOLERABLE" },
  { id: 5, codigo: "R-LAFT005", proceso: "GESTION ADMINISTRATIVA Y FINANCIERA", perfilInherente: "MODERADO" },
];

const DEFAULT_CONTROLES = [
  { id: 1, codigo: "CTR-LAFT-01", estado: "ACTIVO" },
  { id: 2, codigo: "CTR-LAFT-02", estado: "ACTIVO" },
  { id: 3, codigo: "CTR-LAFT-03", estado: "ACTIVO" },
  { id: 4, codigo: "CTR-LAFT-04", estado: "ACTIVO" },
  { id: 5, codigo: "CTR-LAFT-05", estado: "ACTIVO" },
];

const COLORS: Record<string, string> = {
  Aceptable: "#16a34a",
  Bajo: "#16a34a",
  Tolerable: "#f59e0b",
  Moderado: "#f97316",
  Alto: "#ea580c",
  Crítico: "#dc2626",
  Extremo: "#991b1b"
};

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

  useEffect(() => {
    // 1. Obtener Riesgos
    const savedRiesgos = localStorage.getItem(RIESGOS_KEY);
    let riesgos = savedRiesgos ? JSON.parse(savedRiesgos) : [];
    if (!Array.isArray(riesgos) || riesgos.length === 0) {
      riesgos = DEFAULT_RIESGOS;
    }

    // 2. Obtener Controles
    const savedControles = localStorage.getItem(CONTROLES_KEY);
    let controles = savedControles ? JSON.parse(savedControles) : [];
    if (!Array.isArray(controles) || controles.length === 0) {
      controles = DEFAULT_CONTROLES;
    }

    // 3. Obtener Eventos
    const savedEventos = localStorage.getItem(EVENTOS_KEY);
    const eventos = savedEventos ? JSON.parse(savedEventos) : [];

    // --- Calcular Perfiles ---
    const perfilCounts: Record<string, number> = {};
    riesgos.forEach((r: any) => {
      const pRaw = r.perfilInherente || r.perfilResidual || r.perfil || "Tolerable";
      // Capitalizar palabra (ej. "MODERADO" -> "Moderado")
      const p = pRaw.charAt(0).toUpperCase() + pRaw.slice(1).toLowerCase();
      perfilCounts[p] = (perfilCounts[p] || 0) + 1;
    });

    const riesgosPorPerfil = Object.entries(perfilCounts).map(([perfil, count]) => ({
      perfil,
      count
    }));

    // --- Calcular Procesos ---
    const procesoCounts: Record<string, number> = {};
    riesgos.forEach((r: any) => {
      const proc = r.proceso || "Sin Clasificar";
      procesoCounts[proc] = (procesoCounts[proc] || 0) + 1;
    });

    const riesgosPorProceso = Object.entries(procesoCounts).map(([proceso, count]) => ({
      proceso,
      count
    }));

    // --- Calcular Controles Activos ---
    const controlesActivos = controles.filter((c: any) => (c.estado || "ACTIVO") === "ACTIVO").length;

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
              {resumen.riesgosPorPerfil.filter(r => ["Crítico", "Extremo", "Alto"].includes(r.perfil)).reduce((acc, curr) => acc + curr.count, 0)}
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
              <div className="text-muted-foreground text-sm">No hay datos suficientes</div>
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
                <div className="text-sm text-muted-foreground text-center py-4">No hay datos</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}