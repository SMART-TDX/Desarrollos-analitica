import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetRiesgo,
  useCreateRiesgo,
  useUpdateRiesgo,
  useGetControles,
  useAddControlToRiesgo,
  useRemoveControlFromRiesgo,
  useGetParametros,
  getGetRiesgosQueryKey,
  getGetRiesgoQueryKey,
  getGetParametrosQueryKey,
} from "@workspace/api-client-react";
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";

const PROB_LABELS: Record<number, string> = {
  1: "1 — Raro",
  2: "2 — Poco probable",
  3: "3 — Posible",
  4: "4 — Probable",
  5: "5 — Casi con certeza",
};

const IMP_LABELS: Record<number, string> = {
  1: "1 — Insignificante",
  2: "2 — Menor",
  3: "3 — Moderado",
  4: "4 — Mayor",
  5: "5 — Catastrófico",
};

function calcPerfil(p: number, i: number) {
  const s = p * i;
  if (s <= 4) return { label: "ACEPTABLE", color: "bg-green-100 text-green-800" };
  if (s <= 9) return { label: "TOLERABLE", color: "bg-yellow-100 text-yellow-800" };
  if (s <= 14) return { label: "MODERADO", color: "bg-orange-100 text-orange-800" };
  if (s <= 19) return { label: "ALTO", color: "bg-red-100 text-red-800" };
  return { label: "CRITICO", color: "bg-red-200 text-red-900" };
}

function SelectField({
  label, name, value, options, onChange, required = false,
}: {
  label: string; name: string; value: string; options: string[]; onChange: (name: string, val: string) => void; required?: boolean;
}) {
  const [custom, setCustom] = useState(!options.includes(value) && value !== "");
  const showCustom = custom || (value !== "" && !options.includes(value));

  return (
    <div className="space-y-1.5">
      <Label>{label}{required && " *"}</Label>
      {showCustom ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={`Escriba ${label.toLowerCase()}...`}
            className="flex-1"
          />
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { onChange(name, ""); setCustom(false); }}>
            Lista
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <select
            name={name}
            value={value}
            onChange={(e) => onChange(name, e.target.value)}
            className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">-- Seleccione --</option>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setCustom(true)}>
            Otro
          </Button>
        </div>
      )}
    </div>
  );
}

