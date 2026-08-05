import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";
import { Plus, Trash2, Settings, List } from "lucide-react";

// Categorías de listas e información de pesos
const LISTA_CATEGORIES = ["PROCESO", "SUBPROCESO", "FACTOR_RIESGO"];
const PESO_CATEGORIES = ["CLASE", "TIPO", "FRECUENCIA", "FORMALIDAD"];

const LISTA_LABELS: Record<string, string> = {
  PROCESO: "Procesos",
  SUBPROCESO: "Subprocesos",
  FACTOR_RIESGO: "Factores de Riesgo",
};

const STORAGE_KEY = "laft_parametros_v1";

// Datos iniciales de Replit
const DEFAULT_PARAMETROS = [
  // PROCESOS
  { id: 1, categoria: "PROCESO", nombre: "GESTION ADMINISTRATIVA Y FINANCIERA", valor: 0, descripcion: "" },
  { id: 2, categoria: "PROCESO", nombre: "Gestión Académica", valor: 0, descripcion: "" },
  { id: 3, categoria: "PROCESO", nombre: "Gestión Comercial", valor: 0, descripcion: "" },
  { id: 4, categoria: "PROCESO", nombre: "Gestión Humana", valor: 0, descripcion: "" },
  { id: 5, categoria: "PROCESO", nombre: "Gestión Jurídica", valor: 0, descripcion: "" },
  { id: 6, categoria: "PROCESO", nombre: "Gestión de Tecnología", valor: 0, descripcion: "" },

  // SUBPROCESOS
  { id: 7, categoria: "SUBPROCESO", nombre: "CARTERA", valor: 0, descripcion: "" },
  { id: 8, categoria: "SUBPROCESO", nombre: "COMERCIAL-TELEMERCADEO-VENTAS", valor: 0, descripcion: "" },
  { id: 9, categoria: "SUBPROCESO", nombre: "COMERCIAL-TELEMERCADEO-VENTAS-CORPORATIVO Y PERSONALIZADO-EXAMENES INTERNACIONALES-INSTITUTO-SMART ONLINE", valor: 0, descripcion: "" },
  { id: 10, categoria: "SUBPROCESO", nombre: "COMPRAS", valor: 0, descripcion: "" },
  { id: 11, categoria: "SUBPROCESO", nombre: "CONTABILIDAD", valor: 0, descripcion: "" },
  { id: 12, categoria: "SUBPROCESO", nombre: "INSTITUTO", valor: 0, descripcion: "" },

  // FACTORES DE RIESGO
  { id: 13, categoria: "FACTOR_RIESGO", nombre: "ALIADOS ESTRATÉGICOS", valor: 0, descripcion: "" },
  { id: 14, categoria: "FACTOR_RIESGO", nombre: "CANALES DE DISTRIBUCIÓN", valor: 0, descripcion: "" },
  { id: 15, categoria: "FACTOR_RIESGO", nombre: "Colaboradores", valor: 0, descripcion: "" },
  { id: 16, categoria: "FACTOR_RIESGO", nombre: "EMPLEADOS", valor: 0, descripcion: "" },
  { id: 17, categoria: "FACTOR_RIESGO", nombre: "ESTUDIANTES", valor: 0, descripcion: "" },
  { id: 18, categoria: "FACTOR_RIESGO", nombre: "PRODUCTOS Y SERVICIOS", valor: 0, descripcion: "" },
  { id: 19, categoria: "FACTOR_RIESGO", nombre: "PROVEEDORES", valor: 0, descripcion: "" },
  { id: 20, categoria: "FACTOR_RIESGO", nombre: "TECNOLÓGICO", valor: 0, descripcion: "" },

  // PESOS DE CONTROLES
  { id: 21, categoria: "CLASE", nombre: "Preventivo", valor: 0.4, descripcion: "Control preventivo" },
  { id: 22, categoria: "CLASE", nombre: "Detectivo", valor: 0.3, descripcion: "Control detectivo" },
  { id: 23, categoria: "CLASE", nombre: "Correctivo", valor: 0.3, descripcion: "Control correctivo" },
  { id: 24, categoria: "TIPO", nombre: "Automático", valor: 0.5, descripcion: "Ejecutado por sistema" },
  { id: 25, categoria: "TIPO", nombre: "Manual", valor: 0.5, descripcion: "Ejecutado por persona" },
];

