import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, plantsTable } from "@workspace/db";
import { serialize } from "../lib/serialize";
import {
  ListPlantsQueryParams,
  GetPlantResponse,
  GetFeaturedPlantsResponse,
  GetPlantStatsResponse,
  ListPlantsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CITY_TAGS: Record<string, string[]> = {
  lahore: ["heat-tolerant", "drought-resistant", "flowering"],
  karachi: ["coastal", "humidity-tolerant", "tropical"],
  islamabad: ["cool-climate", "shade-tolerant", "ferns"],
  peshawar: ["arid", "xerophytic", "drought-resistant"],
  multan: ["hot-dry", "arid", "heat-tolerant"],
  rawalpindi: ["cool-climate", "shade-tolerant"],
};

router.get("/plants/featured", async (_req, res): Promise<void> => {
  const plants = await db
    .select()
    .from(plantsTable)
    .where(eq(plantsTable.isAvailable, true))
    .orderBy(sql`${plantsTable.price} DESC`)
    .limit(6);
  res.json(GetFeaturedPlantsResponse.parse(serialize(plants)));
});

router.get("/plants/stats", async (_req, res): Promise<void> => {
  const allPlants = await db.select().from(plantsTable);
  const available = allPlants.filter((p) => p.isAvailable).length;
  const categoryMap = new Map<string, number>();
  for (const p of allPlants) {
    categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1);
  }
  const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));
  res.json(GetPlantStatsResponse.parse({ total: allPlants.length, available, byCategory }));
});

router.get("/plants", async (req, res): Promise<void> => {
  const params = ListPlantsQueryParams.safeParse(req.query);
  let plants = await db.select().from(plantsTable).where(eq(plantsTable.isAvailable, true));

  const { category, city, difficulty, minPrice, maxPrice } = params.success ? params.data : {};

  if (category) plants = plants.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
  if (difficulty) plants = plants.filter((p) => p.difficulty.toLowerCase() === String(difficulty).toLowerCase());
  if (minPrice) plants = plants.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) plants = plants.filter((p) => p.price <= Number(maxPrice));
  if (city) {
    const tags = CITY_TAGS[String(city).toLowerCase()];
    if (tags) {
      plants = plants.filter((p) => tags.some((t) => p.climateTags.includes(t)));
    }
  }

  res.json(ListPlantsResponse.parse(serialize(plants)));
});

router.get("/plants/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [plant] = await db.select().from(plantsTable).where(eq(plantsTable.id, id));
  if (!plant) {
    res.status(404).json({ error: "Plant not found" });
    return;
  }
  res.json(GetPlantResponse.parse(serialize(plant)));
});

export default router;
