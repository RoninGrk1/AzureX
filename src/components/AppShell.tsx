"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const NAV = [
  { href: "/dashboard", label: "Command" },
  { href: "/agents", label: "AI Team" },
  { href: "/research", label: "Research" },
  { href: "/trading", label: "Trading" },
  { href: "/approvals", label: "Approvals" },
  { href: "/wallets", label: "Wallets" },
  { href: "/risk", label: "Risk" },
  { href: "/audit", label: "Audit" },
  { href: "/settings", label: "Controls" },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((d) => { if (!d.user) router.replace("/"); else setUser(d.user); }).catch(() => router.replace("/"));
  }, [router]);
  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-[1440px] gap-4">
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-[220px] shrink-0 flex-col p-4 md:flex">
          <div className="mb-6 text-[11px] font-semibold tracking-[0.22em] text-[#2f6fed]">AZUREX</div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-2 text-sm ${path === item.href ? "bg-[#0b1b33] text-white" : "text-[#163154]/80"}`}>{item.label}</Link>
            ))}
          </nav>
          <div className="text-xs">{user?.name}<br />{user?.role}</div>
          <button className="mt-2 text-left text-xs text-[#2f6fed]" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/"); }}>Sign out</button>
        </aside>
        <main className="min-w-0 flex-1 pb-8">{children}</main>
      </div>
    </div>
  );
}
export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return <section className="glass p-5">{title && <h2 className="mb-3 text-sm font-semibold">{title}</h2>}{children}</section>;
}
