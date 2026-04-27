import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTenantById } from "@/lib/tenants";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Link
        href={`/tenants/${tenant.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-slate-800">Editar tenant</h1>
        <p className="text-sm text-slate-500 font-mono">{tenant.subdomain}</p>
      </header>

      <EditForm
        tenant={{
          id: tenant.id,
          name: tenant.name,
          apiProtocol: tenant.apiProtocol,
          apiHost: tenant.apiHost,
          apiPort: tenant.apiPort,
          active: tenant.active,
        }}
      />
    </main>
  );
}
