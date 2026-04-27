import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { tenants, type Tenant } from "./schema";
import {
  generateApiToken,
  generateSetupCode,
  isValidSlug,
  slugify,
  constantTimeEqual,
} from "./crypto";

export interface CreateTenantInput {
  name: string;
  apiProtocol: "http" | "https";
  apiHost: string;
  apiPort: number;
  slugOverride?: string;
}

export interface CreatedTenant {
  tenant: Tenant;
  setupCode: string;
  apiToken: string;
}

export async function listTenants(): Promise<Tenant[]> {
  return db.select().from(tenants).orderBy(tenants.createdAt);
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const rows = await db.select().from(tenants).where(eq(tenants.id, id));
  return rows[0] ?? null;
}

async function generateUniqueSlug(base: string): Promise<string> {
  const candidate_base = slugify(base);
  if (!isValidSlug(candidate_base)) {
    throw new Error(
      "Nome gera slug inválido. Informe um nome diferente ou slug customizado.",
    );
  }

  let candidate = candidate_base;
  let suffix = 2;
  while (true) {
    const existing = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, candidate));
    if (existing.length === 0) return candidate;
    candidate = `${candidate_base}-${suffix}`.slice(0, 30);
    suffix += 1;
    if (suffix > 999) throw new Error("Falha ao gerar slug único.");
  }
}

export async function createTenant(
  input: CreateTenantInput,
): Promise<CreatedTenant> {
  const slug = input.slugOverride
    ? input.slugOverride
    : await generateUniqueSlug(input.name);

  if (!isValidSlug(slug)) {
    throw new Error("Slug inválido.");
  }

  if (input.slugOverride) {
    const existing = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug));
    if (existing.length > 0) {
      throw new Error("Slug já em uso.");
    }
  }

  const setupCode = generateSetupCode();
  const apiToken = generateApiToken();

  const [row] = await db
    .insert(tenants)
    .values({
      name: input.name,
      slug,
      apiProtocol: input.apiProtocol,
      apiHost: input.apiHost,
      apiPort: input.apiPort,
      apiToken,
      setupCode,
    })
    .returning();

  return { tenant: row, setupCode, apiToken };
}

export interface UpdateTenantInput {
  name?: string;
  apiProtocol?: "http" | "https";
  apiHost?: string;
  apiPort?: number;
  active?: boolean;
}

export async function updateTenant(
  id: string,
  input: UpdateTenantInput,
): Promise<Tenant | null> {
  const [row] = await db
    .update(tenants)
    .set(input)
    .where(eq(tenants.id, id))
    .returning();
  return row ?? null;
}

export async function deleteTenant(id: string): Promise<boolean> {
  const rows = await db
    .delete(tenants)
    .where(eq(tenants.id, id))
    .returning({ id: tenants.id });
  return rows.length > 0;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const rows = await db.select().from(tenants).where(eq(tenants.slug, slug));
  return rows[0] ?? null;
}

export interface SetupVerifyResult {
  name: string;
  apiProtocol: "http" | "https";
  apiHost: string;
  apiPort: number;
  apiToken: string;
}

export async function verifyAndCompleteTenantSetup(
  slug: string,
  setupCode: string,
  ip: string | null,
): Promise<SetupVerifyResult | null> {
  const tenant = await getTenantBySlug(slug);
  if (!tenant || !tenant.active) return null;

  if (!constantTimeEqual(tenant.setupCode, setupCode)) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    setupCompletedAt: new Date(),
    lastUsedAt: new Date(),
  };
  if (ip) updateData.setupIp = ip;

  await db.update(tenants).set(updateData).where(eq(tenants.id, tenant.id));

  return {
    name: tenant.name,
    apiProtocol: tenant.apiProtocol,
    apiHost: tenant.apiHost,
    apiPort: tenant.apiPort,
    apiToken: tenant.apiToken,
  };
}

export async function rotateSetupCode(
  id: string,
): Promise<{ tenant: Tenant; setupCode: string } | null> {
  const setupCode = generateSetupCode();
  const [row] = await db
    .update(tenants)
    .set({
      setupCode,
      sessionVersion: sql`${tenants.sessionVersion} + 1`,
      setupCompletedAt: null,
      setupIp: null,
      setupCodeRotatedAt: new Date(),
    })
    .where(eq(tenants.id, id))
    .returning();
  if (!row) return null;
  return { tenant: row, setupCode };
}
