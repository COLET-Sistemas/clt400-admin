import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { deleteTenant, getTenantById, updateTenant } from "@/lib/tenants";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  apiProtocol: z.enum(["http", "https"]).optional(),
  apiHost: z.string().trim().min(1).max(253).optional(),
  apiPort: z.coerce.number().int().min(1).max(65535).optional(),
  active: z.boolean().optional(),
});

async function requireAuth() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant)
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ tenant });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const tenant = await updateTenant(id, parsed.data);
  if (!tenant)
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ tenant });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const ok = await deleteTenant(id);
  if (!ok)
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
