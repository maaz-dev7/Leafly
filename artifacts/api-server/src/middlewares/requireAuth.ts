import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractToken } from "../lib/auth";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as any).user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Admin authorization required" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  (req as any).user = payload;
  next();
}
