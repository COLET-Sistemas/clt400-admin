"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Trash2, Power } from "lucide-react";
import CopySecretModal from "@/components/CopySecretModal";

interface Props {
  tenantId: string;
  active: boolean;
}

export default function TenantActions({ tenantId, active }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [rotated, setRotated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function rotate() {
    if (
      !confirm(
        "Rotacionar o setup_code invalida sessões ativas. Confirmar?",
      )
    )
      return;
    setBusy("rotate");
    setError(null);
    try {
      const res = await fetch(
        `/api/tenants/${tenantId}/rotate-setup-code`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao rotacionar.");
        return;
      }
      setRotated(data.setupCode);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function toggleActive() {
    setBusy("toggle");
    setError(null);
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Falha.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (
      !confirm(
        "Excluir definitivamente este tenant? A ação não pode ser desfeita.",
      )
    )
      return;
    if (!confirm("Tem certeza? Esta é a confirmação final."))
      return;
    setBusy("delete");
    setError(null);
    try {
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Falha.");
        return;
      }
      router.push("/tenants");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
      <h2 className="font-semibold text-slate-800">Ações</h2>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={rotate}
          disabled={busy !== null}
          className="btn-secondary"
        >
          {busy === "rotate" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Rotacionar setup_code
        </button>

        <button
          type="button"
          onClick={toggleActive}
          disabled={busy !== null}
          className="btn-secondary"
        >
          <Power className="w-4 h-4" />
          {active ? "Desativar" : "Reativar"}
        </button>

        <button
          type="button"
          onClick={remove}
          disabled={busy !== null}
          className="btn-danger"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>

      {rotated && (
        <CopySecretModal
          title="Setup code rotacionado"
          warning="Copie o novo setup_code agora. Ele NÃO será exibido novamente. Sessões ativas foram invalidadas — distribua o novo código apenas aos técnicos autorizados."
          secrets={[{ label: "Novo setup_code", value: rotated }]}
          onClose={() => setRotated(null)}
        />
      )}
    </section>
  );
}
