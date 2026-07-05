import { eq } from "drizzle-orm";
import { db, contactSettingsTable } from "@workspace/db";

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
}

async function ensureRow() {
  const rows = await db.select().from(contactSettingsTable).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(contactSettingsTable).values({}).returning();
  return created;
}

export async function getContact(): Promise<ContactInfo> {
  const row = await ensureRow();
  return { email: row.email, phone: row.phone, address: row.address, hours: row.hours };
}

export async function setContact(updates: Partial<ContactInfo>): Promise<ContactInfo> {
  const row = await ensureRow();
  const [updated] = await db
    .update(contactSettingsTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(contactSettingsTable.id, row.id))
    .returning();
  return { email: updated.email, phone: updated.phone, address: updated.address, hours: updated.hours };
}
