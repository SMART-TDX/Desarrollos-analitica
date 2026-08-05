import { Router } from "express";
import { db } from "@workspace/db";
import { controlesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(c: typeof controlesTable.$inferSelect) {
  return { ...c, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() };
}

// GET /controles
router.get("/controles", async (req, res) => {
  try {
    const rows = await db.select().from(controlesTable).orderBy(controlesTable.codigo);
    res.json(rows.map(fmt));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /controles
router.post("/controles", async (req, res) => {
  try {
    const [created] = await db.insert(controlesTable).values(req.body).returning();
    res.status(201).json(fmt(created));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /controles/:id
router.get("/controles/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(controlesTable).where(eq(controlesTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(fmt(row));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /controles/:id
router.patch("/controles/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(controlesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(controlesTable.id, parseInt(req.params.id)))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(fmt(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /controles/:id
router.delete("/controles/:id", async (req, res) => {
  try {
    await db.delete(controlesTable).where(eq(controlesTable.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
