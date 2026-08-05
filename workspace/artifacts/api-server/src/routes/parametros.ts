import { Router } from "express";
import { db } from "@workspace/db";
import { parametrosTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/parametros", async (req, res) => {
  try {
    const rows = await db.select().from(parametrosTable).orderBy(parametrosTable.categoria, parametrosTable.nombre);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/parametros", async (req, res) => {
  try {
    const [created] = await db.insert(parametrosTable).values(req.body).returning();
    res.status(201).json({ ...created, createdAt: created.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/parametros/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(parametrosTable)
      .set(req.body)
      .where(eq(parametrosTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