export default function RiskForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isNew = !params.id || params.id === "nuevo";
  const id = isNew ? null : parseInt(params.id!);
  const queryClient = useQueryClient();

  const { data: controlesDB = [] } = useGetControles();
  const { data: parametros = [] } = useGetParametros({ query: { queryKey: getGetParametrosQueryKey() } });

  const { data: riesgoDB, isLoading, refetch: refetchRiesgo } = useGetRiesgo(id!, {
    query: { enabled: !!id, queryKey: getGetRiesgoQueryKey(id!) },
  });

  const createMutation = useCreateRiesgo();
  const updateMutation = useUpdateRiesgo();
  const addControlMutation = useAddControlToRiesgo();
  const removeControlMutation = useRemoveControlFromRiesgo();

  const [formData, setFormData] = useState({
    codigo: "", proceso: "", subproceso: "", factorRiesgo: "", descripcion: "",
    riesgoLaft: false, riesgoOperativo: false, riesgoLegal: false, riesgoReputacional: false, riesgoContagio: false,
    quePuedeSuceder: "", tipologia: "", porQuePuedeSuceder: "", consecuencias: "",
    probabilidadInherente: 1, impactoInherente: 1,
    tipoMonitoreo: "", responsableMonitoreo: "", periodicidadMonitoreo: "", prioridad: "", sugerencias: ""
  });

  // Control search state
  const [controlSearch, setControlSearch] = useState("");
  const [showControlList, setShowControlList] = useState(false);

  useEffect(() => {
    if (riesgoDB && !isNew) {
      setFormData({
        codigo: riesgoDB.codigo || "", proceso: riesgoDB.proceso || "", subproceso: riesgoDB.subproceso || "",
        factorRiesgo: riesgoDB.factorRiesgo || "", descripcion: riesgoDB.descripcion || "",
        riesgoLaft: riesgoDB.riesgoLaft || false, riesgoOperativo: riesgoDB.riesgoOperativo || false,
        riesgoLegal: riesgoDB.riesgoLegal || false, riesgoReputacional: riesgoDB.riesgoReputacional || false,
        riesgoContagio: riesgoDB.riesgoContagio || false,
        quePuedeSuceder: riesgoDB.quePuedeSuceder || "", tipologia: riesgoDB.tipologia || "",
        porQuePuedeSuceder: riesgoDB.porQuePuedeSuceder || "", consecuencias: riesgoDB.consecuencias || "",
        probabilidadInherente: riesgoDB.probabilidadInherente || 1, impactoInherente: riesgoDB.impactoInherente || 1,
        tipoMonitoreo: riesgoDB.tipoMonitoreo || "", responsableMonitoreo: riesgoDB.responsableMonitoreo || "",
        periodicidadMonitoreo: riesgoDB.periodicidadMonitoreo || "", prioridad: riesgoDB.prioridad || "",
        sugerencias: riesgoDB.sugerencias || ""
      });
    }
  }, [riesgoDB, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(p => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "probabilidadInherente" || name === "impactoInherente") {
      setFormData(p => ({ ...p, [name]: parseInt(value) || 1 }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, val: string) => {
    setFormData(p => ({ ...p, [name]: val }));
  };

  const handleSave = () => {
    if (!formData.codigo || !formData.proceso || !formData.descripcion) {
      toast.error("Complete los campos obligatorios: Código, Proceso y Descripción");
      return;
    }
    if (isNew) {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          toast.success("Riesgo creado exitosamente");
          queryClient.invalidateQueries({ queryKey: getGetRiesgosQueryKey() });
          setLocation("/matriz");
        },
        onError: () => toast.error("Error al crear riesgo")
      });
    } else {
      updateMutation.mutate({ id: id!, data: formData }, {
        onSuccess: () => {
          toast.success("Riesgo actualizado exitosamente");
          queryClient.invalidateQueries({ queryKey: getGetRiesgosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRiesgoQueryKey(id!) });
          setLocation("/matriz");
        },
        onError: () => toast.error("Error al actualizar riesgo")
      });
    }
  };

  const handleAddControl = (controlId: number) => {
    if (!id) return;
    addControlMutation.mutate({ riesgoId: id, data: { controlId, orden: (riesgoDB?.controles?.length ?? 0) + 1 } }, {
      onSuccess: () => {
        toast.success("Control añadido");
        queryClient.invalidateQueries({ queryKey: getGetRiesgoQueryKey(id) });
        refetchRiesgo();
        setShowControlList(false);
        setControlSearch("");
      },
      onError: () => toast.error("Error al añadir control"),
    });
  };

  const handleRemoveControl = (controlId: number) => {
    if (!id) return;
    removeControlMutation.mutate({ riesgoId: id, controlId }, {
      onSuccess: () => {
        toast.success("Control desvinculado");
        queryClient.invalidateQueries({ queryKey: getGetRiesgoQueryKey(id) });
        refetchRiesgo();
      },
      onError: () => toast.error("Error al eliminar control"),
    });
  };

  // Get lists from parametros
  const getList = (cat: string) =>
    parametros.filter((p) => p.categoria === cat).map((p) => p.nombre);

  const procesos = getList("PROCESO");
  const subprocesos = getList("SUBPROCESO");
  const factores = getList("FACTOR_RIESGO");

  const linkedControlIds = new Set((riesgoDB?.controles ?? []).map((rc) => rc.controlId));
  const availableControles = controlesDB.filter(
    (c) =>
      !linkedControlIds.has(c.id) &&
      (controlSearch === "" ||
        c.codigo.toLowerCase().includes(controlSearch.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(controlSearch.toLowerCase()))
  );

  const perfilInherente = calcPerfil(formData.probabilidadInherente, formData.impactoInherente);

  if (isLoading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/matriz")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isNew ? "Nuevo Riesgo" : `Editar Riesgo ${formData.codigo}`}</h1>
              <p className="text-muted-foreground text-sm">Información detallada para la matriz de riesgos</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="w-4 h-4" /> Guardar Riesgo
          </Button>
        </div>

        {/* Identificación */}
        <Card>
          <CardHeader><CardTitle>Identificación del Riesgo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Código *</Label>
                <Input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej. R-LAFT015" />
              </div>
              <SelectField
                label="Proceso" name="proceso" value={formData.proceso}
                options={procesos} onChange={handleSelectChange} required
              />
              <SelectField
                label="Subproceso" name="subproceso" value={formData.subproceso}
                options={subprocesos} onChange={handleSelectChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción del Riesgo *</Label>
              <Textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} />
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-3 block text-muted-foreground">Clasificación (Flags)</Label>
              <div className="flex flex-wrap gap-6">
                {(["riesgoLaft", "riesgoOperativo", "riesgoLegal", "riesgoReputacional", "riesgoContagio"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} className="rounded border-input w-4 h-4" />
                    <span className="text-sm font-medium">{key.replace("riesgo", "")}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análisis cualitativo */}
        <Card>
          <CardHeader><CardTitle>Análisis Cualitativo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Factor de Riesgo" name="factorRiesgo" value={formData.factorRiesgo}
                options={factores} onChange={handleSelectChange}
              />
              <div className="space-y-1.5">
                <Label>Tipología</Label>
                <Input name="tipologia" value={formData.tipologia} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label>¿Qué puede suceder?</Label>
                <Textarea name="quePuedeSuceder" value={formData.quePuedeSuceder} onChange={handleChange} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>¿Por qué puede suceder?</Label>
                <Textarea name="porQuePuedeSuceder" value={formData.porQuePuedeSuceder} onChange={handleChange} rows={2} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Consecuencias</Label>
                <Textarea name="consecuencias" value={formData.consecuencias} onChange={handleChange} rows={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluación inherente */}
        <Card>
          <CardHeader><CardTitle>Evaluación Inherente</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <div className="space-y-1.5">
                <Label>Probabilidad Inherente</Label>
                <select
                  name="probabilidadInherente"
                  value={formData.probabilidadInherente}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>{PROB_LABELS[v]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Impacto Inherente</Label>
                <select
                  name="impactoInherente"
                  value={formData.impactoInherente}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  {[1, 2, 3, 4, 5].map((v) => (
                    <option key={v} value={v}>{IMP_LABELS[v]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Perfil Inherente</Label>
                <div className={`flex h-9 items-center px-3 rounded-md font-bold text-sm ${perfilInherente.color}`}>
                  {perfilInherente.label} ({formData.probabilidadInherente * formData.impactoInherente})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles */}
        {!isNew && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Controles Asociados</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowControlList(!showControlList)}>
                <Plus className="w-3 h-3" /> Añadir Control
              </Button>
            </CardHeader>
            <CardContent>
              {showControlList && (
                <div className="mb-4 border rounded-lg bg-muted/20 p-3">
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código o descripción..."
                      value={controlSearch}
                      onChange={(e) => setControlSearch(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-auto space-y-1">
                    {availableControles.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-3">Sin controles disponibles</p>
                    ) : (
                      availableControles.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleAddControl(c.id)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm flex items-center justify-between gap-2"
                        >
                          <span className="font-mono text-xs text-muted-foreground">{c.codigo}</span>
                          <span className="flex-1 truncate">{c.descripcion}</span>
                          <Badge variant="outline" className="shrink-0">{c.clase}</Badge>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {riesgoDB?.controles && riesgoDB.controles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Clase</TableHead>
                      <TableHead className="text-right">Ponderación</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riesgoDB.controles.map((rc) => (
                      <TableRow key={rc.controlId}>
                        <TableCell className="font-mono text-xs">{rc.control?.codigo}</TableCell>
                        <TableCell className="max-w-[280px] truncate">{rc.control?.descripcion}</TableCell>
                        <TableCell><Badge variant="outline">{rc.control?.clase}</Badge></TableCell>
                        <TableCell className="text-right font-medium">{((rc.control?.ponderacion ?? 0) * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveControl(rc.controlId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                  No hay controles asociados. Haga clic en "Añadir Control" para vincular.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
