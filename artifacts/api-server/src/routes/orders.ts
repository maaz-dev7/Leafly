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

  // Build URLs
  const domain = process.env.REPLIT_DEV_DOMAIN;
  const siteUrl = domain ? `https://${domain}/leafly` : "https://leafly.replit.app";
  const trackUrl = `${siteUrl}/orders`;

  // 1. Notify store admin
  const contact = await getContact();
  const adminItemsHtml = (items as any[])
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
      <ul>${adminItemsHtml}</ul>
      <p><strong>Delivery fee:</strong> Rs. ${deliveryFee}</p>
      <p><strong>Total:</strong> Rs. ${total.toLocaleString()}</p>
    `,
  });

  // 2. Send thank-you email to customer (if email is available)
  if (customerEmail) {
    const itemRowsHtml = (items as any[]).map((i: any) => {
      const addonTotal = (i.addons ?? []).reduce((s: number, a: any) => s + (a.price ?? 0), 0);
      const lineTotal = (i.price + addonTotal) * i.quantity;
      const addonNote = i.addons?.length ? `<span style="color:#6B8F3E;font-size:12px;"> + ${i.addons.map((a: any) => a.name).join(", ")}</span>` : "";
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8F1E4;color:#1B3D2A;font-size:14px;">
            <strong>${i.quantity} × ${i.plantName ?? "Item"}</strong>${addonNote}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #E8F1E4;color:#1B3D2A;font-size:14px;text-align:right;font-weight:600;">
            Rs. ${lineTotal.toLocaleString()}
          </td>
        </tr>`;
    }).join("");

    void sendMail({
      to: customerEmail,
      subject: `🌿 Your Leafly Order #${order.id} is confirmed!`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7FAF4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7FAF4;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,61,42,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1B3D2A 0%,#4A7C3F 100%);padding:36px 40px;text-align:center;">
            <div style="font-family:'Georgia',serif;font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:1px;">🌿 Leafly</div>
            <div style="color:#A8D5A2;font-size:13px;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Plant Delivery & Care</div>
          </td>
        </tr>

        <!-- Thank you message -->
        <tr>
          <td style="padding:36px 40px 24px;text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">🎉</div>
            <h1 style="margin:0 0 8px;font-size:24px;color:#1B3D2A;font-family:'Georgia',serif;">Thank you, ${customerName.split(" ")[0]}!</h1>
            <p style="margin:0;color:#4A7C3F;font-size:15px;">Your order has been received and is being prepared with care.</p>
          </td>
        </tr>

        <!-- Order ID badge -->
        <tr>
          <td style="padding:0 40px 28px;text-align:center;">
            <div style="display:inline-block;background:#F0F7EE;border:2px solid #6B8F3E;border-radius:12px;padding:14px 32px;">
              <div style="color:#6B8F3E;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Order ID</div>
              <div style="color:#1B3D2A;font-size:28px;font-weight:800;font-family:'Georgia',serif;">#${order.id}</div>
            </div>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:0 40px 8px;">
            <div style="background:#F7FAF4;border-radius:12px;padding:20px 24px;">
              <div style="color:#1B3D2A;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Order Summary</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRowsHtml}
                <tr>
                  <td style="padding:10px 0;color:#6B8F3E;font-size:13px;">Delivery fee (${city})</td>
                  <td style="padding:10px 0;color:#6B8F3E;font-size:13px;text-align:right;">Rs. ${deliveryFee.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0 4px;color:#1B3D2A;font-size:16px;font-weight:800;border-top:2px solid #E8F1E4;">Total</td>
                  <td style="padding:14px 0 4px;color:#1B3D2A;font-size:16px;font-weight:800;text-align:right;border-top:2px solid #E8F1E4;">Rs. ${total.toLocaleString()}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Delivery estimate -->
        <tr>
          <td style="padding:20px 40px;">
            <div style="background:#EEF7EB;border-left:4px solid #4A7C3F;border-radius:8px;padding:14px 18px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:20px;">🚚</span>
              <div>
                <div style="color:#1B3D2A;font-weight:600;font-size:14px;">${deliveryEstimate}</div>
                <div style="color:#4A7C3F;font-size:12px;margin-top:2px;">Payment: ${paymentMethod === "online" ? "Online (Card)" : "Cash on Delivery"}</div>
              </div>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 40px 36px;text-align:center;">
            <a href="${trackUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B3D2A,#4A7C3F);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;">
              🌿 Track Your Order
            </a>
            <p style="margin:14px 0 0;color:#9DB8A0;font-size:12px;">You can also find your order by searching for <strong>#${order.id}</strong> on the Track Order page.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F0F7EE;padding:20px 40px;text-align:center;border-top:1px solid #D4EACB;">
            <p style="margin:0;color:#6B8F3E;font-size:12px;">Questions? Reply to this email or visit <a href="${siteUrl}/contact" style="color:#1B3D2A;font-weight:600;text-decoration:none;">leafly.pk/contact</a></p>
            <p style="margin:8px 0 0;color:#9DB8A0;font-size:11px;">© ${new Date().getFullYear()} Leafly Pakistan · Pakistan's #1 Plant Delivery Platform</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  }
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
