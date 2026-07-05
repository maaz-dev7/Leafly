import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, passwordResetCodesTable } from "@workspace/db";
import { signToken, extractToken, verifyToken } from "../lib/auth";
import { serialize } from "../lib/serialize";
import { sendMail } from "../lib/mailer";
import {
  SignupBody,
  LoginBody,
  LoginResponse,
  GetMeResponse,
  ForgotPasswordBody,
  ResetPasswordBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(404).json({ error: "No account found with this email" });
    return;
  }
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db.insert(passwordResetCodesTable).values({ userId: user.id, code, expiresAt, used: false });
  void sendMail({
    to: user.email,
    subject: "Leafly password reset code",
    html: `<p>Hi ${user.name},</p><p>Your password reset code is:</p><h2>${code}</h2><p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
  });
  req.log.info({ userId: user.id }, "Password reset code generated");
  res.json({ message: "A verification code has been sent to your email" });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, code, newPassword } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(404).json({ error: "No account found with this email" });
    return;
  }
  const [resetCode] = await db
    .select()
    .from(passwordResetCodesTable)
    .where(
      and(
        eq(passwordResetCodesTable.userId, user.id),
        eq(passwordResetCodesTable.code, code),
        eq(passwordResetCodesTable.used, false),
        gt(passwordResetCodesTable.expiresAt, new Date()),
      ),
    )
    .orderBy(passwordResetCodesTable.createdAt);
  if (!resetCode) {
    res.status(400).json({ error: "Invalid or expired code" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  await db.update(passwordResetCodesTable).set({ used: true }).where(eq(passwordResetCodesTable.id, resetCode.id));
  res.json({ message: "Password has been reset successfully" });
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
