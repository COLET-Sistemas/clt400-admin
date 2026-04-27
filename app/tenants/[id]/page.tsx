import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { getTenantById } from "@/lib/tenants";
import TenantActions from "./TenantActions";

export const dynamic = "force-dynamic";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link
        href="/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{tenant.name}</h1>
          <p className="text-sm text-slate-500 font-mono">
            https://clt400tt2.coletsistemas.com.br/{tenant.slug}
          </p>
        </div>
        <Link href={`/tenants/${tenant.id}/edit`} className="btn-secondary">
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </header>

      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="font-semibold text-slate-800">Conexão com API local</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Protocolo</dt>
          <dd className="font-mono">{tenant.apiProtocol}</dd>
          <dt className="text-slate-500">Host</dt>
          <dd className="font-mono">{tenant.apiHost}</dd>
          <dt className="text-slate-500">Porta</dt>
          <dd className="font-mono">{tenant.apiPort}</dd>
          <dt className="text-slate-500">URL completa</dt>
          <dd className="font-mono text-xs break-all">
            {tenant.apiProtocol}://{tenant.apiHost}:{tenant.apiPort}
          </dd>
        </dl>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="font-semibold text-slate-800">Estado</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Ativo</dt>
          <dd>{tenant.active ? "Sim" : "Não"}</dd>
          <dt className="text-slate-500">Session version</dt>
          <dd className="font-mono">{tenant.sessionVersion}</dd>
          <dt className="text-slate-500">Setup completo</dt>
          <dd>
            {tenant.setupCompletedAt
              ? new Date(tenant.setupCompletedAt).toLocaleString()
              : "Pendente"}
          </dd>
          <dt className="text-slate-500">IP do setup</dt>
          <dd className="font-mono">{tenant.setupIp ?? "—"}</dd>
          <dt className="text-slate-500">Criado em</dt>
          <dd>{new Date(tenant.createdAt).toLocaleString()}</dd>
          <dt className="text-slate-500">Rotação setup_code</dt>
          <dd>
            {tenant.setupCodeRotatedAt
              ? new Date(tenant.setupCodeRotatedAt).toLocaleString()
              : "—"}
          </dd>
        </dl>
      </section>

      <TenantActions tenantId={tenant.id} active={tenant.active} />
    </main>
  );
}
