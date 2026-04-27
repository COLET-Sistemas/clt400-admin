import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rotateSetupCode } from "@/lib/tenants";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const result = await rotateSetupCode(id);
  if (!result)
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  return NextResponse.json(result);
}
