import { Router } from "express";
import { db } from "@workspace/db";
import { eventosRiesgoTable, eventosSagrilafTable, riesgosTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmtEvento(e: typeof eventosRiesgoTable.$inferSelect) {
  return { ...e, createdAt: e.createdAt.toISOString(), updatedAt: e.updatedAt.toISOString() };
}
function fmtSagrilaf(e: typeof eventosSagrilafTable.$inferSelect) {
  return {
    ...e,
    fechaCreacion: e.fechaCreacion.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

// ── Eventos de Riesgo ──────────────────────────────────────────────────────────
router.get("/eventos", async (req, res) => {
  try {
    const rows = await db.select().from(eventosRiesgoTable).orderBy(eventosRiesgoTable.codigoEvento);
    res.json(rows.map(fmtEvento));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/eventos", async (req, res) => {
  try {
    const { probabilidad, impacto, probabilidadResidual, impactoResidual, riesgoId } = req.body;

    // Auto-resolve codigoRiesgo if riesgoId provided
    let codigoRiesgo = req.body.codigoRiesgo;
    if (riesgoId && !codigoRiesgo) {
      const [r] = await db.select({ codigo: riesgosTable.codigo }).from(riesgosTable).where(eq(riesgosTable.id, riesgoId));
      codigoRiesgo = r?.codigo ?? "";
    }

    const nivelEvento = (probabilidad ?? 0) * (impacto ?? 0);
    const nivelResidual = probabilidadResidual && impactoResidual ? probabilidadResidual * impactoResidual : null;

    const body = {
      ...req.body,
      codigoRiesgo,
      nivelEvento,
      nivelResidual,
    };
    const [created] = await db.insert(eventosRiesgoTable).values(body).returning();
    res.status(201).json(fmtEvento(created));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/eventos/:id", async (req, res) => {
  try {
    const updates: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
    if (req.body.probabilidad != null && req.body.impacto != null) {
      updates.nivelEvento = req.body.probabilidad * req.body.impacto;
    }
    if (req.body.probabilidadResidual != null && req.body.impactoResidual != null) {
      updates.nivelResidual = req.body.probabilidadResidual * req.body.impactoResidual;
    }
    const [updated] = await db
      .update(eventosRiesgoTable)
      .set(updates)
      .where(eq(eventosRiesgoTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(fmtEvento(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/eventos/:id", async (req, res) => {
  try {
    await db.delete(eventosRiesgoTable).where(eq(eventosRiesgoTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Eventos SAGRILAF ───────────────────────────────────────────────────────────
router.get("/eventos-sagrilaf", async (req, res) => {
  try {
    const rows = await db.select().from(eventosSagrilafTable).orderBy(eventosSagrilafTable.codigo);
    res.json(rows.map(fmtSagrilaf));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/eventos-sagrilaf", async (req, res) => {
  try {
    const body = {
      ...req.body,
      nivel: req.body.nivel ?? (req.body.probabilidad ?? 0) * (req.body.impacto ?? 0),
      fechaCreacion: new Date(),
    };
    const [created] = await db.insert(eventosSagrilafTable).values(body).returning();
    res.status(201).json(fmtSagrilaf(created));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/eventos-sagrilaf/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(eventosSagrilafTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(eventosSagrilafTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(fmtSagrilaf(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/eventos-sagrilaf/:id", async (req, res) => {
  try {
    await db.delete(eventosSagrilafTable).where(eq(eventosSagrilafTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
