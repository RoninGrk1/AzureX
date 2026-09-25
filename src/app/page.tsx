"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("principal@azurex.local");
  const [password, setPassword] = useState("AzureX-Demo-2026!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => { if (d.user) router.replace("/dashboard"); }).catch(() => undefined);
  }, [router]);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Login failed."); return; }
    router.replace("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md p-8">
        <div className="text-[11px] font-semibold tracking-[0.24em] text-[#2f6fed]">AZUREX</div>
        <h1 className="mt-1 text-2xl font-semibold text-[#0b1b33]">Private Investment OS</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input className="w-full rounded-xl border bg-white/80 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full rounded-xl border bg-white/80 px-3 py-2 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-[#0b1b33] py-2.5 text-sm text-white">{busy ? "Authenticating…" : "Enter Command Centre"}</button>
        </form>
      </div>
    </div>
  );
}
