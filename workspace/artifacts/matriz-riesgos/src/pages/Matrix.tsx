import { useState } from "react";
import { Link } from "wouter";
import { useGetRiesgos, useDeleteRiesgo, getGetRiesgosQueryKey } from "@workspace/api-client-react";
import { Button, Badge, Input, Card, CardContent } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Plus, Search, Edit, Trash2, ChevronRight, ChevronDown, Download, FileText } from "lucide-react";
import { formatPerfil, getPerfilColor, formatNumber } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";
import * as XLSX from "xlsx";

function RiskRow({ riesgo, onDelete }: { riesgo: any; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <React.Fragment>
      <TableRow className="group">
        <TableCell>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-mono text-xs">{riesgo.codigo}</TableCell>
        <TableCell className="max-w-[130px] truncate text-sm" title={riesgo.proceso}>{riesgo.proceso}</TableCell>
        <TableCell className="max-w-[200px] truncate text-sm" title={riesgo.descripcion}>{riesgo.descripcion}</TableCell>
        <TableCell>
          <div className="flex gap-1 flex-wrap w-[120px]">
            {riesgo.riesgoLaft && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">LAFT</span>}
            {riesgo.riesgoOperativo && <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">OP</span>}
            {riesgo.riesgoLegal && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">LEG</span>}
            {riesgo.riesgoReputacional && <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">REP</span>}
            {riesgo.riesgoContagio && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">CON</span>}
          </div>
        </TableCell>
        <TableCell className="text-center">{riesgo.probabilidadInherente}</TableCell>
        <TableCell className="text-center">{riesgo.impactoInherente}</TableCell>
        <TableCell>
          <Badge variant={getPerfilColor(riesgo.perfilInherente) as any}>
            {formatPerfil(riesgo.perfilInherente)}
          </Badge>
        </TableCell>
        <TableCell className="text-center font-medium">
          {formatNumber(riesgo.promedioEfectividad)}%
        </TableCell>
        <TableCell className="text-center">{formatNumber(riesgo.probabilidadResidual)}</TableCell>
        <TableCell className="text-center">{formatNumber(riesgo.impactoResidual)}</TableCell>
        <TableCell>
          <Badge variant={getPerfilColor(riesgo.perfilResidual) as any}>
            {formatPerfil(riesgo.perfilResidual)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Link href={`/matriz/${riesgo.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => { if (window.confirm(`¿Eliminar riesgo ${riesgo.codigo}?`)) onDelete(riesgo.id); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={13} className="p-4 border-b">
            <div className="pl-8">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Detalles Adicionales</h4>
              <div className="grid grid-cols-3 gap-6 text-sm mb-4">
                <div><span className="block text-xs text-muted-foreground mb-1">Subproceso</span>{riesgo.subproceso || "-"}</div>
                <div><span className="block text-xs text-muted-foreground mb-1">Factor de Riesgo</span>{riesgo.factorRiesgo || "-"}</div>
                <div><span className="block text-xs text-muted-foreground mb-1">Tipología</span>{riesgo.tipologia || "-"}</div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Qué puede suceder</span>
                  <p className="text-foreground/90">{riesgo.quePuedeSuceder || "-"}</p>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground mb-1">Por qué puede suceder</span>
                  <p className="text-foreground/90">{riesgo.porQuePuedeSuceder || "-"}</p>
                </div>
              </div>
              {riesgo.sugerencias && (
                <div className="mt-4 text-sm">
                  <span className="block text-xs text-muted-foreground mb-1">Sugerencias</span>
                  <p className="text-foreground/90">{riesgo.sugerencias}</p>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

function exportToExcel(riesgos: any[]) {
  const rows = riesgos.map((r) => ({
    "Código": r.codigo,
    "Proceso": r.proceso,
    "Subproceso": r.subproceso,
    "Factor de Riesgo": r.factorRiesgo,
    "Descripción": r.descripcion,
    "LAFT": r.riesgoLaft ? "Sí" : "No",
    "Operativo": r.riesgoOperativo ? "Sí" : "No",
    "Legal": r.riesgoLegal ? "Sí" : "No",
    "Reputacional": r.riesgoReputacional ? "Sí" : "No",
    "Contagio": r.riesgoContagio ? "Sí" : "No",
    "Tipología": r.tipologia,
    "Qué puede suceder": r.quePuedeSuceder,
    "Por qué puede suceder": r.porQuePuedeSuceder,
    "Consecuencias": r.consecuencias,
    "Prob. Inherente": r.probabilidadInherente,
    "Impacto Inherente": r.impactoInherente,
    "Perfil Inherente": r.perfilInherente,
    "Efectividad Controles (%)": r.promedioEfectividad != null ? (r.promedioEfectividad * 100).toFixed(1) : "",
    "Prob. Residual": r.probabilidadResidual,
    "Impacto Residual": r.impactoResidual,
    "Perfil Residual": r.perfilResidual,
    "Tipo Monitoreo": r.tipoMonitoreo,
    "Responsable Monitoreo": r.responsableMonitoreo,
    "Periodicidad Monitoreo": r.periodicidadMonitoreo,
    "Prioridad": r.prioridad,
    "Sugerencias": r.sugerencias,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 14 }, { wch: 28 }, { wch: 28 }, { wch: 18 }, { wch: 60 },
    { wch: 6 }, { wch: 10 }, { wch: 8 }, { wch: 13 }, { wch: 10 },
    { wch: 30 }, { wch: 45 }, { wch: 45 }, { wch: 40 },
    { wch: 14 }, { wch: 16 }, { wch: 16 },
    { wch: 22 },
    { wch: 13 }, { wch: 14 }, { wch: 14 },
    { wch: 30 }, { wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 50 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Matriz de Riesgos LAFT");

  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Matriz_Riesgos_LAFT_${today}.xlsx`);
  toast.success("Archivo Excel descargado");
}

function exportToPDF(riesgos: any[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) { toast.error("Permita las ventanas emergentes para exportar PDF"); return; }

  const rows = riesgos.map((r) => `
    <tr>
      <td>${r.codigo}</td>
      <td>${r.proceso || ""}</td>
      <td style="max-width:200px">${r.descripcion || ""}</td>
      <td style="text-align:center">${r.probabilidadInherente ?? ""}</td>
      <td style="text-align:center">${r.impactoInherente ?? ""}</td>
      <td style="text-align:center;font-weight:bold;background:${r.perfilInherente === "CRITICO" ? "#fca5a5" : r.perfilInherente === "ALTO" ? "#fed7aa" : r.perfilInherente === "MODERADO" ? "#fef08a" : r.perfilInherente === "TOLERABLE" ? "#d9f99d" : "#bbf7d0"}">${r.perfilInherente || ""}</td>
      <td style="text-align:center">${r.probabilidadResidual ?? ""}</td>
      <td style="text-align:center">${r.impactoResidual ?? ""}</td>
      <td style="text-align:center;font-weight:bold;background:${r.perfilResidual === "CRITICO" ? "#fca5a5" : r.perfilResidual === "ALTO" ? "#fed7aa" : r.perfilResidual === "MODERADO" ? "#fef08a" : r.perfilResidual === "TOLERABLE" ? "#d9f99d" : "#bbf7d0"}">${r.perfilResidual || ""}</td>
      <td>${r.prioridad || ""}</td>
    </tr>
  `).join("");

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Matriz de Riesgos LAFT — Smart Training Society SAS</title>
  <style>
    @page { size: A4 landscape; margin: 15mm; }
    body { font-family: Arial, sans-serif; font-size: 9px; color: #111; }
    h1 { font-size: 14px; margin-bottom: 4px; }
    p { font-size: 9px; color: #555; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e3a5f; color: white; padding: 5px 4px; text-align: left; font-size: 8px; border: 1px solid #1e3a5f; }
    td { padding: 4px; border: 1px solid #ddd; vertical-align: top; word-break: break-word; }
    tr:nth-child(even) td { background: #f8fafc; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>Matriz de Riesgos LAFT — Smart Training Society SAS</h1>
  <p>Generado el ${new Date().toLocaleDateString("es-CO")} · Total: ${riesgos.length} riesgo(s)</p>
  <table>
    <thead>
      <tr>
        <th>Código</th><th>Proceso</th><th>Descripción</th>
        <th>P.I.</th><th>I.I.</th><th>Perfil Inh.</th>
        <th>P.R.</th><th>I.R.</th><th>Perfil Res.</th>
        <th>Prioridad</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 400);
}

export default function Matrix() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: riesgos = [], isLoading } = useGetRiesgos(undefined, {
    query: { queryKey: getGetRiesgosQueryKey() },
  });

  const deleteMutation = useDeleteRiesgo();

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Riesgo eliminado");
        queryClient.invalidateQueries({ queryKey: getGetRiesgosQueryKey() });
      },
      onError: () => toast.error("Error al eliminar riesgo"),
    });
  };

  const filteredRiesgos = riesgos.filter(
    (r) =>
      r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.proceso.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Matriz de Riesgos</h1>
            <p className="text-muted-foreground text-sm mt-1">Vista consolidada de todos los riesgos evaluados.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportToPDF(filteredRiesgos)}
              disabled={filteredRiesgos.length === 0}
            >
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportToExcel(filteredRiesgos)}
              disabled={filteredRiesgos.length === 0}
            >
              <Download className="w-4 h-4" /> Excel
            </Button>
            <Link href="/matriz/nuevo">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Nuevo Riesgo
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, proceso o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchTerm && (
            <span className="text-sm text-muted-foreground">
              {filteredRiesgos.length} de {riesgos.length} riesgo(s)
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Cargando matriz...</div>
        ) : (
          <Card className="flex-1 flex flex-col min-h-0 border-0 shadow-none">
            <CardContent className="flex-1 p-0 overflow-auto">
              <Table className="min-w-[1200px] border-collapse relative">
                <TableHeader className="sticky top-0 bg-muted z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Proceso</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead className="text-center" title="Probabilidad Inherente">P.I.</TableHead>
                    <TableHead className="text-center" title="Impacto Inherente">I.I.</TableHead>
                    <TableHead>Perfil Inh.</TableHead>
                    <TableHead className="text-center">Efectividad</TableHead>
                    <TableHead className="text-center" title="Probabilidad Residual">P.R.</TableHead>
                    <TableHead className="text-center" title="Impacto Residual">I.R.</TableHead>
                    <TableHead>Perfil Res.</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRiesgos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="h-32 text-center text-muted-foreground">
                        No se encontraron riesgos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRiesgos.map((riesgo) => (
                      <RiskRow key={riesgo.id} riesgo={riesgo} onDelete={handleDelete} />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
