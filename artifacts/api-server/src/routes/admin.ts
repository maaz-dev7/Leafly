import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, plantsTable, variantsTable, ordersTable, bookingsTable, usersTable, addonsTable, insertAddonSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAuth";
import { signToken } from "../lib/auth";
import { serialize } from "../lib/serialize";
import { getContact, setContact } from "../lib/contact-store";
import {
  AdminLoginBody,
  AdminLoginResponse,
  GetAdminDashboardResponse,
  AdminCreatePlantBody,
  AdminUpdatePlantBody,
  AdminUpdatePlantResponse,
  AdminDeletePlantParams,
  AdminTogglePlantParams,
  AdminTogglePlantResponse,
  AdminCreateVariantBody,
  AdminUpdateVariantBody,
  AdminUpdateVariantResponse,
  AdminDeleteVariantParams,
  AdminListPlantsResponse,
} from "@workspace/api-zod";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "leafly2024";

const router: IRouter = Router();

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { username, password } = parsed.data;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid admin credentials" }); return;
  }
  const token = signToken({ id: 0, email: "admin@leafly.com", role: "admin" });
  res.json(AdminLoginResponse.parse(serialize({
    token,
    user: { id: 0, name: "Admin", email: "admin@leafly.com", city: null, role: "admin", createdAt: new Date().toISOString() },
  })));
});

// ─── Dashboard ───────────────────────────────────────────────────────────────

router.get("/admin/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const [totalPlants, totalOrders, totalBookings, totalUsers, recentOrders, recentBookings] = await Promise.all([
    db.select().from(plantsTable).then(r => r.length),
    db.select().from(ordersTable).then(r => r.length),
    db.select().from(bookingsTable).then(r => r.length),
    db.select().from(usersTable).then(r => r.length),
    db.select().from(ordersTable).orderBy(ordersTable.createdAt).limit(5),
    db.select().from(bookingsTable).orderBy(bookingsTable.createdAt).limit(5),
  ]);
  const allOrders = await db.select().from(ordersTable);
  const revenueTotal = allOrders.reduce((s, o) => s + o.total, 0);
  res.json(GetAdminDashboardResponse.parse(serialize({ totalPlants, totalOrders, totalBookings, totalUsers, revenueTotal, recentOrders, recentBookings })));
});

// ─── Plants ──────────────────────────────────────────────────────────────────

router.get("/admin/plants", requireAdmin, async (_req, res): Promise<void> => {
  const plants = await db.select().from(plantsTable).orderBy(plantsTable.id);
  res.json(AdminListPlantsResponse.parse(serialize(plants)));
});

router.post("/admin/plants", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreatePlantBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [plant] = await db.insert(plantsTable).values(parsed.data as any).returning();
  res.status(201).json(serialize(plant));
});

router.patch("/admin/plants/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AdminUpdatePlantBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [plant] = await db.update(plantsTable).set(parsed.data as any).where(eq(plantsTable.id, id)).returning();
  if (!plant) { res.status(404).json({ error: "Plant not found" }); return; }
  res.json(AdminUpdatePlantResponse.parse(serialize(plant)));
});

router.delete("/admin/plants/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(plantsTable).where(eq(plantsTable.id, id));
  res.sendStatus(204);
});

router.patch("/admin/plants/:id/toggle", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [existing] = await db.select().from(plantsTable).where(eq(plantsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Plant not found" }); return; }
  const [plant] = await db.update(plantsTable).set({ isAvailable: !existing.isAvailable }).where(eq(plantsTable.id, id)).returning();
  res.json(AdminTogglePlantResponse.parse(serialize(plant)));
});

// ─── Variants ────────────────────────────────────────────────────────────────

router.post("/admin/variants", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminCreateVariantBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [variant] = await db.insert(variantsTable).values(parsed.data as any).returning();
  res.status(201).json(serialize(variant));
});

router.patch("/admin/variants/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = AdminUpdateVariantBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [variant] = await db.update(variantsTable).set(parsed.data as any).where(eq(variantsTable.id, id)).returning();
  if (!variant) { res.status(404).json({ error: "Variant not found" }); return; }
  res.json(AdminUpdateVariantResponse.parse(serialize(variant)));
});

router.delete("/admin/variants/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(variantsTable).where(eq(variantsTable.id, id));
  res.sendStatus(204);
});

// ─── Accessories (Addons) ────────────────────────────────────────────────────

router.get("/admin/addons", requireAdmin, async (_req, res): Promise<void> => {
  const addons = await db.select().from(addonsTable).orderBy(addonsTable.id);
  res.json(serialize(addons));
});

router.post("/admin/addons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = insertAddonSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: String(parsed.error) }); return; }
  const [addon] = await db.insert(addonsTable).values(parsed.data as any).returning();
  res.status(201).json(serialize(addon));
});

router.patch("/admin/addons/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = insertAddonSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: String(parsed.error) }); return; }
  const [addon] = await db.update(addonsTable).set(parsed.data as any).where(eq(addonsTable.id, id)).returning();
  if (!addon) { res.status(404).json({ error: "Addon not found" }); return; }
  res.json(serialize(addon));
});

router.delete("/admin/addons/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(addonsTable).where(eq(addonsTable.id, id));
  res.sendStatus(204);
});

router.get("/admin/contact", requireAdmin, async (_req, res): Promise<void> => {
  res.json(await getContact());
});

router.patch("/admin/contact", requireAdmin, async (req, res): Promise<void> => {
  const { email, phone, address, hours } = req.body ?? {};
  const updates: Record<string, string> = {};
  if (typeof email === "string") updates.email = email;
  if (typeof phone === "string") updates.phone = phone;
  if (typeof address === "string") updates.address = address;
  if (typeof hours === "string") updates.hours = hours;
  const updated = await setContact(updates);
  res.json(updated);
});

// Public contact endpoint
router.get("/contact", async (_req, res): Promise<void> => {
  res.json(await getContact());
});

export default router;
