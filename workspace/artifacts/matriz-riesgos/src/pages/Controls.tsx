import { useState } from "react";
import { useGetControles, useCreateControl, useUpdateControl, useDeleteControl, getGetControlesQueryKey } from "@workspace/api-client-react";
import { Button, Input, Card, CardContent, Badge, Label } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Search, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Controls() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState<number | 'new' | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: controles = [], isLoading } = useGetControles({
    query: { queryKey: getGetControlesQueryKey() }
  });

  const createMutation = useCreateControl();
  const updateMutation = useUpdateControl();
  const deleteMutation = useDeleteControl();

  const [formData, setFormData] = useState({
    codigo: "", descripcion: "", clase: "PREVENTIVO", tipo: "MANUAL", 
    frecuencia: "PERMANENTE", formalidad: "FORMAL", soporte: "", responsable: ""
  });

  const handleEdit = (ctrl: any) => {
    setFormData({
      codigo: ctrl.codigo,
      descripcion: ctrl.descripcion,
      clase: ctrl.clase,
      tipo: ctrl.tipo,
      frecuencia: ctrl.frecuencia,
      formalidad: ctrl.formalidad,
      soporte: ctrl.soporte || "",
      responsable: ctrl.responsable || ""
    });
    setIsEditing(ctrl.id);
  };

  const handleNew = () => {
    setFormData({
      codigo: "", descripcion: "", clase: "PREVENTIVO", tipo: "MANUAL", 
      frecuencia: "PERMANENTE", formalidad: "FORMAL", soporte: "", responsable: ""
    });
    setIsEditing('new');
  };

  const handleCancel = () => {
    setIsEditing(null);
  };

  const handleSave = () => {
    if (!formData.codigo || !formData.descripcion) {
      toast.error("Código y descripción son obligatorios");
      return;
    }

    if (isEditing === 'new') {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          toast.success("Control creado");
          queryClient.invalidateQueries({ queryKey: getGetControlesQueryKey() });
          setIsEditing(null);
        },
        onError: () => toast.error("Error al crear control")
      });
    } else if (isEditing !== null) {
      updateMutation.mutate({ id: isEditing as number, data: formData }, {
        onSuccess: () => {
          toast.success("Control actualizado");
          queryClient.invalidateQueries({ queryKey: getGetControlesQueryKey() });
          setIsEditing(null);
        },
        onError: () => toast.error("Error al actualizar control")
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Eliminar este control?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast.success("Control eliminado");
          queryClient.invalidateQueries({ queryKey: getGetControlesQueryKey() });
        },
        onError: () => toast.error("Error al eliminar control")
      });
    }
  };

  const filtered = controles.filter(c => 
    c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Catálogo de Controles</h1>
            <p className="text-muted-foreground text-sm mt-1">Gestión del inventario central de controles LAFT.</p>
          </div>
          <Button onClick={handleNew} className="gap-2" disabled={isEditing !== null}>
            <Plus className="w-4 h-4" /> Nuevo Control
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por código o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              disabled={isEditing !== null}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {isEditing !== null && (
          <Card className="mb-6 border-primary/20 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{isEditing === 'new' ? 'Nuevo Control' : 'Editar Control'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Código *</Label>
                  <Input value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
                </div>
                <div className="space-y-2 lg:col-span-3">
                  <Label>Descripción *</Label>
                  <Input value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Clase</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={formData.clase} onChange={e => setFormData({...formData, clase: e.target.value})}>
                    <option>PREVENTIVO</option><option>DETECTIVO</option><option>CORRECTIVO</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                    <option>MANUAL</option><option>SEMIAUTOMÁTICO</option><option>AUTOMÁTICO</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={formData.frecuencia} onChange={e => setFormData({...formData, frecuencia: e.target.value})}>
                    <option>PERMANENTE</option><option>PERIODICO</option><option>OCASIONAL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Formalidad</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={formData.formalidad} onChange={e => setFormData({...formData, formalidad: e.target.value})}>
                    <option>DODI</option><option>FORMAL</option><option>INFORMAL</option>
                  </select>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Responsable</Label>
                  <Input value={formData.responsable} onChange={e => setFormData({...formData, responsable: e.target.value})} />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label>Soporte (Evidencia)</Label>
                  <Input value={formData.soporte} onChange={e => setFormData({...formData, soporte: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                <Button onClick={handleSave} className="gap-2" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="w-4 h-4" /> Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px]">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Atributos</TableHead>
                <TableHead className="text-center w-[100px]">Ponderación</TableHead>
                <TableHead className="text-right w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay controles registrados.</TableCell>
                </TableRow>
              ) : (
                filtered.map(ctrl => (
                  <TableRow key={ctrl.id}>
                    <TableCell className="font-mono font-medium text-xs">{ctrl.codigo}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={ctrl.descripcion}>{ctrl.descripcion}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] py-0">{ctrl.clase}</Badge>
                        <Badge variant="outline" className="text-[10px] py-0">{ctrl.tipo}</Badge>
                        <Badge variant="outline" className="text-[10px] py-0">{ctrl.frecuencia}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">{ctrl.ponderacion}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(ctrl)} disabled={isEditing !== null}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ctrl.id)} disabled={isEditing !== null}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
