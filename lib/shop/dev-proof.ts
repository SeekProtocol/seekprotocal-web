// Keep identical to seekar-app/supabase/functions/_shared/web-shop-dev-proof.ts.
export function isLocalShopOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.origin === origin && url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

export type DevShopRequest = {
  timestamp: string;
  origin: string;
  authorization: string;
  target: string;
  body: unknown;
};

function message(request: DevShopRequest): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify([
    request.timestamp, request.origin, request.authorization, request.target, request.body,
  ]));
}

async function key(secret: string) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signDevShopRequest(secret: string, request: DevShopRequest): Promise<string> {
  if (secret.length < 32) throw new Error("Local shop secret is not configured");
  const signature = await crypto.subtle.sign("HMAC", await key(secret), message(request));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyDevShopRequest(secret: string, signature: string, request: DevShopRequest): Promise<boolean> {
  if (secret.length < 32 || !isLocalShopOrigin(request.origin) ||
      !/^\d{13}$/.test(request.timestamp) ||
      Math.abs(Date.now() - Number(request.timestamp)) > 30_000 ||
      !/^[a-f0-9]{64}$/.test(signature)) return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, (pair) => parseInt(pair, 16));
  return crypto.subtle.verify("HMAC", await key(secret), bytes, message(request));
}
