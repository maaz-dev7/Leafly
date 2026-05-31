import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, variantsTable } from "@workspace/db";
import {
  ListVariantsResponse,
  GetVariantParams,
  GetVariantResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/variants", async (_req, res): Promise<void> => {
  const variants = await db.select().from(variantsTable);
  res.json(ListVariantsResponse.parse(variants));
});

router.get("/variants/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [variant] = await db.select().from(variantsTable).where(eq(variantsTable.id, id));
  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }
  res.json(GetVariantResponse.parse(variant));
});

export default router;
