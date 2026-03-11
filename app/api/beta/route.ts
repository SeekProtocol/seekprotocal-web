import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, sanitizeInput } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { getResendClient } from "@/lib/resend";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { allowed } = rateLimit(`beta:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, turnstileToken } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Please complete the captcha." },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 }
      );
    }

    const safeEmail = sanitizeInput(email, 256);
    if (!safeEmail) {
      return NextResponse.json(
        { error: "Invalid input." },
        { status: 400 }
      );
    }

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: "Seek Protocol <noreply@seekprotocol.ai>",
      to: ["support@seekprotocol.ai"],
      subject: "New Beta Signup",
      html: `
        <h2>New Beta Signup</h2>
        <p><strong>Email:</strong> ${safeEmail}</p>
      `,
    });

    if (error) {
      console.error("[Beta] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Beta] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
