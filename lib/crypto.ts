import { randomBytes, timingSafeEqual } from "node:crypto";

const RESERVED_SLUGS = new Set([
  "admin",
  "www",
  "api",
  "app",
  "setup",
  "auth",
  "static",
  "assets",
  "cdn",
  "mail",
]);

export function generateSetupCode(): string {
  const num = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return num.toString().padStart(6, "0");
}

export function generateApiToken(): string {
  return randomBytes(32).toString("base64url");
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export function isValidSlug(candidate: string): boolean {
  if (!candidate || candidate.length > 30) return false;
  if (RESERVED_SLUGS.has(candidate)) return false;
  return /^[a-z0-9](-?[a-z0-9])*$/.test(candidate);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
