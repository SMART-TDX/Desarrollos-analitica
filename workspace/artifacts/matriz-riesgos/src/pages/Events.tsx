import { useState } from "react";
import {
  useGetEventos, useGetEventosSagrilaf, useCreateEvento, useCreateEventoSagrilaf,
  useDeleteEvento, useDeleteEventoSagrilaf, useGetRiesgos,
  getGetEventosQueryKey, getGetEventosSagrilafQueryKey, getGetRiesgosQueryKey,
} from "@workspace/api-client-react";
import { Badge, Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X, Trash2 } from "lucide-react";

const PROB_LABELS_EVENTO: Record<number, string> = {
  1: "1 — Raro",
  2: "2 — Improbable",
  3: "3 — Posible",
  4: "4 — Probable",
  5: "5 — Casi certeza",
};

const IMP_LABELS: Record<number, string> = {
  1: "1 — Insignificante",
  2: "2 — Menor",
  3: "3 — Moderado",
  4: "4 — Mayor",
  5: "5 — Catastrófico",
};

function perfilLabel(p: number | null, i: number | null): { label: string; color: string } {
  if (!p || !i) return { label: "—", color: "" };
  const s = p * i;
  if (s <= 4) return { label: "ACEPTABLE", color: "bg-green-100 text-green-800" };
  if (s <= 9) return { label: "TOLERABLE", color: "bg-yellow-100 text-yellow-800" };
  if (s <= 14) return { label: "MODERADO", color: "bg-orange-100 text-orange-800" };
  if (s <= 19) return { label: "ALTO", color: "bg-red-100 text-red-800" };
  return { label: "CRITICO", color: "bg-red-200 text-red-900" };
}

