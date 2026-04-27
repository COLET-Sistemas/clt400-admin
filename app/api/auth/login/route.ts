import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
  buildSessionToken,
  validateLogin,
} from "@/lib/auth";

const schema = z.object({
  user: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Informe usuário e senha." },
      { status: 400 },
    );
  }

  try {
    if (!validateLogin(parsed.data.user, parsed.data.password)) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 },
      );
    }

    const token = buildSessionToken(parsed.data.user);
    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    return res;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro de autenticação.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
