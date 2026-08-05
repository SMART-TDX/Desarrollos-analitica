import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { riesgosTable } from "./riesgos";
import { controlesTable } from "./controles";

export const riesgosControlesTable = pgTable("riesgos_controles", {
  riesgoId: integer("riesgo_id").notNull().references(() => riesgosTable.id, { onDelete: "cascade" }),
  controlId: integer("control_id").notNull().references(() => controlesTable.id, { onDelete: "cascade" }),
  orden: integer("orden").default(1).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.riesgoId, table.controlId] }),
}));

export type RiesgoControl = typeof riesgosControlesTable.$inferSelect;
