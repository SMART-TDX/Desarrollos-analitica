import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const controlesTable = pgTable("controles", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  clase: text("clase").notNull(),
  pesoClase: real("peso_clase"),
  tipo: text("tipo").notNull(),
  pesoTipo: real("peso_tipo"),
  frecuencia: text("frecuencia").notNull(),
  pesoFrecuencia: real("peso_frecuencia"),
  formalidad: text("formalidad").notNull(),
  pesoFormalidad: real("peso_formalidad"),
  soporte: text("soporte"),
  responsable: text("responsable"),
  ponderacion: real("ponderacion").default(0).notNull(),
  areas: text("areas").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertControlSchema = createInsertSchema(controlesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertControl = z.infer<typeof insertControlSchema>;
export type Control = typeof controlesTable.$inferSelect;