function AddListaItem({
  categoria,
  onAdd,
}: {
  categoria: string;
  onAdd: (categoria: string, nombre: string) => void;
}) {
  const [nombre, setNombre] = useState("");

  const handleAdd = () => {
    const trimmed = nombre.trim();
    if (!trimmed) return;
    onAdd(categoria, trimmed);
    setNombre("");
  };

  return (
    <div className="flex gap-2 mt-3">
      <Input
        placeholder={`Nueva opción para ${LISTA_LABELS[categoria] ?? categoria}...`}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="flex-1 h-8 text-sm"
      />
      <Button size="sm" onClick={handleAdd} disabled={!nombre.trim()} className="gap-1">
        <Plus className="w-3 h-3" /> Añadir
      </Button>
    </div>
  );
}

function ListaCard({
  categoria,
  items,
  onAdd,
  onDelete,
}: {
  categoria: string;
  items: any[];
  onAdd: (categoria: string, nombre: string) => void;
  onDelete: (id: number, nombre: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="py-4 flex flex-row items-center gap-2">
        <List className="w-4 h-4 text-muted-foreground" />
        <CardTitle className="text-base">{LISTA_LABELS[categoria] ?? categoria}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 italic">Sin opciones configuradas.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5 group">
                <span className="text-sm font-medium">{p.nombre}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(p.id, p.nombre)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <AddListaItem categoria={categoria} onAdd={onAdd} />
      </CardContent>
    </Card>
  );
}

function PesoRow({ p }: { p: any }) {
  return (
    <TableRow key={p.id}>
      <TableCell className="font-medium">{p.nombre}</TableCell>
      <TableCell className="text-right font-mono">{(p.valor * 100).toFixed(0)}%</TableCell>
      {p.descripcion && <TableCell className="text-xs text-muted-foreground">{p.descripcion}</TableCell>}
    </TableRow>
  );
}

export default function Parameters() {
  const [parametros, setParametros] = useState<any[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PARAMETROS;
  });

  const [activeTab, setActiveTab] = useState<"listas" | "pesos">("listas");

  // Guardar en localStorage cada vez que cambien los parámetros
  const saveParametros = (newParametros: any[]) => {
    setParametros(newParametros);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newParametros));
  };

  const handleAdd = (categoria: string, nombre: string) => {
    const newItem = {
      id: Date.now(),
      categoria,
      nombre,
      valor: 0,
      descripcion: nombre,
    };
    const updated = [...parametros, newItem];
    saveParametros(updated);
    toast.success(`"${nombre}" añadido`);
  };

  const handleDelete = (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    const updated = parametros.filter((p) => p.id !== id);
    saveParametros(updated);
    toast.success(`"${nombre}" eliminado`);
  };

  const grouped = parametros.reduce(
    (acc, p) => {
      if (!acc[p.categoria]) acc[p.categoria] = [];
      acc[p.categoria].push(p);
      return acc;
    },
    {} as Record<string, typeof parametros>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-6 border-b pb-0">
        <h1 className="text-2xl font-bold text-foreground mb-1">Parámetros del Sistema</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Gestione las listas desplegables y los pesos de efectividad de controles.
        </p>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "listas" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab("listas")}
          >
            <List className="w-4 h-4" /> Listas Desplegables
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === "pesos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab("pesos")}
          >
            <Settings className="w-4 h-4" /> Pesos de Controles
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeTab === "listas" ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Las opciones aquí aparecen en los desplegables al crear o editar un riesgo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {LISTA_CATEGORIES.map((cat) => (
                <ListaCard
                  key={cat}
                  categoria={cat}
                  items={grouped[cat] ?? []}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Pesos usados para calcular la efectividad promedio de los controles asociados a cada riesgo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {PESO_CATEGORIES.filter((c) => grouped[c]).map((cat) => (
                <Card key={cat}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base uppercase tracking-wider text-muted-foreground">{cat}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="text-right">Peso (%)</TableHead>
                          <TableHead>Descripción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(grouped[cat] ?? []).map((p) => (
                          <PesoRow key={p.id} p={p} />
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}