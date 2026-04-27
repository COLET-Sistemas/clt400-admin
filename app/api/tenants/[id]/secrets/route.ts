import { getTenantById } from "@/lib/tenants";
import { validateLogin } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { error: "Usuário e senha obrigatórios" },
        { status: 400 }
      );
    }

    if (!validateLogin(username, password)) {
      return Response.json(
        { error: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    const tenant = await getTenantById(id);
    if (!tenant) {
      return Response.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    return Response.json({
      apiToken: tenant.apiToken,
      setupCode: tenant.setupCode,
    });
  } catch (error) {
    console.error("Erro ao validar secrets:", error);
    return Response.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
