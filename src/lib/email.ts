import { Resend } from "resend";

const FROM_EMAIL = "Ontario Officiant Finder <noreply@onweddingofficiants.ca>";

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Send verification code email to officiant claiming their profile
 */
export async function sendVerificationEmail(
  to: string,
  officiantName: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Verify your profile claim - ${code}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Verify Your Officiant Profile</h2>

          <p>Hi ${officiantName},</p>

          <p>You requested to claim your officiant profile on Ontario Officiant Finder.
          Use the verification code below to complete your claim:</p>

          <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #7c3aed;">
              ${code}
            </span>
          </div>

          <p>This code expires in 24 hours.</p>

          <p>If you didn't request this, you can safely ignore this email.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            Ontario Officiant Finder helps couples find registered wedding officiants across Ontario.
            <br />
            <a href="https://onweddingofficiants.ca" style="color: #7c3aed;">onweddingofficiants.ca</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

/**
 * Send notification when claim is approved
 */
export async function sendClaimApprovedEmail(
  to: string,
  officiantName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your profile has been verified!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Your Profile is Now Verified!</h2>

          <p>Hi ${officiantName},</p>

          <p>Great news! Your officiant profile on Ontario Officiant Finder has been verified and approved.</p>

          <p>Your contact information is now visible to couples searching for wedding officiants in your area.</p>

          <div style="margin: 24px 0;">
            <a href="https://onweddingofficiants.ca"
               style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
              View Your Profile
            </a>
          </div>

          <p>Thank you for being part of Ontario Officiant Finder!</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            <a href="https://onweddingofficiants.ca" style="color: #7c3aed;">onweddingofficiants.ca</a>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generic email sending function
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
