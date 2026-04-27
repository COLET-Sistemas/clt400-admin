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
  return randomBytes(8).toString("base64url").slice(0, 10).toUpperCase();
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
