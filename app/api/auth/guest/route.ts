import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
  buildSessionToken,
  validateGuestLogin,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!validateGuestLogin()) {
      return NextResponse.json(
        { error: "Guest login não habilitado." },
        { status: 403 },
      );
    }

    const token = buildSessionToken("guest");
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
      err instanceof Error ? err.message : "Erro ao fazer login como guest.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
