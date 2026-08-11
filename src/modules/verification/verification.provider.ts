import { Resend } from "resend";
import AfricasTalking from "africastalking";
import { hasPostmark, sendViaPostmark } from "../../lib/postmark";
import { normalizePhoneNumber } from "../../utils/phone";

/**
 * ─── Lazy-initialised clients ────────────────────────────────────────────────
 * Clients are only created when their env vars are present so the app
 * boots fine in dev/test without real credentials.
 */

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getAT() {
  const apiKey   = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  if (!apiKey || !username) return null;
  return AfricasTalking({ apiKey, username });
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

// ─── Provider ─────────────────────────────────────────────────────────────────

export const notificationProvider = {
  /**
   * Send email verification code via Resend.
   * Falls back to console log if RESEND_API_KEY is not set.
   */
  async sendEmailVerification(email: string, code: string): Promise<void> {
    // Prefer Postmark if configured
    if (hasPostmark()) {
      try {
        await sendViaPostmark({ to: email, html: buildEmailHtml(code) });
        console.log(`[EMAIL] Verification email sent to ${email} via Postmark`);
        return;
      } catch (err) {
        console.error("[EMAIL] Postmark error:", err);
        // fallthrough to try Resend
      }
    }

    const client = getResendClient();

    if (!client) {
      // Fallback — development mode
      console.log("─────────────────────────────────────────");
      console.log("[EMAIL] To:      ", email);
      console.log("[EMAIL] Subject: Verify your EACRMS account");
      console.log("[EMAIL] Code:    ", code);
      console.log("[EMAIL] Expires in 24 hours");
      console.log("─────────────────────────────────────────");
      return;
    }

    // Build the from field in code — keeps angle brackets out of env vars
    // which avoids shell/YAML parsing issues on Windows
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const fromAddress = `EACRMS <${fromEmail}>`;

    const { error } = await client.emails.send({
      from:    fromAddress,
      to:      [email],
      subject: "Verify your EACRMS account",
      html:    buildEmailHtml(code),
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    console.log(`[EMAIL] Verification email sent to ${email} via Resend`);
  },

  /**
   * Send phone OTP via Africa's Talking.
   * Falls back to console log if AT credentials are not set.
   */
  async sendPhoneOtp(phoneNumber: string, otp: string): Promise<void> {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    const at = getAT();

    if (!at) {
      // Fallback — development mode
      console.log("─────────────────────────────────────────");
      console.log("[SMS] To:      ", normalizedPhoneNumber);
      console.log("[SMS] OTP:     ", otp);
      console.log("[SMS] Expires in 10 minutes");
      console.log("─────────────────────────────────────────");
      return;
    }

    const senderId = process.env.AT_SENDER_ID ?? "EACRMS";

    try {
      const result = await at.SMS.send({
        to:      [normalizedPhoneNumber],
        message: `Your EACRMS verification OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from:    senderId,
      });

      console.log(`[SMS] OTP sent to ${normalizedPhoneNumber}:`, JSON.stringify(result));
    } catch (err) {
      console.error("[SMS] Africa's Talking error:", err);
      throw new Error(`Failed to send SMS OTP: ${err}`);
    }
  },
};
