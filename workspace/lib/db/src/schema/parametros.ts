import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const parametrosTable = pgTable("parametros", {
  id: serial("id").primaryKey(),
  categoria: text("categoria").notNull(), // CLASE | TIPO | FRECUENCIA | FORMALIDAD
  nombre: text("nombre").notNull(),
  valor: real("valor").notNull(),
  descripcion: text("descripcion"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParametroSchema = createInsertSchema(parametrosTable).omit({ id: true, createdAt: true });
export type InsertParametro = z.infer<typeof insertParametroSchema>;
export type Parametro = typeof parametrosTable.$inferSelect;
