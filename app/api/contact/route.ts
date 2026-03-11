import { NextRequest, NextResponse } from "next/server";
import { escapeHtml, isValidEmail, sanitizeInput } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { getResendClient } from "@/lib/resend";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { allowed } = rateLimit(`contact:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message, phone, turnstileToken } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
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

    const safeName = sanitizeInput(name, 256);
    const safeEmail = sanitizeInput(email, 256);
    const safeMessage = sanitizeInput(message, 5000);

    if (!safeName || !safeEmail || !safeMessage) {
      return NextResponse.json(
        { error: "Invalid input." },
        { status: 400 }
      );
    }

    const safePhone = phone ? sanitizeInput(phone, 20) : null;
    const formattedMessage = safeMessage.replace(/\n/g, "<br>");

    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: "Seek Protocol <noreply@seekprotocol.ai>",
      to: ["support@seekprotocol.ai"],
      subject: `Contact Form: ${safeName}`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p>${formattedMessage}</p>
      `,
    });

    if (error) {
      console.error("[Contact] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
