import { useGetMediciones, getGetMedicionesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Badge, Button } from "@/components/ui";
import { Target, ArrowRight } from "lucide-react";

export default function Measurements() {
  const { data: mediciones = [], isLoading } = useGetMediciones({
    query: { queryKey: getGetMedicionesQueryKey() }
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sesiones de Medición</h1>
            <p className="text-muted-foreground text-sm mt-1">Histórico de evaluaciones de probabilidad e impacto por expertos.</p>
          </div>
          <Button className="gap-2">Nueva Medición</Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nombre / Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-center">Participantes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando mediciones...</TableCell>
                </TableRow>
              ) : mediciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Target className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay sesiones de medición registradas.</p>
                  </TableCell>
                </TableRow>
              ) : (
                mediciones.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nombre}</TableCell>
                    <TableCell><Badge variant="secondary">{m.tipo}</Badge></TableCell>
                    <TableCell>{new Date(m.fechaMedicion).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center">{m.numParticipantes}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1">
                        Ver Detalles <ArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
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
