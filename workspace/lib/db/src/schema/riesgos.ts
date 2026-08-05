import { pgTable, serial, text, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riesgosTable = pgTable("riesgos", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  proceso: text("proceso").notNull(),
  subproceso: text("subproceso"),
  factorRiesgo: text("factor_riesgo"),
  descripcion: text("descripcion").notNull(),
  riesgoLaft: boolean("riesgo_laft").default(false).notNull(),
  riesgoOperativo: boolean("riesgo_operativo").default(false).notNull(),
  riesgoLegal: boolean("riesgo_legal").default(false).notNull(),
  riesgoReputacional: boolean("riesgo_reputacional").default(false).notNull(),
  riesgoContagio: boolean("riesgo_contagio").default(false).notNull(),
  quePuedeSuceder: text("que_puede_suceder"),
  tipologia: text("tipologia"),
  porQuePuedeSuceder: text("por_que_puede_suceder"),
  consecuencias: text("consecuencias"),
  probabilidadInherente: real("probabilidad_inherente"),
  impactoInherente: real("impacto_inherente"),
  probabilidadResidual: real("probabilidad_residual"),
  impactoResidual: real("impacto_residual"),
  tipoMonitoreo: text("tipo_monitoreo"),
  responsableMonitoreo: text("responsable_monitoreo"),
  periodicidadMonitoreo: text("periodicidad_monitoreo"),
  prioridad: text("prioridad"),
  sugerencias: text("sugerencias"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRiesgoSchema = createInsertSchema(riesgosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRiesgo = z.infer<typeof insertRiesgoSchema>;
export type Riesgo = typeof riesgosTable.$inferSelect;
