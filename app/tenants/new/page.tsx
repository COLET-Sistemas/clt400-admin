"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import CopySecretModal from "@/components/CopySecretModal";

interface CreateResult {
  tenant: { id: string; slug: string; name: string };
  setupCode: string;
  apiToken: string;
}

export default function NewTenantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [apiProtocol, setApiProtocol] = useState<"http" | "https">("https");
  const [apiHost, setApiHost] = useState("");
  const [apiPort, setApiPort] = useState("8080");
  const [slugOverride, setSlugOverride] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          apiProtocol,
          apiHost,
          apiPort: Number(apiPort),
          slugOverride: slugOverride || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar tenant.");
        return;
      }
      setResult(data);
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setResult(null);
    router.push(`/tenants/${result?.tenant.id ?? ""}`);
    router.refresh();
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <Link
        href="/tenants"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-slate-800">Novo tenant</h1>
        <p className="text-sm text-slate-500">
          O setup_code e o api_token serão gerados automaticamente.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nome da empresa
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Empresa Exemplo Ltda"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Slug da URL (opcional)
          </label>
          <input
            type="text"
            value={slugOverride}
            onChange={(e) =>
              setSlugOverride(e.target.value.toLowerCase().trim())
            }
            placeholder="Deixe em branco para gerar do nome"
            className="input-field"
            pattern="[a-z0-9](-?[a-z0-9])*"
            maxLength={30}
          />
          <p className="text-xs text-slate-500 mt-1">
            a-z, 0-9, hífen. Max 30 chars. Ex: empresateste →{" "}
            clt400tt2.coletsistemas.com.br/empresateste
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Protocolo
            </label>
            <select
              value={apiProtocol}
              onChange={(e) =>
                setApiProtocol(e.target.value as "http" | "https")
              }
              className="input-field"
            >
              <option value="https">HTTPS</option>
              <option value="http">HTTP</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Host
            </label>
            <input
              type="text"
              value={apiHost}
              onChange={(e) => setApiHost(e.target.value)}
              required
              placeholder="Ex: 192.168.1.50 ou api.cliente.com"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Porta
          </label>
          <input
            type="number"
            value={apiPort}
            onChange={(e) => setApiPort(e.target.value)}
            required
            min={1}
            max={65535}
            className="input-field"
          />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Criar tenant
        </button>
      </form>

      {result && (
        <CopySecretModal
          title="Tenant criado"
          warning="Copie o setup_code e o api_token agora. Eles NÃO serão exibidos novamente. O api_token deve ser instalado no .env da API local do cliente. O setup_code deve ser entregue ao técnico para o primeiro acesso em /setup."
          secrets={[
            {
              label: "URL de acesso",
              value: `https://clt400tt2.coletsistemas.com.br/${result.tenant.slug}`,
            },
            { label: "Setup code", value: result.setupCode },
            { label: "API token", value: result.apiToken },
          ]}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
