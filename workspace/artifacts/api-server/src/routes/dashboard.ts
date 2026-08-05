import { Router } from "express";
import { db } from "@workspace/db";
import {
  riesgosTable,
  controlesTable,
  eventosRiesgoTable,
} from "@workspace/db";
import { count } from "drizzle-orm";

const router = Router();

function calcPerfil(prob: number | null, impacto: number | null): string {
  if (prob == null || impacto == null) return "SIN DATOS";
  const score = prob * impacto;
  if (score <= 4) return "ACEPTABLE";
  if (score <= 9) return "TOLERABLE";
  if (score <= 14) return "MODERADO";
  if (score <= 19) return "ALTO";
  return "CRITICO";
}

router.get("/dashboard/resumen", async (req, res) => {
  try {
    const [totalRiesgos] = await db.select({ count: count() }).from(riesgosTable);
    const [totalControles] = await db.select({ count: count() }).from(controlesTable);
    const riesgos = await db.select().from(riesgosTable);
    const eventos = await db.select().from(eventosRiesgoTable);

    const perfilMap = new Map<string, number>();
    for (const r of riesgos) {
      const perfil = calcPerfil(r.probabilidadResidual, r.impactoResidual);
      perfilMap.set(perfil, (perfilMap.get(perfil) ?? 0) + 1);
    }
    const riesgosPorPerfil = Array.from(perfilMap.entries()).map(([perfil, count]) => ({ perfil, count }));

    const procesoMap = new Map<string, number>();
    for (const r of riesgos) {
      const p = r.proceso || "Sin proceso";
      procesoMap.set(p, (procesoMap.get(p) ?? 0) + 1);
    }
    const riesgosPorProceso = Array.from(procesoMap.entries()).map(([proceso, count]) => ({ proceso, count }));

    const estadoMap = new Map<string, number>();
    for (const e of eventos) {
      const est = e.estado || "Sin estado";
      estadoMap.set(est, (estadoMap.get(est) ?? 0) + 1);
    }
    const eventosPorEstado = Array.from(estadoMap.entries()).map(([estado, count]) => ({ estado, count }));

    res.json({
      totalRiesgos: totalRiesgos.count,
      totalControles: totalControles.count,
      controlesActivos: totalControles.count,
      riesgosPorPerfil,
      riesgosPorProceso,
      eventosPorEstado,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/mapa-calor", async (req, res) => {
  try {
    const riesgos = await db.select().from(riesgosTable);
    const mapItem = (r: typeof riesgosTable.$inferSelect, tipo: "inherente" | "residual") => ({
      riesgoId: r.id,
      codigo: r.codigo,
      descripcion: r.descripcion,
      probabilidad: tipo === "inherente" ? (r.probabilidadInherente ?? 0) : (r.probabilidadResidual ?? 0),
      impacto: tipo === "inherente" ? (r.impactoInherente ?? 0) : (r.impactoResidual ?? 0),
      perfil: calcPerfil(
        tipo === "inherente" ? r.probabilidadInherente : r.probabilidadResidual,
        tipo === "inherente" ? r.impactoInherente : r.impactoResidual
      ),
    });
    res.json({
      inherente: riesgos.map((r) => mapItem(r, "inherente")),
      residual: riesgos.map((r) => mapItem(r, "residual")),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/mapa-calor-eventos", async (req, res) => {
  try {
    const eventos = await db.select().from(eventosRiesgoTable);
    const mapItem = (e: typeof eventosRiesgoTable.$inferSelect, tipo: "inherente" | "residual") => ({
      eventoId: e.id,
      codigo: e.codigoEvento,
      descripcion: e.descripcion,
      probabilidad: tipo === "inherente" ? (e.probabilidad ?? 0) : (e.probabilidadResidual ?? 0),
      impacto: tipo === "inherente" ? (e.impacto ?? 0) : (e.impactoResidual ?? 0),
      perfil: calcPerfil(
        tipo === "inherente" ? e.probabilidad : e.probabilidadResidual,
        tipo === "inherente" ? e.impacto : e.impactoResidual
      ),
      riesgoId: e.riesgoId,
      codigoRiesgo: e.codigoRiesgo,
    });
    res.json({
      inherente: eventos.map((e) => mapItem(e, "inherente")),
      residual: eventos.map((e) => mapItem(e, "residual")),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/cal", async (req, res) => {
  try {
    const riesgos = await db.select().from(riesgosTable).orderBy(riesgosTable.codigo);
    res.json(riesgos.map((r) => ({
      riesgoId: r.id,
      codigo: r.codigo,
      descripcion: r.descripcion,
      probInherente: r.probabilidadInherente,
      impactoInherente: r.impactoInherente,
      probResidual: r.probabilidadResidual,
      impactoResidual: r.impactoResidual,
      perfilInherente: calcPerfil(r.probabilidadInherente, r.impactoInherente),
      perfilResidual: calcPerfil(r.probabilidadResidual, r.impactoResidual),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
