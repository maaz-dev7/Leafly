import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const myPlantsTable = pgTable("my_plants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  plantId: integer("plant_id").notNull(),
  plantName: text("plant_name").notNull(),
  plantImageUrl: text("plant_image_url"),
  health: text("health").notNull().default("Healthy"),
  lastWatered: timestamp("last_watered", { withTimezone: true }),
  lastFertilized: timestamp("last_fertilized", { withTimezone: true }),
  nextWaterDue: timestamp("next_water_due", { withTimezone: true }),
  wateringFrequencyDays: integer("watering_frequency_days").notNull().default(7),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMyPlantSchema = createInsertSchema(myPlantsTable).omit({ id: true, addedAt: true });
export type InsertMyPlant = z.infer<typeof insertMyPlantSchema>;
export type MyPlant = typeof myPlantsTable.$inferSelect;
