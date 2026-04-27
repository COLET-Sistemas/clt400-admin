import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createTenant, listTenants } from "@/lib/tenants";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  apiProtocol: z.enum(["http", "https"]),
  apiHost: z.string().trim().min(1).max(253),
  apiPort: z.coerce.number().int().min(1).max(65535),
  slugOverride: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const rows = await listTenants();
  return NextResponse.json({ tenants: rows });
}

export async function POST(request: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await createTenant(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
