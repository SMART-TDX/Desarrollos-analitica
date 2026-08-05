import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { riesgosTable } from "./riesgos";

export const monitoreoTable = pgTable("monitoreo", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull(),
  aspectoMonitorear: text("aspecto_monitorear").notNull(),
  indicador: text("indicador"),
  periodicidad: text("periodicidad"),
  responsable: text("responsable"),
  riesgoId: integer("riesgo_id").references(() => riesgosTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMonitoreoSchema = createInsertSchema(monitoreoTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMonitoreo = z.infer<typeof insertMonitoreoSchema>;
export type Monitoreo = typeof monitoreoTable.$inferSelect;
