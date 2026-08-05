import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";

// Claves de almacenamiento local
const PARAMETROS_KEY = "laft_parametros_v1";
const RIESGOS_KEY = "laft_riesgos_v1";
const CONTROLES_KEY = "laft_controles_v1";

// Datos por defecto si el localStorage está vacío
const DEFAULT_PROCESOS = [
  "GESTION ADMINISTRATIVA Y FINANCIERA",
  "Gestión Académica",
  "Gestión Comercial",
  "Gestión Humana",
  "Gestión Jurídica",
  "Gestión de Tecnología",
];

const DEFAULT_SUBPROCESOS = [
  "CARTERA",
  "COMERCIAL-TELEMERCADEO-VENTAS",
  "COMERCIAL-TELEMERCADEO-VENTAS-CORPORATIVO Y PERSONALIZADO-EXAMENES INTERNACIONALES-INSTITUTO-SMART ONLINE",
  "COMPRAS",
  "CONTABILIDAD",
  "INSTITUTO",
];

const DEFAULT_FACTORES = [
  "ALIADOS ESTRATÉGICOS",
  "CANALES DE DISTRIBUCIÓN",
  "Colaboradores",
  "EMPLEADOS",
  "ESTUDIANTES",
  "PRODUCTOS Y SERVICIOS",
  "PROVEEDORES",
  "TECNOLÓGICO",
];

