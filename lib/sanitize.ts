const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function sanitizeInput(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return escapeHtml(value.slice(0, maxLength));
}
