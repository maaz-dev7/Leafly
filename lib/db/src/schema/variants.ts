import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const variantsTable = pgTable("variants", {
  id: serial("id").primaryKey(),
  color: text("color").notNull(),
  price: integer("price").notNull().default(0),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVariantSchema = createInsertSchema(variantsTable).omit({ id: true, createdAt: true });
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type Variant = typeof variantsTable.$inferSelect;
