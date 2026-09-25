"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
import { money } from "@/lib/format";
export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/portfolio").then((r) => r.json()).then(setData); }, []);
  return (
    <AppShell>
      <Card title="Command Centre">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>NAV {money(data?.snapshot?.nav)}</div>
          <div>Cash {money(data?.snapshot?.cash)}</div>
          <div>Day P&amp;L {money(data?.snapshot?.pnlDay)}</div>
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>{(data?.positions ?? []).map((p: any) => <tr key={p.id}><td>{p.symbol}</td><td className="text-right">{money(p.marketValue)}</td></tr>)}</tbody>
        </table>
      </Card>
    </AppShell>
  );
}
