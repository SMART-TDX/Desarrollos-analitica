import { useState } from "react";
import { useGetParametros, useCreateParametro, useUpdateParametro, getGetParametrosQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Button, Input, Badge } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Settings, List } from "lucide-react";

// Lista categories are text-only (value = nombre, no numeric weight)
const LISTA_CATEGORIES = ["PROCESO", "SUBPROCESO", "FACTOR_RIESGO"];
const PESO_CATEGORIES = ["CLASE", "TIPO", "FRECUENCIA", "FORMALIDAD"];

const LISTA_LABELS: Record<string, string> = {
  PROCESO: "Procesos",
  SUBPROCESO: "Subprocesos",
  FACTOR_RIESGO: "Factores de Riesgo",
};

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API = `${BASE_URL}/api`;

function AddListaItem({ categoria, onAdded }: { categoria: string; onAdded: () => void }) {
  const [nombre, setNombre] = useState("");
  const { mutate, isPending } = useCreateParametro();

  const handleAdd = () => {
    const trimmed = nombre.trim();
    if (!trimmed) return;
    mutate(
      { data: { categoria, nombre: trimmed, valor: 0, descripcion: trimmed } },
      {
        onSuccess: () => {
          toast.success(`"${trimmed}" añadido`);
          setNombre("");
          onAdded();
        },
        onError: () => toast.error("Error al añadir"),
      }
    );
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
      <Button size="sm" onClick={handleAdd} disabled={isPending || !nombre.trim()} className="gap-1">
        <Plus className="w-3 h-3" /> Añadir
      </Button>
    </div>
  );
}

function ListaCard({ categoria, items, onRefresh }: { categoria: string; items: any[]; onRefresh: () => void }) {
  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await fetch(`${API}/parametros/${id}`, { method: "DELETE" });
      toast.success(`"${nombre}" eliminado`);
      onRefresh();
    } catch {
      toast.error("Error al eliminar");
    }
  };

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
                  onClick={() => handleDelete(p.id, p.nombre)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <AddListaItem categoria={categoria} onAdded={onRefresh} />
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
  const queryClient = useQueryClient();
  const { data: parametros = [], isLoading, refetch } = useGetParametros({
    query: { queryKey: getGetParametrosQueryKey() },
  });

  const [activeTab, setActiveTab] = useState<"listas" | "pesos">("listas");

  const grouped = parametros.reduce(
    (acc, p) => {
      if (!acc[p.categoria]) acc[p.categoria] = [];
      acc[p.categoria].push(p);
      return acc;
    },
    {} as Record<string, typeof parametros>
  );

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: getGetParametrosQueryKey() });
  };

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
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando parámetros...</div>
        ) : activeTab === "listas" ? (
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
                  onRefresh={handleRefresh}
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
