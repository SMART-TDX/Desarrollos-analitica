import { useGetMonitoreos, getGetMonitoreosQueryKey } from "@workspace/api-client-react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Search, Activity } from "lucide-react";
import { useState } from "react";

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: monitoreos = [], isLoading } = useGetMonitoreos({
    query: { queryKey: getGetMonitoreosQueryKey() }
  });

  const filtered = monitoreos.filter(m => 
    m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.aspectoMonitorear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plan de Monitoreo</h1>
            <p className="text-muted-foreground text-sm mt-1">Actividades de seguimiento a los riesgos identificados.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por código de riesgo o aspecto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">Riesgo Asoc.</TableHead>
                <TableHead>Aspecto a Monitorear</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Periodicidad</TableHead>
                <TableHead>Responsable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando plan de monitoreo...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay planes de monitoreo definidos.</p>
                    <p className="text-xs text-muted-foreground mt-1">Los planes se derivan de la matriz de riesgos.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium text-xs">{item.codigo}</TableCell>
                    <TableCell className="max-w-[250px]">{item.aspectoMonitorear}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.indicador || ""}>{item.indicador || "-"}</TableCell>
                    <TableCell>{item.periodicidad || "-"}</TableCell>
                    <TableCell>{item.responsable || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
