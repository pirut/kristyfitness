import crypto from "node:crypto";
import type { AstroCookies } from "astro";

export const COOKIE_NAME = "kf_admin_session";
export const SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

function envValue(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[name];
  return fromProcess ?? fromMeta;
}

export function isAuthConfigured(): boolean {
  return Boolean(envValue("ADMIN_PASSWORD"));
}

function sessionSecret(): Buffer {
  return crypto
    .createHash("sha256")
    .update(`kf-admin-session-v1:${envValue("ADMIN_PASSWORD") ?? ""}`)
    .digest();
}

export function checkPassword(input: string): boolean {
  const expected = envValue("ADMIN_PASSWORD");
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MS;
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(String(expires))
    .digest("hex");
  return `${expires}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isAuthConfigured()) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || !signature || expires < Date.now()) return false;
  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(String(expires))
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthenticated(cookies: AstroCookies): boolean {
  return verifySessionToken(cookies.get(COOKIE_NAME)?.value);
}
