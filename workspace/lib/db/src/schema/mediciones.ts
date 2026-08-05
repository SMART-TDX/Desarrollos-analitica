import { pgTable, serial, text, real, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { riesgosTable } from "./riesgos";

export const medicionesTable = pgTable("mediciones", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull(), // INHERENTE | RESIDUAL
  fechaMedicion: date("fecha_medicion").notNull(),
  numParticipantes: integer("num_participantes").default(1).notNull(),
  rangoMaximoApetito: real("rango_maximo_apetito"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calificacionesRiesgoTable = pgTable("calificaciones_riesgo", {
  id: serial("id").primaryKey(),
  medicionId: integer("medicion_id").notNull().references(() => medicionesTable.id, { onDelete: "cascade" }),
  riesgoId: integer("riesgo_id").notNull().references(() => riesgosTable.id, { onDelete: "cascade" }),
  probabilidad: real("probabilidad").notNull(),
  impacto: real("impacto").notNull(),
  resultado: real("resultado").notNull(),
  calificacion: text("calificacion").notNull(),
  tipoCalificacion: text("tipo_calificacion").notNull().default("INHERENTE"),
});

export const insertMedicionSchema = createInsertSchema(medicionesTable).omit({ id: true, createdAt: true });
export const insertCalificacionSchema = createInsertSchema(calificacionesRiesgoTable).omit({ id: true });
export type InsertMedicion = z.infer<typeof insertMedicionSchema>;
export type InsertCalificacion = z.infer<typeof insertCalificacionSchema>;
export type Medicion = typeof medicionesTable.$inferSelect;
export type CalificacionRiesgo = typeof calificacionesRiesgoTable.$inferSelect;
