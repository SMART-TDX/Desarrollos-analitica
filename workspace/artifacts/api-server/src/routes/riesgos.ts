import { Router } from "express";
import { db } from "@workspace/db";
import {
  riesgosTable,
  controlesTable,
  riesgosControlesTable,
  monitoreoTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function calcPerfil(prob: number | null, impacto: number | null): string {
  if (prob == null || impacto == null) return "";
  const score = prob * impacto;
  if (score <= 4) return "ACEPTABLE";
  if (score <= 9) return "TOLERABLE";
  if (score <= 14) return "MODERADO";
  if (score <= 19) return "ALTO";
  return "CRITICO";
}

async function calcPromedioEfectividad(riesgoId: number): Promise<number | null> {
  const links = await db
    .select({ ponderacion: controlesTable.ponderacion })
    .from(riesgosControlesTable)
    .innerJoin(controlesTable, eq(riesgosControlesTable.controlId, controlesTable.id))
    .where(eq(riesgosControlesTable.riesgoId, riesgoId));
  if (links.length === 0) return null;
  const sum = links.reduce((acc, l) => acc + (l.ponderacion ?? 0), 0);
  return sum / links.length;
}

function formatRiesgo(r: typeof riesgosTable.$inferSelect, promedio?: number | null) {
  return {
    ...r,
    perfilInherente: calcPerfil(r.probabilidadInherente, r.impactoInherente),
    perfilResidual: calcPerfil(r.probabilidadResidual, r.impactoResidual),
    promedioEfectividad: promedio ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// GET /riesgos
router.get("/riesgos", async (req, res) => {
  try {
    const rows = await db.select().from(riesgosTable).orderBy(riesgosTable.codigo);
    const result = await Promise.all(
      rows.map(async (r) => formatRiesgo(r, await calcPromedioEfectividad(r.id)))
    );
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /riesgos
router.post("/riesgos", async (req, res) => {
  try {
    const [created] = await db.insert(riesgosTable).values(req.body).returning();
    res.status(201).json(formatRiesgo(created, null));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /riesgos/:id
router.get("/riesgos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [riesgo] = await db.select().from(riesgosTable).where(eq(riesgosTable.id, id));
    if (!riesgo) return res.status(404).json({ error: "Not found" });

    const controlLinks = await db
      .select({
        controlId: riesgosControlesTable.controlId,
        riesgoId: riesgosControlesTable.riesgoId,
        orden: riesgosControlesTable.orden,
        control: controlesTable,
      })
      .from(riesgosControlesTable)
      .innerJoin(controlesTable, eq(riesgosControlesTable.controlId, controlesTable.id))
      .where(eq(riesgosControlesTable.riesgoId, id))
      .orderBy(riesgosControlesTable.orden);

    const monitoreos = await db
      .select()
      .from(monitoreoTable)
      .where(eq(monitoreoTable.riesgoId, id));

    const promedio = controlLinks.length > 0
      ? controlLinks.reduce((acc, l) => acc + (l.control.ponderacion ?? 0), 0) / controlLinks.length
      : null;

    res.json({
      ...formatRiesgo(riesgo, promedio),
      controles: controlLinks.map((l) => ({
        controlId: l.controlId,
        riesgoId: l.riesgoId,
        orden: l.orden,
        control: {
          ...l.control,
          createdAt: l.control.createdAt.toISOString(),
          updatedAt: l.control.updatedAt.toISOString(),
        },
      })),
      monitoreos: monitoreos.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /riesgos/:id
router.patch("/riesgos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(riesgosTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(riesgosTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(formatRiesgo(updated, await calcPromedioEfectividad(id)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /riesgos/:id
router.delete("/riesgos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(riesgosTable).where(eq(riesgosTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /riesgos/:riesgoId/controles
router.get("/riesgos/:riesgoId/controles", async (req, res) => {
  try {
    const riesgoId = parseInt(req.params.riesgoId);
    const links = await db
      .select({
        controlId: riesgosControlesTable.controlId,
        riesgoId: riesgosControlesTable.riesgoId,
        orden: riesgosControlesTable.orden,
        control: controlesTable,
      })
      .from(riesgosControlesTable)
      .innerJoin(controlesTable, eq(riesgosControlesTable.controlId, controlesTable.id))
      .where(eq(riesgosControlesTable.riesgoId, riesgoId))
      .orderBy(riesgosControlesTable.orden);

    res.json(links.map((l) => ({
      controlId: l.controlId,
      riesgoId: l.riesgoId,
      orden: l.orden,
      control: {
        ...l.control,
        createdAt: l.control.createdAt.toISOString(),
        updatedAt: l.control.updatedAt.toISOString(),
      },
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /riesgos/:riesgoId/controles
router.post("/riesgos/:riesgoId/controles", async (req, res) => {
  try {
    const riesgoId = parseInt(req.params.riesgoId);
    const { controlId, orden = 1 } = req.body;
    await db.insert(riesgosControlesTable).values({ riesgoId, controlId, orden });

    const [link] = await db
      .select({
        controlId: riesgosControlesTable.controlId,
        riesgoId: riesgosControlesTable.riesgoId,
        orden: riesgosControlesTable.orden,
        control: controlesTable,
      })
      .from(riesgosControlesTable)
      .innerJoin(controlesTable, eq(riesgosControlesTable.controlId, controlesTable.id))
      .where(
        and(
          eq(riesgosControlesTable.riesgoId, riesgoId),
          eq(riesgosControlesTable.controlId, controlId)
        )
      );

    res.status(201).json({
      controlId: link.controlId,
      riesgoId: link.riesgoId,
      orden: link.orden,
      control: {
        ...link.control,
        createdAt: link.control.createdAt.toISOString(),
        updatedAt: link.control.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /riesgos/:riesgoId/controles/:controlId
router.delete("/riesgos/:riesgoId/controles/:controlId", async (req, res) => {
  try {
    const riesgoId = parseInt(req.params.riesgoId);
    const controlId = parseInt(req.params.controlId);
    await db
      .delete(riesgosControlesTable)
      .where(
        and(
          eq(riesgosControlesTable.riesgoId, riesgoId),
          eq(riesgosControlesTable.controlId, controlId)
        )
      );
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
