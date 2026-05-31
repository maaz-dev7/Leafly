import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { signToken, extractToken, verifyToken } from "../lib/auth";
import { serialize } from "../lib/serialize";
import { SignupBody, LoginBody, LoginResponse, GetMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, city } = parsed.data;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash, city: city ?? null, role: "user" })
    .returning();
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json(
    LoginResponse.parse(serialize({
      token,
      user: { id: user.id, name: user.name, email: user.email, city: user.city, role: user.role, createdAt: user.createdAt },
    }))
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json(
    LoginResponse.parse(serialize({
      token,
      user: { id: user.id, name: user.name, email: user.email, city: user.city, role: user.role, createdAt: user.createdAt },
    }))
  );
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.id));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json(GetMeResponse.parse(serialize({ id: user.id, name: user.name, email: user.email, city: user.city, role: user.role, createdAt: user.createdAt })));
});

export default router;
