import Link from "next/link";
import { Plus, Server } from "lucide-react";
import { listTenants } from "@/lib/tenants";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await listTenants();

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tenants</h1>
          <p className="text-sm text-slate-500">
            Empresas cadastradas e configuração de conexão.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tenants/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Novo tenant
          </Link>
          <LogoutButton />
        </div>
      </header>

      {tenants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Server className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">Nenhum tenant cadastrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">URL de acesso</th>
                <th className="px-4 py-3 font-medium">API</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/tenants/${t.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    clt400tt2.coletsistemas.com.br/{t.slug}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {t.apiProtocol}://{t.apiHost}:{t.apiPort}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        t.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {t.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.setupCompletedAt ? (
                      <span className="text-emerald-700">
                        ✓{" "}
                        {new Date(t.setupCompletedAt).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-500">Pendente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
