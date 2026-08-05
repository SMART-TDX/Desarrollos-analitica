import { pgTable, serial, text, real, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { riesgosTable } from "./riesgos";

export const eventosRiesgoTable = pgTable("eventos_riesgo", {
  id: serial("id").primaryKey(),
  fechaEvento: date("fecha_evento"),
  codigoEvento: text("codigo_evento").notNull(),
  tipoEvento: text("tipo_evento").notNull(),
  descripcion: text("descripcion").notNull(),
  tipoIncidencia: text("tipo_incidencia"),
  // Inherente
  probabilidad: real("probabilidad").notNull(),
  impacto: real("impacto").notNull(),
  nivelEvento: real("nivel_evento").notNull(),
  // Residual
  probabilidadResidual: real("probabilidad_residual"),
  impactoResidual: real("impacto_residual"),
  nivelResidual: real("nivel_residual"),
  riesgoId: integer("riesgo_id").references(() => riesgosTable.id, { onDelete: "set null" }),
  codigoRiesgo: text("codigo_riesgo"),
  estado: text("estado"),
  controles: text("controles").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventosSagrilafTable = pgTable("eventos_sagrilaf", {
  id: serial("id").primaryKey(),
  codigo: text("codigo").notNull(),
  tipo: text("tipo").notNull(),
  factor: text("factor").notNull(),
  etapa: text("etapa").notNull(),
  evento: text("evento").notNull(),
  probabilidad: real("probabilidad").notNull(),
  impacto: real("impacto").notNull(),
  nivel: real("nivel").notNull(),
  apetito: real("apetito"),
  brecha: real("brecha"),
  estado: text("estado"),
  efectividadControl: real("efectividad_control"),
  controlesTipicos: text("controles_tipicos"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventoRiesgoSchema = createInsertSchema(eventosRiesgoTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEventoSagrilafSchema = createInsertSchema(eventosSagrilafTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEventoRiesgo = z.infer<typeof insertEventoRiesgoSchema>;
export type InsertEventoSagrilaf = z.infer<typeof insertEventoSagrilafSchema>;
export type EventoRiesgo = typeof eventosRiesgoTable.$inferSelect;
export type EventoSagrilaf = typeof eventosSagrilafTable.$inferSelect;
