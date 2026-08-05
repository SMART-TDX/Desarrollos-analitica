import { Router } from "express";
import { db } from "@workspace/db";
import { medicionesTable, calificacionesRiesgoTable, riesgosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function calcCalificacion(resultado: number): string {
  if (resultado <= 4) return "ACEPTABLE";
  if (resultado <= 9) return "TOLERABLE";
  if (resultado <= 14) return "MODERADO";
  if (resultado <= 19) return "ALTO";
  return "CRITICO";
}

router.get("/mediciones", async (req, res) => {
  try {
    const rows = await db.select().from(medicionesTable).orderBy(medicionesTable.fechaMedicion);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/mediciones", async (req, res) => {
  try {
    const [created] = await db.insert(medicionesTable).values(req.body).returning();
    res.status(201).json({ ...created, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/mediciones/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(medicionesTable)
      .set(req.body)
      .where(eq(medicionesTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mediciones/:id/calificaciones", async (req, res) => {
  try {
    const medicionId = parseInt(req.params.id);
    const rows = await db
      .select({
        id: calificacionesRiesgoTable.id,
        medicionId: calificacionesRiesgoTable.medicionId,
        riesgoId: calificacionesRiesgoTable.riesgoId,
        probabilidad: calificacionesRiesgoTable.probabilidad,
        impacto: calificacionesRiesgoTable.impacto,
        resultado: calificacionesRiesgoTable.resultado,
        calificacion: calificacionesRiesgoTable.calificacion,
        tipoCalificacion: calificacionesRiesgoTable.tipoCalificacion,
        codigoRiesgo: riesgosTable.codigo,
        descripcionRiesgo: riesgosTable.descripcion,
      })
      .from(calificacionesRiesgoTable)
      .innerJoin(riesgosTable, eq(calificacionesRiesgoTable.riesgoId, riesgosTable.id))
      .where(eq(calificacionesRiesgoTable.medicionId, medicionId));
    res.json(rows);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/mediciones/:id/calificaciones", async (req, res) => {
  try {
    const medicionId = parseInt(req.params.id);
    const { riesgoId, probabilidad, impacto, tipoCalificacion } = req.body;
    const resultado = probabilidad * impacto;
    const calificacion = calcCalificacion(resultado);

    const existing = await db
      .select()
      .from(calificacionesRiesgoTable)
      .where(
        and(
          eq(calificacionesRiesgoTable.medicionId, medicionId),
          eq(calificacionesRiesgoTable.riesgoId, riesgoId),
          eq(calificacionesRiesgoTable.tipoCalificacion, tipoCalificacion ?? "INHERENTE")
        )
      );

    let row;
    if (existing.length > 0) {
      [row] = await db
        .update(calificacionesRiesgoTable)
        .set({ probabilidad, impacto, resultado, calificacion })
        .where(eq(calificacionesRiesgoTable.id, existing[0].id))
        .returning();
    } else {
      [row] = await db
        .insert(calificacionesRiesgoTable)
        .values({ medicionId, riesgoId, probabilidad, impacto, resultado, calificacion, tipoCalificacion: tipoCalificacion ?? "INHERENTE" })
        .returning();
    }

    const [riesgo] = await db.select().from(riesgosTable).where(eq(riesgosTable.id, riesgoId));
    res.json({
      ...row,
      codigoRiesgo: riesgo?.codigo ?? "",
      descripcionRiesgo: riesgo?.descripcion ?? "",
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
