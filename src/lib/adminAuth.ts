import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "bis_admin_session";

function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error("ADMIN_SECRET_KEY ortam değişkeni tanımlı değil.");
  }
  return secret;
}

function computeSessionToken(secret: string) {
  return createHmac("sha256", secret).update("bis-admin-session-v1").digest("hex");
}

export function verifyAdminKey(key: string) {
  const secret = getAdminSecret();
  const a = Buffer.from(key);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminSessionToken() {
  return computeSessionToken(getAdminSecret());
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!session) return false;

  const expected = computeSessionToken(getAdminSecret());
  const a = Buffer.from(session);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
