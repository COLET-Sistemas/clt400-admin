import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAndCompleteTenantSetup } from "@/lib/tenants";

const ALLOWED_ORIGIN = process.env.SETUP_ALLOWED_ORIGIN ?? "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

const setupSchema = z.object({
  slug: z.string().trim().min(1).max(30),
  setup_code: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload inválido." },
      { status: 400, headers: corsHeaders() },
    );
  }

  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos." },
      { status: 400, headers: corsHeaders() },
    );
  }

  const { slug, setup_code } = parsed.data;

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;

  const result = await verifyAndCompleteTenantSetup(slug, setup_code, ip);

  if (!result) {
    // Delay to mitigate brute force
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json(
      { error: "Código de setup inválido ou empresa não encontrada." },
      { status: 401, headers: corsHeaders() },
    );
  }

  return NextResponse.json(result, { headers: corsHeaders() });
}
