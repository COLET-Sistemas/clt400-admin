"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function handle() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button type="button" onClick={handle} className="btn-secondary">
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  );
}
