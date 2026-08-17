import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable } from "@workspace/db";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { verifyToken, extractToken } from "../lib/auth";
import { serialize } from "../lib/serialize";
import { sendMail } from "../lib/mailer";
import { getContact } from "../lib/contact-store";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  ListOrdersResponse,
} from "@workspace/api-zod";

// Delivery fees in PKR
const DELIVERY_FEES: Record<string, number> = {
  lahore: 250,
};
const DEFAULT_DELIVERY_FEE = 400;

function getDeliveryFee(city: string): number {
  return DELIVERY_FEES[city.toLowerCase()] ?? DEFAULT_DELIVERY_FEE;
}

const DELIVERY_ESTIMATES: Record<string, string> = {
  lahore: "Estimated delivery: 2–4 working days",
  karachi: "Estimated delivery: 4–6 working days",
  islamabad: "Estimated delivery: 3–5 working days",
};

function getDeliveryEstimate(city: string): string {
  return DELIVERY_ESTIMATES[city.toLowerCase()] ?? "Estimated delivery: 7–9 working days";
}

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  // Require a valid token — orders are private
  const rawToken = extractToken(req.headers.authorization);
  const user = rawToken ? verifyToken(rawToken) : null;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);

  // Admins see all orders; regular users see only orders matching their userId OR email
  if (user.role !== "admin") {
    orders = orders.filter(o =>
      o.userId === user.id ||
      (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
    );

    // Auto-link any orders matched purely by email so future lookups are faster
    const toLink = orders.filter(o => !o.userId && o.customerEmail?.toLowerCase() === user.email.toLowerCase());
    if (toLink.length > 0) {
      await Promise.all(
        toLink.map(o =>
          db.update(ordersTable).set({ userId: user.id }).where(eq(ordersTable.id, o.id))
        )
      );
    }
  }

  const { status, city } = req.query as { status?: string; city?: string };
  if (status) orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  if (city) orders = orders.filter(o => o.city.toLowerCase() === city.toLowerCase());
  res.json(ListOrdersResponse.parse(serialize(orders)));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message }); return;
  }
  const { customerName, customerPhone, city, address, paymentMethod, items } = parsed.data;
  const itemsTotal = (items as any[]).reduce((sum: number, item: any) => {
    const addonTotal = (item.addons ?? []).reduce((s: number, a: any) => s + (a.price ?? 0), 0);
    return sum + item.price * item.quantity + addonTotal;
  }, 0);
  const deliveryFee = getDeliveryFee(city);
  const total = itemsTotal + deliveryFee;
  const deliveryEstimate = getDeliveryEstimate(city);
  // Extract userId + email from token (if logged in) or fall back to request body email
  const rawToken = extractToken(req.headers.authorization);
  const tokenUser = rawToken ? verifyToken(rawToken) : null;
  const userId = tokenUser?.id ?? null;
  const customerEmail = tokenUser?.email ?? (parsed.data as any).customerEmail ?? null;
  const [order] = await db
    .insert(ordersTable)
    .values({ customerName, customerPhone, city, address, paymentMethod, items, total, status: "Confirmed", deliveryEstimate, userId, customerEmail })
    .returning();
  res.status(201).json(GetOrderResponse.parse(serialize(order)));

  const contact = await getContact();
  const itemsHtml = (items as any[])
    .map((i) => `<li>${i.quantity} × ${i.plantName ?? "Item"} — Rs. ${i.price}${(i.addons ?? []).length ? ` (+ ${i.addons.map((a: any) => a.name).join(", ")})` : ""}</li>`)
    .join("");
  void sendMail({
    to: contact.email,
    subject: `New Leafly Order #${order.id} — Rs. ${total.toLocaleString()}`,
    html: `
      <h2>New order received</h2>
      <p><strong>Customer:</strong> ${customerName} (${customerPhone})</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Payment method:</strong> ${paymentMethod === "online" ? "Online (Card)" : "Cash on Delivery"}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Delivery fee:</strong> Rs. ${deliveryFee}</p>
      <p><strong>Total:</strong> Rs. ${total.toLocaleString()}</p>
    `,
  });
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(GetOrderResponse.parse(serialize(order)));
});

router.patch("/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [order] = await db.update(ordersTable).set({ status: parsed.data.status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(UpdateOrderStatusResponse.parse(serialize(order)));
});

export default router;
