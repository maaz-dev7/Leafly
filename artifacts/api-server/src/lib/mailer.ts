import nodemailer from "nodemailer";
import { logger } from "./logger";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const t = getTransporter();
  if (!t) {
    logger.warn("Email notification skipped: GMAIL_USER / GMAIL_APP_PASSWORD not configured");
    return;
  }
  try {
    await t.sendMail({
      from: `Leafly <${process.env.GMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    logger.error({ err }, "Failed to send email notification");
  }
}
