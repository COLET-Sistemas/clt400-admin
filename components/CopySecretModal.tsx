"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle, X } from "lucide-react";

interface Secret {
  label: string;
  value: string;
}

interface Props {
  title: string;
  warning: string;
  secrets: Secret[];
  onClose: () => void;
}

export default function CopySecretModal({
  title,
  warning,
  secrets,
  onClose,
}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">{warning}</p>
          </div>

          {secrets.map((s) => (
            <div key={s.label}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {s.label}
              </label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 bg-slate-100 rounded-lg font-mono text-sm break-all">
                  {s.value}
                </code>
                <button
                  type="button"
                  onClick={() => copy(s.label, s.value)}
                  className="btn-secondary shrink-0"
                >
                  {copied === s.label ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex justify-end">
          <button type="button" onClick={onClose} className="btn-primary">
            Já copiei, fechar
          </button>
        </div>
      </div>
    </div>
  );
}
