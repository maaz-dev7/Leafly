import { Router, type IRouter } from "express";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, passwordResetCodesTable, emailVerifCodesTable } from "@workspace/db";
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
  InitiateSignupBody,
  VerifySignupBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /auth/initiate-signup
 * Step 1: store pending signup, email a verification code.
 */
router.post("/auth/initiate-signup", async (req, res): Promise<void> => {
  const parsed = InitiateSignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, city } = parsed.data;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "This email is already registered. Try signing in instead." });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db.insert(emailVerifCodesTable).values({ email, name, passwordHash, city: city ?? null, code, expiresAt, used: false });
  try {
    await sendMail({
      to: email,
      subject: "Your Leafly verification code",
      html: `<p>Hi ${name},</p><p>Welcome to Leafly! Your verification code is:</p><h2 style="letter-spacing:0.3em;color:#1B3D2A">${code}</h2><p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
    });
  } catch (err) {
    req.log.error({ err, email }, "Failed to send signup verification email");
    res.status(500).json({ error: "We couldn't send a verification email. Please try again in a moment." });
    return;
  }
  req.log.info({ email }, "Signup verification code sent");
  res.json({ message: "Verification code sent to your email." });
});

/**
 * POST /auth/resend-code
 * Re-sends a fresh verification code for a pending signup.
 */
router.post("/auth/resend-code", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required." });
    return;
  }
  // Make sure we have a pending (unused, not-yet-expired) entry
  const [pending] = await db
    .select()
    .from(emailVerifCodesTable)
    .where(
      and(
        eq(emailVerifCodesTable.email, email),
        eq(emailVerifCodesTable.used, false),
        gt(emailVerifCodesTable.expiresAt, new Date()),
      ),
    )
    .orderBy(emailVerifCodesTable.createdAt);
  if (!pending) {
    res.status(404).json({ error: "No pending signup found. Please start over." });
    return;
  }
  // Generate a fresh code and push the expiry forward
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await db
    .update(emailVerifCodesTable)
    .set({ code, expiresAt })
    .where(eq(emailVerifCodesTable.id, pending.id));
  try {
    await sendMail({
      to: email,
      subject: "Your new Leafly verification code",
      html: `<p>Hi ${pending.name},</p><p>Here is your new Leafly verification code:</p><h2 style="letter-spacing:0.3em;color:#1B3D2A">${code}</h2><p>This code expires in 15 minutes.</p>`,
    });
  } catch (err) {
    req.log.error({ err, email }, "Failed to resend verification email");
    res.status(500).json({ error: "We couldn't send the email. Please try again." });
    return;
  }
  req.log.info({ email }, "Verification code resent");
  res.json({ message: "A new code has been sent to your email." });
});

/**
 * POST /auth/verify-signup
 * Step 2: verify code, create the user, return auth token.
 */
router.post("/auth/verify-signup", async (req, res): Promise<void> => {
  const parsed = VerifySignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, code } = parsed.data;
  const [pending] = await db
    .select()
    .from(emailVerifCodesTable)
    .where(
      and(
        eq(emailVerifCodesTable.email, email),
        eq(emailVerifCodesTable.code, code),
        eq(emailVerifCodesTable.used, false),
        gt(emailVerifCodesTable.expiresAt, new Date()),
      ),
    )
    .orderBy(emailVerifCodesTable.createdAt);
  if (!pending) {
    res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
    return;
  }
  // Double-check email not registered between initiate and verify
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "This email is already registered. Try signing in." });
    return;
  }
  const [user] = await db
    .insert(usersTable)
    .values({ name: pending.name, email: pending.email, passwordHash: pending.passwordHash, city: pending.city, role: "user" })
    .returning();
  await db.update(emailVerifCodesTable).set({ used: true }).where(eq(emailVerifCodesTable.id, pending.id));
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.status(201).json(
    LoginResponse.parse(serialize({
      token,
      user: { id: user.id, name: user.name, email: user.email, city: user.city, role: user.role, createdAt: user.createdAt },
    }))
  );
});

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
