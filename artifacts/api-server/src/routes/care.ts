import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, myPlantsTable, plantsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { serialize } from "../lib/serialize";
import {
  AddMyPlantBody,
  MarkWateredParams,
  MarkWateredResponse,
  MarkFertilizedParams,
  MarkFertilizedResponse,
  RemoveMyPlantParams,
  ListMyPlantsResponse,
} from "@workspace/api-zod";

function computeHealth(lastWatered: Date | null, frequencyDays: number): string {
  if (!lastWatered) return "Needs Water";
  const now = new Date();
  const daysSince = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > frequencyDays) return "Needs Water";
  if (daysSince > frequencyDays * 0.8) return "Check Sunlight";
  return "Healthy";
}

const router: IRouter = Router();

router.get("/care/my-plants", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const plants = await db.select().from(myPlantsTable).where(eq(myPlantsTable.userId, userId));
  res.json(ListMyPlantsResponse.parse(serialize(plants)));
});

router.post("/care/my-plants", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const parsed = AddMyPlantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { plantId, wateringFrequencyDays } = parsed.data;
  const [plant] = await db.select().from(plantsTable).where(eq(plantsTable.id, plantId));
  if (!plant) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }
  const freq = wateringFrequencyDays ?? 7;
  const nextWaterDue = new Date(Date.now() + freq * 24 * 60 * 60 * 1000);
  const [myPlant] = await db
    .insert(myPlantsTable)
    .values({
      userId,
      plantId,
      plantName: plant.name,
      plantImageUrl: plant.imageUrl,
      health: "Healthy",
      lastWatered: null,
      lastFertilized: null,
      nextWaterDue,
      wateringFrequencyDays: freq,
    })
    .returning();
  res.status(201).json(serialize(myPlant));
});

router.patch("/care/my-plants/:id/water", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [existing] = await db.select().from(myPlantsTable).where(and(eq(myPlantsTable.id, id), eq(myPlantsTable.userId, userId)));
  if (!existing) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }
  const now = new Date();
  const nextWaterDue = new Date(now.getTime() + existing.wateringFrequencyDays * 24 * 60 * 60 * 1000);
  const [updated] = await db
    .update(myPlantsTable)
    .set({ lastWatered: now, nextWaterDue, health: "Healthy" })
    .where(eq(myPlantsTable.id, id))
    .returning();
  res.json(MarkWateredResponse.parse(serialize(updated)));
});

router.patch("/care/my-plants/:id/fertilize", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [existing] = await db.select().from(myPlantsTable).where(and(eq(myPlantsTable.id, id), eq(myPlantsTable.userId, userId)));
  if (!existing) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }
  const [updated] = await db
    .update(myPlantsTable)
    .set({ lastFertilized: new Date() })
    .where(eq(myPlantsTable.id, id))
    .returning();
  res.json(MarkFertilizedResponse.parse(serialize(updated)));
});

router.delete("/care/my-plants/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(myPlantsTable).where(and(eq(myPlantsTable.id, id), eq(myPlantsTable.userId, userId)));
  res.sendStatus(204);
});

export default router;
