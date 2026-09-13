import { isLocalShopOrigin, signDevShopRequest } from "@/lib/shop/dev-proof";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin") ?? "";
  if (process.env.NODE_ENV !== "development" || !isLocalShopOrigin(url.origin) ||
      !isLocalShopOrigin(origin) || origin !== `http://${request.headers.get("host")}`) {
    return new Response(null, { status: 404 });
  }
  const target = url.searchParams.get("function");
  if (target !== "solana-checkout" && target !== "radom-checkout") {
    return Response.json({ error: "unknown_action" }, { status: 400 });
  }
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const secret = process.env.WEB_SHOP_DEV_SECRET ?? "";
  if (secret.length < 32) {
    return Response.json({ error: "checkout_unavailable" }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "unknown_action" }, { status: 400 });
  }
  const timestamp = String(Date.now());
  const signature = await signDevShopRequest(secret, { timestamp, origin, authorization, target, body });
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${target}`, {
      method: "POST",
      signal: AbortSignal.timeout(18_000),
      headers: {
        "Content-Type": "application/json",
        authorization,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        origin,
        "x-app-distribution": "web",
        "x-shop-dev-timestamp": timestamp,
        "x-shop-dev-signature": signature,
      },
      body: JSON.stringify(body),
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "network" }, { status: 502 });
  }
}
