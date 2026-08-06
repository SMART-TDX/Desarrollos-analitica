import { useState, useEffect } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, Label } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit } from "lucide-react";

const CONTROLES_KEY = "laft_controles_v1";

const DEFAULT_CONTROLES = [
  {
    id: 1,
    codigo: "CTR-LAFT-01",
    descripcion: "Consulta en las listas restrictivas para todas las personas asociadas.",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 0.425
  },
  {
    id: 2,
    codigo: "CTR-LAFT-02",
    descripcion: "Aceptación de cláusula SAGRILAFT sobre prevención del riesgo.",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 0.425
  },
  {
    id: 3,
    codigo: "CTR-LAFT-03",
    descripcion: "Aprobación por parte de gerencia para vinculación de clientes especiales.",
    clase: "PREVENTIVO",
    tipo: "MANUAL",
    frecuencia: "OCASIONAL",
    ponderacion: 0.335
  },
  {
    id: 4,
    codigo: "CTR-LAFT-04",
    descripcion: "Chequeo de información pública en medios de comunicación.",
    clase: "PREVENTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 0.425
  },
  {
    id: 5,
    codigo: "CTR-LAFT-05",
    descripcion: "Validación y causación de recibos de caja contra extractos bancarios.",
    clase: "DETECTIVO",
    tipo: "SEMIAUTOMÁTICO",
    frecuencia: "PERMANENTE",
    ponderacion: 0.415
  },
  {
    id: 6,
    codigo: "CTR-LAFT-06",
    descripcion: "Identificación y seguimiento de las partidas conciliatorias inusuales.",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERMANENTE",
    ponderacion: 0.3775
  },
  {
    id: 7,
    codigo: "CTR-LAFT-07",
    descripcion: "Revisión por parte del Oficial de Cumplimiento de reportes inusuales.",
    clase: "DETECTIVO",
    tipo: "MANUAL",
    frecuencia: "PERIÓDICO",
    ponderacion: 0.29
  }
];

export default function Controls() {
  const [search, setSearch] = useState("");
  const [controles, setControles] = useState<any[]>(() => {
    const saved = localStorage.getItem(CONTROLES_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONTROLES;
  });

  // Modal / Form inline state
  const [isAdding, setIsAdding] = useState(false);
  const [newCodigo, setNewCodigo] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newClase, setNewClase] = useState("PREVENTIVO");
  const [newTipo, setNewTipo] = useState("SEMIAUTOMÁTICO");

  useEffect(() => {
    if (!localStorage.getItem(CONTROLES_KEY)) {
      localStorage.setItem(CONTROLES_KEY, JSON.stringify(DEFAULT_CONTROLES));
    }
  }, []);

  const handleDelete = (id: number, codigo: string) => {
    if (!confirm(`¿Eliminar el control ${codigo}?`)) return;
    const actualizados = controles.filter((c) => c.id !== id);
    setControles(actualizados);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(actualizados));
    toast.success(`Control ${codigo} eliminado`);
  };

  const handleAddControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescripcion.trim()) {
      toast.error("Ingrese una descripción para el control");
      return;
    }

    const nextId = Date.now();
    const code = newCodigo.trim() || `CTR-LAFT-0${controles.length + 1}`;

    const nuevoControl = {
      id: nextId,
      codigo: code,
      descripcion: newDescripcion,
      clase: newClase,
      tipo: newTipo,
      frecuencia: "PERMANENTE",
      ponderacion: 0.40
    };

    const actualizados = [...controles, nuevoControl];
    setControles(actualizados);
    localStorage.setItem(CONTROLES_KEY, JSON.stringify(actualizados));

    toast.success(`Control ${code} creado exitosamente`);
    setIsAdding(false);
    setNewCodigo("");
    setNewDescripcion("");
  };

  const filtered = controles.filter(
    (c) =>
      c.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Catálogo de Controles</h1>
            <p className="text-muted-foreground text-sm">Gestión del inventario central de controles LAFT.</p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo Control
          </Button>
        </div>

        {/* Formulario de creación rápida */}
        {isAdding && (
          <Card className="border-primary/50 bg-muted/20">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Añadir Nuevo Control</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddControl} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Código (Opcional)</Label>
                    <Input
                      placeholder="Ej. CTR-LAFT-08"
                      value={newCodigo}
                      onChange={(e) => setNewCodigo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Clase</Label>
                    <select
                      value={newClase}
                      onChange={(e) => setNewClase(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="PREVENTIVO">PREVENTIVO</option>
                      <option value="DETECTIVO">DETECTIVO</option>
                      <option value="CORRECTIVO">CORRECTIVO</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <select
                      value={newTipo}
                      onChange={(e) => setNewTipo(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="AUTOMÁTICO">AUTOMÁTICO</option>
                      <option value="SEMIAUTOMÁTICO">SEMIAUTOMÁTICO</option>
                      <option value="MANUAL">MANUAL</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Descripción del Control *</Label>
                  <Input
                    placeholder="Describa la actividad del control..."
                    value={newDescripcion}
                    onChange={(e) => setNewDescripcion(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm">
                    Guardar Control
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o descripción..."
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
                  <TableHead className="w-32">Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-64">Atributos</TableHead>
                  <TableHead className="text-right w-32">Ponderación</TableHead>
                  <TableHead className="text-right w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                      No hay controles registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium text-xs">{c.codigo}</TableCell>
                      <TableCell className="text-sm font-medium">{c.descripcion}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {c.clase}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {c.tipo}
                          </Badge>
                          {c.frecuencia && (
                            <Badge variant="ghost" className="text-[10px] uppercase border">
                              {c.frecuencia}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {((c.ponderacion || 0) * 100).toFixed(3)} %
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(c.id, c.codigo)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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