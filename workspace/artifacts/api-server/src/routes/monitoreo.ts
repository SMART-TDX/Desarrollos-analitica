import { Router } from "express";
import { db } from "@workspace/db";
import { monitoreoTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(m: typeof monitoreoTable.$inferSelect) {
  return { ...m, createdAt: m.createdAt.toISOString(), updatedAt: m.updatedAt.toISOString() };
}

router.get("/monitoreo", async (req, res) => {
  try {
    const rows = await db.select().from(monitoreoTable).orderBy(monitoreoTable.codigo);
    res.json(rows.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/monitoreo", async (req, res) => {
  try {
    const [created] = await db.insert(monitoreoTable).values(req.body).returning();
    res.status(201).json(fmt(created));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/monitoreo/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(monitoreoTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(monitoreoTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(fmt(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/monitoreo/:id", async (req, res) => {
  try {
    await db.delete(monitoreoTable).where(eq(monitoreoTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