const DEFAULT_CONTROLES = [
  { id: 1, codigo: "CTR-LAFT-01", descripcion: "Consulta en las listas para todas las personas...", clase: "PREVENTIVO", ponderacion: 0.425 },
  { id: 2, codigo: "CTR-LAFT-02", descripcion: "Aceptacion de clausula SAGRILAFT sobre...", clase: "PREVENTIVO", ponderacion: 0.425 },
  { id: 3, codigo: "CTR-LAFT-03", descripcion: "Aprobación por parte de gerencia para...", clase: "PREVENTIVO", ponderacion: 0.335 },
  { id: 4, codigo: "CTR-LAFT-04", descripcion: "Chequeo de información pública en medios...", clase: "PREVENTIVO", ponderacion: 0.425 },
  { id: 5, codigo: "CTR-LAFT-05", descripcion: "Validacion y causacion de recibos de caja...", clase: "DETECTIVO", ponderacion: 0.415 },
];

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

  // Listas locales
  const [procesos, setProcesos] = useState<string[]>([]);
  const [subprocesos, setSubprocesos] = useState<string[]>([]);
  const [factores, setFactores] = useState<string[]>([]);
  const [controlesDB, setControlesDB] = useState<any[]>([]);
  const [riesgosDB, setRiesgosDB] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    codigo: "", proceso: "", subproceso: "", factorRiesgo: "", descripcion: "",
    riesgoLaft: false, riesgoOperativo: false, riesgoLegal: false, riesgoReputacional: false, riesgoContagio: false,
    quePuedeSuceder: "", tipologia: "", porQuePuedeSuceder: "", consecuencias: "",
    probabilidadInherente: 1, impactoInherente: 1,
    tipoMonitoreo: "", responsableMonitoreo: "", periodicidadMonitoreo: "", prioridad: "", sugerencias: "",
    controles: [] as any[]
  });

  // Estado para la búsqueda de controles
  const [controlSearch, setControlSearch] = useState("");
  const [showControlList, setShowControlList] = useState(false);

  // Cargar listas y datos al iniciar
  useEffect(() => {
    // 1. Cargar Parámetros
    const savedParametros = localStorage.getItem(PARAMETROS_KEY);
    if (savedParametros) {
      try {
        const list: any[] = JSON.parse(savedParametros);
        setProcesos(list.filter(p => p.categoria === "PROCESO").map(p => p.nombre));
        setSubprocesos(list.filter(p => p.categoria === "SUBPROCESO").map(p => p.nombre));
        setFactores(list.filter(p => p.categoria === "FACTOR_RIESGO").map(p => p.nombre));
      } catch {
        setProcesos(DEFAULT_PROCESOS);
        setSubprocesos(DEFAULT_SUBPROCESOS);
        setFactores(DEFAULT_FACTORES);
      }
    } else {
      setProcesos(DEFAULT_PROCESOS);
      setSubprocesos(DEFAULT_SUBPROCESOS);
      setFactores(DEFAULT_FACTORES);
    }

    // 2. Cargar Catálogo de Controles
    const savedControles = localStorage.getItem(CONTROLES_KEY);
    if (savedControles) {
      try {
        setControlesDB(JSON.parse(savedControles));
      } catch {
        setControlesDB(DEFAULT_CONTROLES);
      }
    } else {
      setControlesDB(DEFAULT_CONTROLES);
      localStorage.setItem(CONTROLES_KEY, JSON.stringify(DEFAULT_CONTROLES));
    }

    // 3. Cargar Riesgos
    const savedRiesgos = localStorage.getItem(RIESGOS_KEY);
    let currentRiesgos: any[] = [];
    if (savedRiesgos) {
      try {
        currentRiesgos = JSON.parse(savedRiesgos);
      } catch {
        currentRiesgos = [];
      }
    }
    setRiesgosDB(currentRiesgos);

    // 4. Si se está editando un riesgo, poblar formData
    if (!isNew && id) {
      const found = currentRiesgos.find((r: any) => r.id === id);
      if (found) {
        setFormData({
          codigo: found.codigo || "",
          proceso: found.proceso || "",
          subproceso: found.subproceso || "",
          factorRiesgo: found.factorRiesgo || "",
          descripcion: found.descripcion || "",
          riesgoLaft: found.riesgoLaft || false,
          riesgoOperativo: found.riesgoOperativo || false,
          riesgoLegal: found.riesgoLegal || false,
          riesgoReputacional: found.riesgoReputacional || false,
          riesgoContagio: found.riesgoContagio || false,
          quePuedeSuceder: found.quePuedeSuceder || "",
          tipologia: found.tipologia || "",
          porQuePuedeSuceder: found.porQuePuedeSuceder || "",
          consecuencias: found.consecuencias || "",
          probabilidadInherente: found.probabilidadInherente || 1,
          impactoInherente: found.impactoInherente || 1,
          tipoMonitoreo: found.tipoMonitoreo || "",
          responsableMonitoreo: found.responsableMonitoreo || "",
          periodicidadMonitoreo: found.periodicidadMonitoreo || "",
          prioridad: found.prioridad || "",
          sugerencias: found.sugerencias || "",
          controles: found.controles || []
        });
      }
    } else {
      // Sugerencia de código para un nuevo riesgo
      const nextNum = currentRiesgos.length + 1;
      const codeStr = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
      setFormData(prev => ({ ...prev, codigo: `R-LAFT${codeStr}` }));
    }
  }, [isNew, id]);

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

    const savedRiesgos = localStorage.getItem(RIESGOS_KEY);
    let currentRiesgos: any[] = savedRiesgos ? JSON.parse(savedRiesgos) : [];

    if (isNew) {
      const newRisk = {
        ...formData,
        id: Date.now(),
        fechaCreacion: new Date().toISOString().split("T")[0]
      };
      currentRiesgos.push(newRisk);
      toast.success("Riesgo creado exitosamente");
    } else {
      currentRiesgos = currentRiesgos.map((r: any) =>
        r.id === id ? { ...r, ...formData } : r
      );
      toast.success("Riesgo actualizado exitosamente");
    }

    localStorage.setItem(RIESGOS_KEY, JSON.stringify(currentRiesgos));
    setLocation("/matriz");
  };

  const handleAddControl = (controlId: number) => {
    const controlObj = controlesDB.find(c => c.id === controlId);
    if (!controlObj) return;

    const newControlLink = {
      controlId: controlObj.id,
      control: controlObj
    };

    const updatedControles = [...formData.controles, newControlLink];
    setFormData(prev => ({ ...prev, controles: updatedControles }));

    // Si no es un riesgo nuevo, persistir de inmediato en localStorage
    if (!isNew && id) {
      const updatedRiesgos = riesgosDB.map((r: any) =>
        r.id === id ? { ...r, controles: updatedControles } : r
      );
      setRiesgosDB(updatedRiesgos);
      localStorage.setItem(RIESGOS_KEY, JSON.stringify(updatedRiesgos));
    }

    toast.success("Control añadido");
    setShowControlList(false);
    setControlSearch("");
  };

  const handleRemoveControl = (controlId: number) => {
    const updatedControles = formData.controles.filter(rc => rc.controlId !== controlId);
    setFormData(prev => ({ ...prev, controles: updatedControles }));

    if (!isNew && id) {
      const updatedRiesgos = riesgosDB.map((r: any) =>
        r.id === id ? { ...r, controles: updatedControles } : r
      );
      setRiesgosDB(updatedRiesgos);
      localStorage.setItem(RIESGOS_KEY, JSON.stringify(updatedRiesgos));
    }

    toast.success("Control desvinculado");
  };

  const linkedControlIds = new Set(formData.controles.map((rc: any) => rc.controlId));
  const availableControles = controlesDB.filter(
    (c: any) =>
      !linkedControlIds.has(c.id) &&
      (controlSearch === "" ||
        c.codigo?.toLowerCase().includes(controlSearch.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(controlSearch.toLowerCase()))
  );

  const perfilInherente = calcPerfil(formData.probabilidadInherente, formData.impactoInherente);

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
          <Button onClick={handleSave} className="gap-2">
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
                      availableControles.map((c: any) => (
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

              {formData.controles && formData.controles.length > 0 ? (
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
                    {formData.controles.map((rc: any) => (
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