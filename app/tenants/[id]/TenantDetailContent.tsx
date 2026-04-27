"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit } from "lucide-react";
import type { Tenant } from "@/lib/schema";
import AuthenticateSecretsModal from "./AuthenticateSecretsModal";

interface Props {
  tenant: Tenant;
}

export default function TenantDetailContent({ tenant }: Props) {
  const [showSecretsModal, setShowSecretsModal] = useState(false);

  return (
    <>
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{tenant.name}</h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  tenant.active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {tenant.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Slug:{" "}
              <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                {tenant.slug}
              </code>
            </p>
            <p className="text-sm text-slate-600 font-mono text-xs break-all bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              https://clt400tt2.coletsistemas.com.br/{tenant.slug}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSecretsModal(true)}
              className="btn-secondary"
            >
              Ver Secrets
            </button>
            <Link href={`/tenants/${tenant.id}/edit`} className="btn-secondary">
              <Edit className="w-4 h-4" />
              Editar
            </Link>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            API Local
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Protocolo
              </dt>
              <dd className="text-sm font-mono text-slate-700 mt-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                {tenant.apiProtocol}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Host
              </dt>
              <dd className="text-sm font-mono text-slate-700 mt-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                {tenant.apiHost}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Porta
              </dt>
              <dd className="text-sm font-mono text-slate-700 mt-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                {tenant.apiPort}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                URL Completa
              </dt>
              <dd className="text-xs font-mono text-slate-700 mt-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 break-all">
                {tenant.apiProtocol}://{tenant.apiHost}:{tenant.apiPort}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            Cronologia
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Criado em
              </dt>
              <dd className="text-sm text-slate-700 mt-1">
                {new Date(tenant.createdAt).toLocaleString("pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Setup Completo
              </dt>
              <dd className="text-sm text-slate-700 mt-1">
                {tenant.setupCompletedAt
                  ? new Date(tenant.setupCompletedAt).toLocaleString("pt-BR")
                  : "Pendente"}
              </dd>
            </div>
            {tenant.setupIp && (
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  IP do Setup
                </dt>
                <dd className="text-sm font-mono text-slate-700 mt-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                  {tenant.setupIp}
                </dd>
              </div>
            )}
            {tenant.setupCodeRotatedAt && (
              <div>
                <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Última Rotação
                </dt>
                <dd className="text-sm text-slate-700 mt-1">
                  {new Date(tenant.setupCodeRotatedAt).toLocaleString(
                    "pt-BR"
                  )}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
          Versão & Status
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Session Version
            </dt>
            <dd className="text-lg font-bold text-slate-900 mt-2">
              {tenant.sessionVersion}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Status
            </dt>
            <dd className="text-lg font-bold text-slate-900 mt-2">
              <span
                className={`${
                  tenant.active ? "text-emerald-600" : "text-slate-600"
                }`}
              >
                {tenant.active ? "Ativo" : "Inativo"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {showSecretsModal && (
        <AuthenticateSecretsModal
          tenantId={tenant.id}
          onClose={() => setShowSecretsModal(false)}
        />
      )}
    </>
  );
}
