import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { serialize } from "../lib/serialize";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  ListOrdersResponse,
} from "@workspace/api-zod";

const DELIVERY_MAP: Record<string, string> = {
  lahore: "Estimated delivery: 2–4 working days",
};

function getDelivery(city: string): string {
  return DELIVERY_MAP[city.toLowerCase()] ?? "Estimated delivery: 7–9 working days";
}

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  let orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  const { status, city } = req.query as { status?: string; city?: string };
  if (status) orders = orders.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  if (city) orders = orders.filter((o) => o.city.toLowerCase() === city.toLowerCase());
  res.json(ListOrdersResponse.parse(serialize(orders)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { customerName, customerPhone, city, address, items } = parsed.data;
  const total = (items as any[]).reduce((sum: number, item: any) => {
    const addonTotal = (item.addons ?? []).reduce((s: number, a: any) => s + (a.price ?? 0), 0);
    return sum + item.price * item.quantity + addonTotal;
  }, 0);
  const deliveryEstimate = getDelivery(city);
  const userId = (req as any).user?.id ?? null;
  const [order] = await db
    .insert(ordersTable)
    .values({ customerName, customerPhone, city, address: address ?? null, items, total, status: "Confirmed", deliveryEstimate, userId })
    .returning();
  res.status(201).json(GetOrderResponse.parse(serialize(order)));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(GetOrderResponse.parse(serialize(order)));
});

router.patch("/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderStatusResponse.parse(serialize(order)));
});

export default router;
