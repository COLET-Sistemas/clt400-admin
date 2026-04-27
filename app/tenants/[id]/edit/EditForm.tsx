"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

interface TenantInput {
  id: string;
  name: string;
  apiProtocol: "http" | "https";
  apiHost: string;
  apiPort: number;
  active: boolean;
}

export default function EditForm({ tenant }: { tenant: TenantInput }) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [apiProtocol, setApiProtocol] = useState<"http" | "https">(
    tenant.apiProtocol,
  );
  const [apiHost, setApiHost] = useState(tenant.apiHost);
  const [apiPort, setApiPort] = useState(String(tenant.apiPort));
  const [active, setActive] = useState(tenant.active);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          apiProtocol,
          apiHost,
          apiPort: Number(apiPort),
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro.");
        return;
      }
      router.push(`/tenants/${tenant.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nome
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input-field"
        />
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

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span className="text-slate-700">Ativo</span>
      </label>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Salvar
      </button>
    </form>
  );
}
