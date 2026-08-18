import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactSettingsTable = pgTable("contact_settings", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().default("info@leafly.pk"),
  phone: text("phone").notNull().default("+92 300 123 4567"),
  address: text("address").notNull().default("123 Garden Street, Model Town, Lahore, Pakistan"),
  hours: text("hours").notNull().default("Mon–Sat, 9am–6pm PKT"),
  addressLink: text("address_link").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactSettingsSchema = createInsertSchema(contactSettingsTable).omit({ id: true, updatedAt: true });
export type InsertContactSettings = z.infer<typeof insertContactSettingsSchema>;
export type ContactSettings = typeof contactSettingsTable.$inferSelect;
