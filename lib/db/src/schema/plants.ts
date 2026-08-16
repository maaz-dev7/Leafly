import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const plantsTable = pgTable("plants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  scientificName: text("scientific_name").notNull(),
  category: text("category").notNull(),
  size: text("size"),
  price: integer("price").notNull().default(0),
  difficulty: text("difficulty").notNull().default("Easy"),
  climateTags: text("climate_tags").array().notNull().default([]),
  imageUrl: text("image_url").notNull().default("https://placehold.co/400x400/1D9E75/white?text=Leafly"),
  images: text("images").array().notNull().default([]),
  description: text("description"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPlantSchema = createInsertSchema(plantsTable).omit({ id: true, createdAt: true });
export type InsertPlant = z.infer<typeof insertPlantSchema>;
export type Plant = typeof plantsTable.$inferSelect;
