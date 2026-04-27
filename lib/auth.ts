import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { constantTimeEqual } from "./crypto";

const COOKIE_NAME = "admin_session";
const TTL_SECONDS = 8 * 60 * 60;

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET ausente ou curto (>=32 chars).");
  }
  return s;
}

interface SessionPayload {
  user: string;
  exp: number;
  nonce: string;
}

function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${mac}`;
}

function verify(token: string): SessionPayload | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;

  const expected = createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  if (!constantTimeEqual(mac, expected)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function validateLogin(user: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    throw new Error("ADMIN_USER/ADMIN_PASSWORD não configurados.");
  }
  const userOk = constantTimeEqual(user, expectedUser);
  const passOk = constantTimeEqual(password, expectedPassword);
  return userOk && passOk;
}

export function buildSessionToken(user: string): string {
  return sign({
    user,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
    nonce: randomBytes(8).toString("base64url"),
  });
}

export const SESSION_COOKIE_MAX_AGE = TTL_SECONDS;

export async function issueSessionCookie(user: string): Promise<void> {
  const token = buildSessionToken(user);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export function verifyTokenString(token: string): SessionPayload | null {
  return verify(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export function validateGuestLogin(): boolean {
  const guestEnabled = process.env.GUEST_LOGIN_ENABLED === "true";
  return guestEnabled;
}
