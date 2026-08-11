import { useState, useEffect } from "react";
import { Input } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Search, Activity } from "lucide-react";

const MONITOREO_KEY = "laft_monitoreo_v1";

const DEFAULT_MONITOREOS = [
  {
    id: "1",
    codigo: "MONT-LAFT001",
    aspectoMonitorear: "Verificación de cumplimiento documental de debida diligencia",
    indicador: "Numerosos casos con inconsistencias o documentación incompleta",
    periodicidad: "Durante la solicitud",
    responsable: "SAGRILAFT / Comercial/Compras/Mercadeo"
  },
  {
    id: "2",
    codigo: "MONT-LAFT002",
    aspectoMonitorear: "Verificación de cumplimiento Actualización de Datos de la debida diligencia",
    indicador: "Numero de casos actualizados vs. total del periodo",
    periodicidad: "Anual",
    responsable: "SAGRILAFT / Comercial/Compras/Mercadeo"
  },
  {
    id: "3",
    codigo: "MONT-LAFT003",
    aspectoMonitorear: "Monitoreo, seguimiento y consolidación de transacciones del cliente.",
    indicador: "Análisis del perfil de riesgo transaccional del cliente",
    periodicidad: "Mensual",
    responsable: "SAGRILAFT"
  },
  {
    id: "4",
    codigo: "MONT-LAFT004",
    aspectoMonitorear: "Verificación listas restrictivas y LAFT",
    indicador: "Numero de clientes verificados en listas restrictivas",
    periodicidad: "Permanente",
    responsable: "SAGRILAFT"
  },
  {
    id: "5",
    codigo: "MONT-LAFT005",
    aspectoMonitorear: "Control de pagos en efectivo y canales de recaudo",
    indicador: "Número de transacciones en efectivo que superan el umbral",
    periodicidad: "Mensual",
    responsable: "Cartera / Sagrilaft"
  }
];

export default function Monitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [monitoreos, setMonitoreos] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MONITOREO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMonitoreos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error leyendo localStorage:", e);
    }
    // Inicializar datos semilla si no hay guardados
    setMonitoreos(DEFAULT_MONITOREOS);
    localStorage.setItem(MONITOREO_KEY, JSON.stringify(DEFAULT_MONITOREOS));
  }, []);

  const filtered = monitoreos.filter(m => 
    (m.codigo || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.aspectoMonitorear || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.indicador || "").toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead className="w-[140px]">Riesgo Asoc.</TableHead>
                <TableHead>Aspecto a Monitorear</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Periodicidad</TableHead>
                <TableHead>Responsable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay planes de monitoreo definidos.</p>
                    <p className="text-xs text-muted-foreground mt-1">Los planes se derivan de la matriz de riesgos.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => (
                  <TableRow key={item.id || idx}>
                    <TableCell className="font-mono font-bold text-xs">{item.codigo}</TableCell>
                    <TableCell className="max-w-[280px]">{item.aspectoMonitorear}</TableCell>
                    <TableCell className="max-w-[250px]" title={item.indicador || ""}>{item.indicador || "-"}</TableCell>
                    <TableCell className="font-medium text-xs text-teal-700 dark:text-teal-400">{item.periodicidad || "-"}</TableCell>
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