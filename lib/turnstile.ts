export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[Turnstile] TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      }
    );

    if (!res.ok) {
      console.error(`[Turnstile] API returned HTTP ${res.status}`);
      return false;
    }

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("[Turnstile] Verification failed:", err);
    return false;
  }
}
