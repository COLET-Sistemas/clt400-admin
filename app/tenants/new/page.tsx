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

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewTenantPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [apiProtocol, setApiProtocol] = useState<"http" | "https">("https");
  const [apiHost, setApiHost] = useState("");
  const [apiPort, setApiPort] = useState("8080");

  const [slugOverride, setSlugOverride] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);

  function validateField(field: string, value: string) {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Informe o nome da empresa.";
        break;

      case "slug":
        if (!value) error = "Slug é obrigatório.";
        else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value))
          error = "Slug inválido.";
        break;

      case "apiHost":
        if (!value.trim()) error = "Informe o host.";
        break;

      case "apiPort":
        if (!value) error = "Informe a porta.";
        else if (Number(value) < 1 || Number(value) > 65535)
          error = "Porta inválida.";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  }

  function isFormValid() {
    return (
      name &&
      slugOverride &&
      apiHost &&
      apiPort &&
      Object.values(errors).every((e) => !e)
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valid =
      validateField("name", name) &&
      validateField("slug", slugOverride) &&
      validateField("apiHost", apiHost) &&
      validateField("apiPort", apiPort);

    if (!valid) return;

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
          slugOverride,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao criar tenant.");
        return;
      }

      setResult(data);
    } catch {
      alert("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setResult(null);
    router.push(`/tenants/${result?.tenant.id ?? ""}`);
    router.refresh();
  }

  function inputClass(field: string, value: string) {
    if (errors[field]) return "input-field border-red-500";
    if (value) return "input-field border-green-500";
    return "input-field";
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
          Campos com <span className="text-red-500">*</span> são obrigatórios
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        {/* NOME */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nome da empresa <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // força maiúsculo

              setName(value);
              validateField("name", value);

              if (!slugManuallyEdited) {
                const slug = generateSlug(value);
                setSlugOverride(slug);
                validateField("slug", slug);
              }
            }}
            className={`${inputClass("name", name)} uppercase`} // visual também
          />

          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* SLUG */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Slug da URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slugOverride}
            onChange={(e) => {
              setSlugManuallyEdited(true);
              const value = generateSlug(e.target.value);
              setSlugOverride(value);
              validateField("slug", value);
            }}
            className={inputClass("slug", slugOverride)}
          />
          {errors.slug && (
            <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
          )}
        </div>

        {/* API */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Protocolo <span className="text-red-500">*</span>
            </label>
            <select
              value={apiProtocol}
              onChange={(e) =>
                setApiProtocol(e.target.value as "http" | "https")
              }
              className="input-field border-green-500"
            >
              <option value="https">HTTPS</option>
              <option value="http">HTTP</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={apiHost}
              onChange={(e) => {
                setApiHost(e.target.value);
                validateField("apiHost", e.target.value);
              }}
              className={inputClass("apiHost", apiHost)}
            />
            {errors.apiHost && (
              <p className="text-xs text-red-500 mt-1">{errors.apiHost}</p>
            )}
          </div>
        </div>

        {/* PORTA */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Porta <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={apiPort}
            onChange={(e) => {
              setApiPort(e.target.value);
              validateField("apiPort", e.target.value);
            }}
            className={inputClass("apiPort", apiPort)}
          />
          {errors.apiPort && (
            <p className="text-xs text-red-500 mt-1">{errors.apiPort}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || loading}
          className="btn-primary w-full disabled:opacity-50"
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
          warning="Copie o setup_code e o api_token agora. Eles NÃO serão exibidos novamente."
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
