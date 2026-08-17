import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, addonsTable } from "@workspace/db";
import { ListAddonsQueryParams, ListAddonsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/addons", async (req, res): Promise<void> => {
  const params = ListAddonsQueryParams.safeParse(req.query);
  let addons = await db.select().from(addonsTable);
  if (params.success && params.data.type) {
    addons = addons.filter((a) => a.type === params.data.type);
  }
  res.json(ListAddonsResponse.parse(addons));
});

router.get("/addons/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [addon] = await db.select().from(addonsTable).where(eq(addonsTable.id, id));
  if (!addon) { res.status(404).json({ error: "Accessory not found" }); return; }
  res.json(addon);
});

export default router;
