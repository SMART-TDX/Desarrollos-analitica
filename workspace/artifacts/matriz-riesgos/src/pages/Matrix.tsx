import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Download } from "lucide-react";

const RIESGOS_KEY = "laft_riesgos_v1";

const DEFAULT_RIESGOS = [
  {
    id: "1",
    codigo: "R-LAFT001",
    proceso: "Gestión Comercial",
    descripcion: "Infiltración de recursos de origen ilícito a través de nuevos clientes.",
    flags: "CLIENTE",
    probabilidadInherente: 2,
    impactoInherente: 3,
    perfilInherente: "TOLERABLE",
    efectividadControles: "60%",
    probabilidadResidual: 1,
    impactoResidual: 2,
    perfilResidual: "ACEPTABLE"
  },
  {
    id: "2",
    codigo: "R-LAFT002",
    proceso: "Gestión Administrativa y Financiera",
    descripcion: "Pago a proveedores no verificados en listas restrictivas.",
    flags: "PROVEEDOR",
    probabilidadInherente: 3,
    impactoInherente: 4,
    perfilInherente: "MODERADO",
    efectividadControles: "50%",
    probabilidadResidual: 2,
    impactoResidual: 3,
    perfilResidual: "TOLERABLE"
  }
];

export default function Matrix() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [riesgos, setRiesgos] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RIESGOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRiesgos(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Error cargando localStorage:", e);
    }

    // Inicializar con datos por defecto si está vacío
    localStorage.setItem(RIESGOS_KEY, JSON.stringify(DEFAULT_RIESGOS));
    setRiesgos(DEFAULT_RIESGOS);
  }, []);

  const filteredRiesgos = riesgos.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.codigo || "").toLowerCase().includes(term) ||
      (r.proceso || "").toLowerCase().includes(term) ||
      (r.descripcion || "").toLowerCase().includes(term)
    );
  });

  const getPerfilBadge = (perfil: string) => {
    const val = (perfil || "").toUpperCase();
    if (val === "ACEPTABLE") return <Badge className="bg-green-600 text-white">ACEPTABLE</Badge>;
    if (val === "TOLERABLE") return <Badge className="bg-amber-500 text-white">TOLERABLE</Badge>;
    if (val === "MODERADO") return <Badge className="bg-orange-500 text-white">MODERADO</Badge>;
    if (val === "ALTO") return <Badge className="bg-red-600 text-white">ALTO</Badge>;
    if (val === "CRITICO" || val === "CRÍTICO") return <Badge className="bg-red-900 text-white">CRÍTICO</Badge>;
    return <Badge variant="outline">{perfil || "N/A"}</Badge>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Matriz de Riesgos</h1>
          <p className="text-muted-foreground text-sm">Vista consolidada de todos los riesgos evaluados.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" /> PDF</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Excel</Button>
          <Button size="sm" onClick={() => setLocation("/matriz/nuevo")}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo Riesgo
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, proceso o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Proceso</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-center">P.I.</TableHead>
              <TableHead className="text-center">I.I.</TableHead>
              <TableHead>Perfil Inh.</TableHead>
              <TableHead className="text-center">Efectividad</TableHead>
              <TableHead className="text-center">P.R.</TableHead>
              <TableHead className="text-center">I.R.</TableHead>
              <TableHead>Perfil Res.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRiesgos.length > 0 ? (
              filteredRiesgos.map((r, index) => (
                <TableRow key={r.id || index}>
                  <TableCell className="font-mono text-xs font-bold">{r.codigo || `R-${index + 1}`}</TableCell>
                  <TableCell className="text-xs">{r.proceso || "-"}</TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{r.descripcion || "-"}</TableCell>
                  <TableCell className="text-xs">{r.flags || "-"}</TableCell>
                  <TableCell className="text-xs text-center">{r.probabilidadInherente ?? "-"}</TableCell>
                  <TableCell className="text-xs text-center">{r.impactoInherente ?? "-"}</TableCell>
                  <TableCell>{getPerfilBadge(r.perfilInherente)}</TableCell>
                  <TableCell className="text-xs text-center">{r.efectividadControles || "-"}</TableCell>
                  <TableCell className="text-xs text-center">{r.probabilidadResidual ?? "-"}</TableCell>
                  <TableCell className="text-xs text-center">{r.impactoResidual ?? "-"}</TableCell>
                  <TableCell>{getPerfilBadge(r.perfilResidual)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No se encontraron riesgos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}