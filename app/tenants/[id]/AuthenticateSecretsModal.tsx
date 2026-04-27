"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import CopySecretModal from "@/components/CopySecretModal";

interface Props {
  tenantId: string;
  onClose: () => void;
}

export default function AuthenticateSecretsModal({ tenantId, onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [secrets, setSecrets] = useState<{ apiToken: string; setupCode: string } | null>(null);

  async function handleAuthenticate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/tenants/${tenantId}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Falha na autenticação");
        return;
      }

      setSecrets(data);
      setAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }

  if (authenticated && secrets) {
    return (
      <CopySecretModal
        title="Token e Setup Code"
        warning="Guarde estas credenciais em segurança. O token de API permite acesso completo à conta. O setup_code é necessário para configurar novos clientes."
        secrets={[
          { label: "API Token", value: secrets.apiToken },
          { label: "Setup Code", value: secrets.setupCode },
        ]}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Autenticar</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleAuthenticate} className="px-5 py-5 space-y-4">
          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Informe o usuário"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Informe a senha"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </form>

        <div className="px-5 py-4 border-t border-slate-200 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAuthenticate}
            disabled={loading || !username || !password}
            className="btn-primary"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Autenticar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
