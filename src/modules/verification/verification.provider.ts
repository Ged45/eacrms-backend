import { BrevoClient } from "@getbrevo/brevo";
import { hasPostmark, sendViaPostmark } from "../../lib/postmark";
import { normalizePhoneNumber } from "../../utils/phone";

/**
 * ─── Lazy-initialised clients ────────────────────────────────────────────────
 * Clients are only created when their env vars are present so the app
 * boots fine in dev/test without real credentials.
 */

function getBrevoClient(): BrevoClient | null {
  const key = process.env.BREVO_API_KEY;
  if (!key) return null;
  return new BrevoClient({ apiKey: key });
}

/**
 * AfroMessage SMS API base URL.
 */
const AFRO_API_BASE = "https://api.afromessage.com/api";

async function sendAfroSms(
  afro: { apiKey: string; senderId?: string },
  to: string,
  message: string,
): Promise<void> {
  const body: Record<string, string> = { to, message };
  if (afro.senderId) body.sender = afro.senderId;

  const response = await fetch(`${AFRO_API_BASE}/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${afro.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(data.message ?? `HTTP ${response.status}`);
  }
}

function getAfroConfig() {
  const apiKey  = process.env.AFRO_API_KEY;
  const senderId = process.env.AFRO_SENDER_ID || undefined;
  if (!apiKey) return null;
  return { apiKey, senderId };
}

// ─── Email HTML template ──────────────────────────────────────────────────────

function buildEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:40px 0;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="background:#1a56db;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">EACRMS</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;">Ethiopian Athletics Club Registration & Management System</p>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;color:#111;">Verify your email address</h2>
        <p style="color:#555;margin:0 0 24px;">
          Use the code below to verify your account. It expires in <strong>24 hours</strong>.
        </p>
        <div style="background:#f0f4ff;border:2px dashed #1a56db;border-radius:8px;
                    padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1a56db;">
            ${code}
          </span>
        </div>
        <p style="color:#888;font-size:13px;margin:0;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

function buildPasswordResetEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:40px 0;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
      <div style="background:#1a56db;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">EACRMS</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;">Ethiopian Athletics Club Registration & Management System</p>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;color:#111;">Reset your password</h2>
        <p style="color:#555;margin:0 0 24px;">
          Use the code below to reset your password. It expires in <strong>1 hour</strong>.
        </p>
        <div style="background:#f0f4ff;border:2px dashed #1a56db;border-radius:8px;
                    padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1a56db;">
            ${code}
          </span>
        </div>
        <p style="color:#888;font-size:13px;margin:0;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const notificationProvider = {
  /**
  * Send email verification code via Brevo.
  * Falls back to Postmark, then console logging in development.
   */
  async sendEmailVerification(email: string, code: string): Promise<void> {
    const client = getBrevoClient();

    if (client) {
      try {
        await client.transactionalEmails.sendTransacEmail({
          sender: {
            email: process.env.BREVO_SENDER_EMAIL ?? "",
            name: process.env.BREVO_SENDER_NAME ?? "EACRMS",
          },
          to: [{ email }],
          subject: "Verify your EACRMS account",
          htmlContent: buildEmailHtml(code),
        });
        console.log(`[EMAIL] Verification email sent to ${email} via Brevo`);
        return;
      } catch (err) {
        console.error("[EMAIL] Brevo error:", err);
      }
    }

    if (hasPostmark()) {
      try {
        await sendViaPostmark({ to: email, html: buildEmailHtml(code) });
        console.log(`[EMAIL] Verification email sent to ${email} via Postmark`);
        return;
      } catch (err) {
        console.error("[EMAIL] Postmark error:", err);
      }
    }

    console.log("─────────────────────────────────────────");
    console.log("[EMAIL] To:      ", email);
    console.log("[EMAIL] Subject: Verify your EACRMS account");
    console.log("[EMAIL] Code:    ", code);
    console.log("[EMAIL] Expires in 24 hours");
    console.log("─────────────────────────────────────────");
  },

  /**
   * Send phone OTP via AfroMessage.
   * Falls back to console log if AfroMessage credentials are not set.
   */
  async sendPhoneOtp(phoneNumber: string, otp: string): Promise<void> {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    const afro = getAfroConfig();

    if (!afro) {
      // Fallback — development mode
      console.log("─────────────────────────────────────────");
      console.log("[SMS] To:      ", normalizedPhoneNumber);
      console.log("[SMS] OTP:     ", otp);
      console.log("[SMS] Expires in 10 minutes");
      console.log("─────────────────────────────────────────");
      return;
    }

    const message = `Your EACRMS verification OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    try {
      await sendAfroSms(afro, normalizedPhoneNumber, message);
      console.log(`[SMS] OTP sent to ${normalizedPhoneNumber} via AfroMessage`);
    } catch (err) {
      console.error("[SMS] AfroMessage error:", err);
      throw new Error(`Failed to send SMS OTP: ${err}`);
    }
  },

  /**
   * Send password reset code via email (Brevo → Postmark → console fallback).
   */
  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const client = getBrevoClient();

    if (client) {
      try {
        await client.transactionalEmails.sendTransacEmail({
          sender: {
            email: process.env.BREVO_SENDER_EMAIL ?? "",
            name: process.env.BREVO_SENDER_NAME ?? "EACRMS",
          },
          to: [{ email }],
          subject: "Reset your EACRMS password",
          htmlContent: buildPasswordResetEmailHtml(code),
        });
        console.log(`[EMAIL] Password reset email sent to ${email} via Brevo`);
        return;
      } catch (err) {
        console.error("[EMAIL] Brevo error:", err);
      }
    }

    if (hasPostmark()) {
      try {
        await sendViaPostmark({ to: email, html: buildPasswordResetEmailHtml(code) });
        console.log(`[EMAIL] Password reset email sent to ${email} via Postmark`);
        return;
      } catch (err) {
        console.error("[EMAIL] Postmark error:", err);
      }
    }

    console.log("─────────────────────────────────────────");
    console.log("[EMAIL] To:      ", email);
    console.log("[EMAIL] Subject: Reset your EACRMS password");
    console.log("[EMAIL] Code:    ", code);
    console.log("[EMAIL] Expires in 1 hour");
    console.log("─────────────────────────────────────────");
  },

  /**
   * Send password reset code via SMS (AfroMessage → console fallback).
   */
  async sendPasswordResetSms(phoneNumber: string, code: string): Promise<void> {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    const afro = getAfroConfig();

    if (!afro) {
      console.log("─────────────────────────────────────────");
      console.log("[SMS] To:      ", normalizedPhoneNumber);
      console.log("[SMS] Code:    ", code);
      console.log("[SMS] Purpose: Password reset");
      console.log("[SMS] Expires in 1 hour");
      console.log("─────────────────────────────────────────");
      return;
    }

    const message = `Your EACRMS password reset code is: ${code}. Valid for 1 hour. Do not share this code.`;

    try {
      await sendAfroSms(afro, normalizedPhoneNumber, message);
      console.log(`[SMS] Password reset code sent to ${normalizedPhoneNumber} via AfroMessage`);
    } catch (err) {
      console.error("[SMS] AfroMessage error:", err);
      throw new Error(`Failed to send password reset SMS: ${err}`);
    }
  },
};
