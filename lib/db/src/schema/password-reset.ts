import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const passwordResetCodesTable = pgTable("password_reset_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPasswordResetCodeSchema = createInsertSchema(passwordResetCodesTable).omit({ id: true, createdAt: true });
export type InsertPasswordResetCode = z.infer<typeof insertPasswordResetCodeSchema>;
export type PasswordResetCode = typeof passwordResetCodesTable.$inferSelect;
