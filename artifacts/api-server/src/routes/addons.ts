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

export default router;
