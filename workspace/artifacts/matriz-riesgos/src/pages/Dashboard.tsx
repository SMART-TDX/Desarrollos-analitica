import { useGetDashboardResumen, getGetDashboardResumenQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ShieldAlert, CheckCircle, AlertOctagon, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { formatPerfil, getPerfilColor } from "@/utils/format";

const COLORS = {
  Aceptable: "#16a34a",
  Bajo: "#16a34a",
  Tolerable: "#f59e0b",
  Moderado: "#f97316",
  Alto: "#ea580c",
  Crítico: "#dc2626",
  Extremo: "#991b1b"
};

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardResumen({ 
    query: { queryKey: getGetDashboardResumenQueryKey() } 
  });

  if (isLoading) {
    return <div className="p-8 text-muted-foreground flex items-center justify-center h-full">Cargando dashboard...</div>;
  }

  const resumen = data;
  if (!resumen) return null;

  const pieData = resumen.riesgosPorPerfil.map(item => ({
    name: item.perfil,
    value: item.count,
    color: COLORS[item.perfil as keyof typeof COLORS] || "#64748b"
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
              {resumen.riesgosPorPerfil.filter(r => r.perfil === "Crítico" || r.perfil === "Extremo" || r.perfil === "Alto").reduce((acc, curr) => acc + curr.count, 0)}
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
