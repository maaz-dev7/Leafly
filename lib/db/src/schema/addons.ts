import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const addonsTable = pgTable("addons", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull().default(0),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAddonSchema = createInsertSchema(addonsTable).omit({ id: true, createdAt: true });
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Addon = typeof addonsTable.$inferSelect;
