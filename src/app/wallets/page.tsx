"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import { money } from "@/lib/format";
export default function Wallets() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/wallets").then((r) => r.json()).then(setData); }, []);
  return <AppShell><Card title="Wallets — keys never stored">{(data?.wallets ?? []).map((w: any) => <div key={w.id} className="text-sm">{w.label} {money(w.balanceUsd)}</div>)}</Card></AppShell>;
}
