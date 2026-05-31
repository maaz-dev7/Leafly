import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, savedPlantsTable, plantsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { serialize } from "../lib/serialize";
import { SavePlantBody, GetSavedPlantsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users/saved-plants", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const saved = await db.select().from(savedPlantsTable).where(eq(savedPlantsTable.userId, userId));
  const plantIds = saved.map((s) => s.plantId);
  if (plantIds.length === 0) {
    res.json([]);
    return;
  }
  const plants = await db.select().from(plantsTable).where(eq(plantsTable.isAvailable, true));
  const result = plants.filter((p) => plantIds.includes(p.id));
  res.json(GetSavedPlantsResponse.parse(serialize(result)));
});

router.post("/users/saved-plants", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const parsed = SavePlantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { plantId } = parsed.data;
  const [existing] = await db.select().from(savedPlantsTable).where(and(eq(savedPlantsTable.userId, userId), eq(savedPlantsTable.plantId, plantId)));
  if (existing) {
    res.status(409).json({ error: "Already saved" });
    return;
  }
  await db.insert(savedPlantsTable).values({ userId, plantId });
  res.status(201).json({ ok: true });
});

router.delete("/users/saved-plants/:plantId", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).user.id;
  const raw = Array.isArray(req.params.plantId) ? req.params.plantId[0] : req.params.plantId;
  const plantId = parseInt(raw, 10);
  await db.delete(savedPlantsTable).where(and(eq(savedPlantsTable.userId, userId), eq(savedPlantsTable.plantId, plantId)));
  res.sendStatus(204);
});

export default router;
