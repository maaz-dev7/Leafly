import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bookingsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAuth";
import { serialize } from "../lib/serialize";
import {
  CreateBookingBody,
  GetBookingParams,
  GetBookingResponse,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
  UpdateBookingStatusResponse,
  ListBookingsResponse,
} from "@workspace/api-zod";

function generateRef(): string {
  return "LF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

const router: IRouter = Router();

router.get("/bookings", async (req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);
  res.json(ListBookingsResponse.parse(serialize(bookings)));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, phone, city, address, serviceType, preferredDate, paymentMethod, notes } = parsed.data;
  const userId = (req as any).user?.id ?? null;
  const bookingRef = generateRef();
  const [booking] = await db
    .insert(bookingsTable)
    .values({ name, phone, city, address, serviceType, preferredDate, paymentMethod, notes: notes ?? null, status: "pending", bookingRef, userId })
    .returning();
  res.status(201).json(GetBookingResponse.parse(serialize(booking)));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(GetBookingResponse.parse(serialize(booking)));
});

router.patch("/bookings/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(UpdateBookingStatusResponse.parse(serialize(booking)));
});

export default router;