function Select({ name, value, options, onChange, placeholder = "-- Seleccione --" }: {
  name: string; value: string | number; options: { value: string | number; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; placeholder?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Eventos de Riesgo Tab ──────────────────────────────────────────────────────
function EventosRiesgoTab() {
  const queryClient = useQueryClient();
  const { data: eventos = [], isLoading } = useGetEventos({ query: { queryKey: getGetEventosQueryKey() } });
  const { data: riesgos = [] } = useGetRiesgos(undefined, { query: { queryKey: getGetRiesgosQueryKey() } });
  const createMutation = useCreateEvento();
  const deleteMutation = useDeleteEvento();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigoEvento: "", tipoEvento: "LAFT", descripcion: "", tipoIncidencia: "",
    probabilidad: 1, impacto: 1, probabilidadResidual: 1, impactoResidual: 1,
    riesgoId: "", estado: "Abierto", fechaEvento: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["probabilidad", "impacto", "probabilidadResidual", "impactoResidual", "riesgoId"];
    setForm((p) => ({ ...p, [name]: numFields.includes(name) ? (value === "" ? "" : Number(value)) : value }));
  };

  const handleSubmit = () => {
    if (!form.codigoEvento || !form.descripcion) {
      toast.error("Complete Código y Descripción");
      return;
    }
    const data: any = {
      ...form,
      riesgoId: form.riesgoId ? parseInt(String(form.riesgoId)) : null,
      probabilidad: Number(form.probabilidad),
      impacto: Number(form.impacto),
      probabilidadResidual: Number(form.probabilidadResidual),
      impactoResidual: Number(form.impactoResidual),
    };
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast.success("Evento de riesgo registrado");
        queryClient.invalidateQueries({ queryKey: getGetEventosQueryKey() });
        setShowForm(false);
        setForm({ codigoEvento: "", tipoEvento: "LAFT", descripcion: "", tipoIncidencia: "", probabilidad: 1, impacto: 1, probabilidadResidual: 1, impactoResidual: 1, riesgoId: "", estado: "Abierto", fechaEvento: new Date().toISOString().split("T")[0] });
      },
      onError: () => toast.error("Error al registrar evento"),
    });
  };

  const handleDelete = (id: number, codigo: string) => {
    if (!confirm(`¿Eliminar evento ${codigo}?`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => { toast.success("Evento eliminado"); queryClient.invalidateQueries({ queryKey: getGetEventosQueryKey() }); },
      onError: () => toast.error("Error al eliminar"),
    });
  };

  const inherentePerfil = perfilLabel(form.probabilidad, form.impacto);
  const residualPerfil = perfilLabel(form.probabilidadResidual, form.impactoResidual);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Añadir Evento de Riesgo"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-3"><CardTitle className="text-base">Nuevo Evento de Riesgo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Código del Evento *</Label>
                <Input name="codigoEvento" value={form.codigoEvento} onChange={handleChange} placeholder="EVT-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Evento</Label>
                <Select name="tipoEvento" value={form.tipoEvento} onChange={handleChange}
                  options={["LAFT", "OPERATIVO", "LEGAL", "REPUTACIONAL"].map((v) => ({ value: v, label: v }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha</Label>
                <Input name="fechaEvento" type="date" value={form.fechaEvento} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descripción *</Label>
              <Textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de Incidencia</Label>
                <Input name="tipoIncidencia" value={form.tipoIncidencia} onChange={handleChange} />
              </div>
              <div className="space-y-1.5">
                <Label>Riesgo Asociado</Label>
                <Select name="riesgoId" value={form.riesgoId} onChange={handleChange}
                  options={riesgos.map((r) => ({ value: r.id, label: `${r.codigo} — ${r.descripcion.slice(0, 50)}` }))}
                  placeholder="-- Sin asociar --" />
              </div>
            </div>

            {/* Inherente */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Calificación Inherente</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Probabilidad</Label>
                  <Select name="probabilidad" value={form.probabilidad} onChange={handleChange}
                    options={[1,2,3,4,5].map((v) => ({ value: v, label: PROB_LABELS_EVENTO[v] }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Impacto</Label>
                  <Select name="impacto" value={form.impacto} onChange={handleChange}
                    options={[1,2,3,4,5].map((v) => ({ value: v, label: IMP_LABELS[v] }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Perfil</Label>
                  <div className={`flex h-9 items-center px-3 rounded-md font-bold text-sm ${inherentePerfil.color}`}>
                    {inherentePerfil.label} ({Number(form.probabilidad) * Number(form.impacto)})
                  </div>
                </div>
              </div>
            </div>

            {/* Residual */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Calificación Residual</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Probabilidad Residual</Label>
                  <Select name="probabilidadResidual" value={form.probabilidadResidual} onChange={handleChange}
                    options={[1,2,3,4,5].map((v) => ({ value: v, label: PROB_LABELS_EVENTO[v] }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Impacto Residual</Label>
                  <Select name="impactoResidual" value={form.impactoResidual} onChange={handleChange}
                    options={[1,2,3,4,5].map((v) => ({ value: v, label: IMP_LABELS[v] }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Perfil Residual</Label>
                  <div className={`flex h-9 items-center px-3 rounded-md font-bold text-sm ${residualPerfil.color}`}>
                    {residualPerfil.label} ({Number(form.probabilidadResidual) * Number(form.impactoResidual)})
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select name="estado" value={form.estado} onChange={handleChange}
                  options={["Abierto", "En seguimiento", "Cerrado", "Prioritario"].map((v) => ({ value: v, label: v }))} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>Guardar Evento</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando eventos...</div>
      ) : eventos.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-md mt-2">No hay eventos de riesgo registrados.</div>
      ) : (
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>P.I.</TableHead><TableHead>I.I.</TableHead><TableHead>Perfil Inh.</TableHead>
                <TableHead>P.R.</TableHead><TableHead>I.R.</TableHead><TableHead>Perfil Res.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.map((ev) => {
                const pi = perfilLabel(ev.probabilidad, ev.impacto);
                const pr = perfilLabel(ev.probabilidadResidual ?? null, ev.impactoResidual ?? null);
                return (
                  <TableRow key={ev.id}>
                    <TableCell className="text-xs">{ev.fechaEvento ? new Date(ev.fechaEvento).toLocaleDateString("es-CO") : "-"}</TableCell>
                    <TableCell className="font-mono text-xs">{ev.codigoEvento}</TableCell>
                    <TableCell><Badge variant="outline">{ev.tipoEvento}</Badge></TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm" title={ev.descripcion}>{ev.descripcion}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{ev.codigoRiesgo || "—"}</TableCell>
                    <TableCell className="text-center">{ev.probabilidad}</TableCell>
                    <TableCell className="text-center">{ev.impacto}</TableCell>
                    <TableCell><span className={`px-2 py-0.5 rounded text-xs font-bold ${pi.color}`}>{pi.label}</span></TableCell>
                    <TableCell className="text-center">{ev.probabilidadResidual ?? "—"}</TableCell>
                    <TableCell className="text-center">{ev.impactoResidual ?? "—"}</TableCell>
                    <TableCell><span className={`px-2 py-0.5 rounded text-xs font-bold ${pr.color}`}>{pr.label}</span></TableCell>
                    <TableCell><Badge variant="outline">{ev.estado || "Abierto"}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(ev.id, ev.codigoEvento)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Eventos SAGRILAF Tab ───────────────────────────────────────────────────────
function EventosSagrilafTab() {
  const queryClient = useQueryClient();
  const { data: eventos = [], isLoading } = useGetEventosSagrilaf({ query: { queryKey: getGetEventosSagrilafQueryKey() } });
  const createMutation = useCreateEventoSagrilaf();
  const deleteMutation = useDeleteEventoSagrilaf();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "",
    probabilidad: 1, impacto: 1, nivel: 1, apetito: 2, brecha: 0,
    estado: "Prioritario", efectividadControl: 0, controlesTipicos: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ["probabilidad", "impacto", "nivel", "apetito", "brecha", "efectividadControl"];
    setForm((p) => {
      const newForm = { ...p, [name]: numFields.includes(name) ? Number(value) : value };
      if (name === "probabilidad" || name === "impacto") {
        newForm.nivel = Number(newForm.probabilidad) * Number(newForm.impacto);
        newForm.brecha = Math.max(0, newForm.nivel - Number(newForm.apetito));
      }
      return newForm;
    });
  };

  const handleSubmit = () => {
    if (!form.codigo || !form.evento) { toast.error("Complete Código y Evento"); return; }
    createMutation.mutate({ data: form as any }, {
      onSuccess: () => {
        toast.success("Evento SAGRILAFT registrado (fecha de creación auto-asignada)");
        queryClient.invalidateQueries({ queryKey: getGetEventosSagrilafQueryKey() });
        setShowForm(false);
        setForm({ codigo: "", tipo: "LAFT", factor: "CLI", etapa: "VIN", evento: "", probabilidad: 1, impacto: 1, nivel: 1, apetito: 2, brecha: 0, estado: "Prioritario", efectividadControl: 0, controlesTipicos: "" });
      },
      onError: () => toast.error("Error al registrar evento"),
    });
  };

  const handleDelete = (id: number, codigo: string) => {
    if (!confirm(`¿Eliminar ${codigo}?`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => { toast.success("Eliminado"); queryClient.invalidateQueries({ queryKey: getGetEventosSagrilafQueryKey() }); },
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancelar" : "Añadir Evento SAGRILAFT"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardHeader className="pb-3"><CardTitle className="text-base">Nuevo Evento SAGRILAFT</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Código *</Label>
                <Input name="codigo" value={form.codigo} onChange={handleChange} placeholder="EVENT-20" />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select name="tipo" value={form.tipo} onChange={handleChange}
                  options={["LAFT","REP","OPE","TEC","LEG"].map((v) => ({ value: v, label: v }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Factor</Label>
                <Select name="factor" value={form.factor} onChange={handleChange}
                  options={[{value:"CLI",label:"CLI - Cliente"},{value:"EMP",label:"EMP - Empleado"},{value:"PRV",label:"PRV - Proveedor"},{value:"TEC",label:"TEC - Tecnológico"},{value:"OTR",label:"OTR - Otro"}]} />
              </div>
              <div className="space-y-1.5">
                <Label>Etapa</Label>
                <Select name="etapa" value={form.etapa} onChange={handleChange}
                  options={[{value:"VIN",label:"VIN - Vinculación"},{value:"MON",label:"MON - Monitoreo"},{value:"CON",label:"CON - Contratación"},{value:"PER",label:"PER - Permanencia"},{value:"OPE",label:"OPE - Operación"}]} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descripción del Evento *</Label>
              <Textarea name="evento" value={form.evento} onChange={handleChange} rows={2} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Probabilidad (1-5)</Label>
                <Select name="probabilidad" value={form.probabilidad} onChange={handleChange}
                  options={[1,2,3,4,5].map((v) => ({ value: v, label: PROB_LABELS_EVENTO[v] }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Impacto (1-5)</Label>
                <Select name="impacto" value={form.impacto} onChange={handleChange}
                  options={[1,2,3,4,5].map((v) => ({ value: v, label: IMP_LABELS[v] }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Nivel (auto)</Label>
                <div className="flex h-9 items-center px-3 rounded-md bg-muted/50 text-sm font-mono">{form.nivel}</div>
              </div>
              <div className="space-y-1.5">
                <Label>Apetito de Riesgo</Label>
                <Input name="apetito" type="number" min={1} max={25} value={form.apetito} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select name="estado" value={form.estado} onChange={handleChange}
                  options={["Prioritario","En seguimiento","Controlado","Cerrado"].map((v) => ({ value: v, label: v }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Controles Típicos</Label>
                <Input name="controlesTipicos" value={form.controlesTipicos} onChange={handleChange} placeholder="Ej. Validación listas, DD..." />
              </div>
            </div>
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded px-3 py-2">
              📅 La <strong>fecha de creación</strong> se asignará automáticamente al guardar.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando eventos SAGRILAFT...</div>
      ) : eventos.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-md mt-2">No hay eventos SAGRILAFT registrados.</div>
      ) : (
        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Factor</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>P</TableHead><TableHead>I</TableHead><TableHead>Nivel</TableHead>
                <TableHead>Apetito</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="font-mono text-xs">{ev.codigo}</TableCell>
                  <TableCell><Badge variant="outline">{ev.tipo}</Badge></TableCell>
                  <TableCell className="text-xs">{ev.factor}</TableCell>
                  <TableCell className="text-xs">{ev.etapa}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm" title={ev.evento}>{ev.evento}</TableCell>
                  <TableCell className="text-center">{ev.probabilidad}</TableCell>
                  <TableCell className="text-center">{ev.impacto}</TableCell>
                  <TableCell className="text-center font-bold">{ev.nivel}</TableCell>
                  <TableCell className="text-center">{ev.apetito ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline">{ev.estado || "Activo"}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {ev.fechaCreacion ? new Date(ev.fechaCreacion).toLocaleDateString("es-CO") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(ev.id, ev.codigo)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function Events() {
  const [activeTab, setActiveTab] = useState<"riesgo" | "sagrilaf">("riesgo");
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-6 border-b pb-0">
        <h1 className="text-2xl font-bold text-foreground mb-1">Registro de Eventos</h1>
        <p className="text-muted-foreground text-sm mb-6">Base de datos de materialización de riesgos e incidencias LAFT.</p>
        <div className="flex border-b">
          {(["riesgo", "sagrilaf"] as const).map((tab) => (
            <button key={tab}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "riesgo" ? "Eventos de Riesgo" : "Eventos SAGRILAFT"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === "riesgo" ? <EventosRiesgoTab /> : <EventosSagrilafTab />}
      </div>
    </div>
  );
}
