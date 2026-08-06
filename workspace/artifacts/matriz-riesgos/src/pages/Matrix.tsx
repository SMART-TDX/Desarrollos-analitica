import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, FileSpreadsheet, FileText } from "lucide-react";

const RIESGOS_KEY = "laft_riesgos_v1";

const DEFAULT_RIESGOS = [
  {
    id: 1,
    codigo: "R-LAFT001",
    proceso: "Gestión Comercial",
    descripcion: "Posibilidad de vincular clientes o contrapartes relacionadas con actividades ilícitas.",
    probabilidadInherente: 3,
    impactoInherente: 3,
    perfilInherente: "TOLERABLE",
    efectividad: "0.39 %",
    flags: ["LAFT", "OP", "PIERNA", "REPS", "ESTAFA"]
  },
  {
    id: 2,
    codigo: "R-LAFT002",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    descripcion: "Posibilidad de recibir recursos de fuentes no justificadas o ilícitas.",
    probabilidadInherente: 3,
    impactoInherente: 4,
    perfilInherente: "MODERADO",
    efectividad: "0.36 %",
    flags: ["OP", "PIERNA", "REPS", "ESTAFA"]
  },
  {
    id: 3,
    codigo: "R-LAFT003",
    proceso: "Gestión Comercial",
    descripcion: "Posibilidad de vincular y prestar servicios sin la debida diligencia completa.",
    probabilidadInherente: 2,
    impactoInherente: 5,
    perfilInherente: "MODERADO",
    efectividad: "0.41 %",
    flags: ["LAFT", "OP", "PIERNA", "REPS", "ESTAFA"]
  },
  {
    id: 4,
    codigo: "R-LAFT004",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    descripcion: "Posibilidad de adquirir bienes o contrataciones con proveedores sancionados.",
    probabilidadInherente: 2,
    impactoInherente: 4,
    perfilInherente: "TOLERABLE",
    efectividad: "0.39 %",
    flags: ["LAFT", "OP", "PIERNA", "REPS"]
  },
  {
    id: 5,
    codigo: "R-LAFT005",
    proceso: "GESTION ADMINISTRATIVA Y FINANCIERA",
    descripcion: "Posibilidad de que empleados u operarios ejecuten transacciones sospechosas.",
    probabilidadInherente: 2,
    impactoInherente: 5,
    perfilInherente: "MODERADO",
    efectividad: "0.37 %",
    flags: ["LAFT", "PIERNA", "REPS"]
  }
];

function getPerfilBadge(perfil: string) {
  switch (perfil) {
    case "ACEPTABLE":
      return "bg-green-100 text-green-800 border-green-300";
    case "TOLERABLE":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "MODERADO":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "ALTO":
    case "CRITICO":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function Matrix() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [riesgos, setRiesgos] = useState<any[]>(() => {
    const saved = localStorage.getItem(RIESGOS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_RIESGOS;
  });

  useEffect(() => {
    if (!localStorage.getItem(RIESGOS_KEY)) {
      localStorage.setItem(RIESGOS_KEY, JSON.stringify(DEFAULT_RIESGOS));
    }
  }, []);

  const handleDelete = (id: number, codigo: string) => {
    if (!confirm(`¿Eliminar el riesgo ${codigo}?`)) return;
    const actualizados = riesgos.filter((r) => r.id !== id);
    setRiesgos(actualizados);
    localStorage.setItem(RIESGOS_KEY, JSON.stringify(actualizados));
    toast.success(`Riesgo ${codigo} eliminado`);
  };

  const filtered = riesgos.filter(
    (r) =>
      r.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      r.proceso?.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Matriz de Riesgos</h1>
            <p className="text-muted-foreground text-sm">Vista consolidada de todos los riesgos evaluados.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("Exportando PDF...")}>
              <FileText className="w-4 h-4 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Exportando Excel...")}>
              <FileSpreadsheet className="w-4 h-4 mr-1" /> Excel
            </Button>
            <Button onClick={() => setLocation("/riesgo/nuevo")} className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Riesgo
            </Button>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, proceso o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Código</TableHead>
                  <TableHead className="w-48">Proceso</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center w-16">P.I.</TableHead>
                  <TableHead className="text-center w-16">I.I.</TableHead>
                  <TableHead className="text-center w-32">Perfil Inh.</TableHead>
                  <TableHead className="text-center w-28">Efectividad</TableHead>
                  <TableHead className="text-right w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground italic">
                      No se encontraron riesgos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium text-xs">{r.codigo}</TableCell>
                      <TableCell className="font-medium text-xs">{r.proceso}</TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm line-clamp-2">{r.descripcion}</p>
                        {r.flags && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.flags.map((flag: string) => (
                              <Badge key={flag} variant="secondary" className="text-[10px] px-1 py-0">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono">{r.probabilidadInherente || r.pi || 1}</TableCell>
                      <TableCell className="text-center font-mono">{r.impactoInherente || r.ii || 1}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPerfilBadge(r.perfilInherente)}`}>
                          {r.perfilInherente || "TOLERABLE"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">{r.efectividad || "0.00 %"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => setLocation(`/riesgo/${r.id}`)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(r.id, r.codigo)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}