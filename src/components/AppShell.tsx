"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cls } from "@/lib/format";
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
    fetch("/api/auth/session").then((r) => r.json()).then((d) => {
      if (!d.user) router.replace("/");
      else setUser(d.user);
    }).catch(() => router.replace("/"));
  }, [router]);
  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-[1440px] gap-4">
        <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-[220px] shrink-0 flex-col p-4 md:flex">
          <div className="mb-6 text-[11px] font-semibold tracking-[0.22em] text-[#2f6fed]">AZUREX</div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={cls("rounded-xl px-3 py-2 text-sm", path === item.href ? "bg-[#0b1b33] text-white" : "text-[#163154]/80")}>{item.label}</Link>
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
export function Card({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cls("glass p-5", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? <h2 className="text-sm font-semibold tracking-wide text-[#163154]">{title}</h2> : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Pill({ children, tone = "navy" }: { children: React.ReactNode; tone?: "navy" | "green" | "red" | "amber" | "blue" }) {
  const map = {
    navy: "bg-[#0b1b33]/8 text-[#0b1b33]",
    green: "bg-emerald-500/12 text-emerald-800",
    red: "bg-red-500/12 text-red-800",
    amber: "bg-amber-400/20 text-amber-900",
    blue: "bg-[#2f6fed]/12 text-[#1d4ed8]",
  };
  return <span className={cls("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium", map[tone])}>{children}</span>;
}
