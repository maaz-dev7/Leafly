import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

/** Temporary storage for pending signups awaiting email verification */
export const emailVerifCodesTable = pgTable("email_verif_codes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  city: text("city"),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
