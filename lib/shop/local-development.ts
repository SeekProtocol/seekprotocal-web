export function isLocalShopDevelopment(): boolean {
  return process.env.NODE_ENV === "development" && typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname) &&
    window.location.protocol === "http:";
}
