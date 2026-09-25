"use client";
import { AppShell, Card, Pill } from "@/components/AppShell";
import { pct, usd } from "@/lib/format";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/portfolio").then((r) => r.json()),
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/notifications").then((r) => r.json()),
      fetch("/api/approvals").then((r) => r.json()),
    ]).then(([p, a, n, o]) => { setData(p); setAgents(a.agents ?? []); setAlerts(n.alerts ?? []); setOrders(o.all ?? []); });
  }, []);
  const s = data?.snapshot;
  return (
    <AppShell>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.2em] text-[#2f6fed]">COMMAND CENTRE</div>
          <h1 className="text-2xl font-semibold">Portfolio dashboard</h1>
        </div>
        <Pill tone="blue">{s ? new Date(s.asOf).toLocaleString() : "loading"}</Pill>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="NAV" value={s ? usd(s.nav) : "—"} />
        <Kpi label="Day P&L" value={s ? usd(s.pnlDay) : "—"} pos={!!s && s.pnlDay >= 0} />
        <Kpi label="Week / Month" value={s ? `${usd(s.pnlWeek)} / ${usd(s.pnlMonth)}` : "—"} />
        <Kpi label="Drawdown" value={s ? pct(s.drawdown) : "—"} pos={!!s && s.drawdown >= 0} />
        <Kpi label="Gross exposure" value={s ? usd(s.grossExposure) : "—"} />
        <Kpi label="Net exposure" value={s ? usd(s.netExposure) : "—"} />
        <Kpi label="Cash / liquidity" value={s ? `${usd(s.cash)} (${pct(s.liquidityBuffer * 100)})` : "—"} />
        <Kpi label="Leverage" value={s ? `${s.leverage.toFixed(2)}x` : "—"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Allocation" className="lg:col-span-1">
          {data && (<div className="space-y-3 text-sm"><Bar label="Equities + ETFs" value={data.allocation.equity} /><Bar label="Crypto" value={data.allocation.crypto} /><Bar label="Cash" value={data.allocation.cash} /></div>)}
        </Card>
        <Card title="AI agent status" className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {agents.map((a) => (
              <div key={a.id} className="rounded-2xl bg-white/50 px-3 py-2">
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{a.name}</span><Pill tone={a.status === "ready" ? "green" : "navy"}>{a.status}</Pill></div>
                <p className="mt-1 line-clamp-2 text-xs text-[#163154]/70">{a.summary}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Holdings" className="lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-[#163154]/60"><tr><th className="pb-2">Asset</th><th>Qty</th><th>Price</th><th>Value</th><th>P&L</th><th>Wgt</th></tr></thead>
            <tbody>
              {data?.positions?.map((p: any) => (
                <tr key={p.symbol} className="border-t border-[#0b1b33]/6">
                  <td className="py-2"><div className="font-medium">{p.symbol}</div><div className="text-[11px] text-[#163154]/60">{p.name}</div></td>
                  <td>{p.quantity.toLocaleString()}</td><td>{usd(p.lastPrice, 2)}</td><td>{usd(p.marketValue)}</td>
                  <td className={p.unrealizedPnl >= 0 ? "pos" : "neg"}>{usd(p.unrealizedPnl)}</td>
                  <td>{(p.weight * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div className="space-y-4">
          <Card title="Active alerts"><ul className="space-y-2 text-sm">{alerts.map((a) => <li key={a.id}><div className="font-medium">{a.title}</div><div className="text-xs text-[#163154]/70">{a.body}</div></li>)}</ul></Card>
          <Card title="Recent tickets"><ul className="space-y-2 text-sm">{orders.slice(0,5).map((o: any) => <li key={o.id} className="flex items-center justify-between"><span>{o.side.toUpperCase()} {o.asset}</span><Pill>{o.status.replace("_"," ")}</Pill></li>)}</ul></Card>
        </div>
      </div>
    </AppShell>
  );
}
function Kpi({ label, value, pos }: { label: string; value: string; pos?: boolean }) {
  return <div className="glass p-4"><div className="text-[11px] uppercase tracking-wide text-[#163154]/60">{label}</div><div className={`mt-1 text-lg font-semibold ${pos === undefined ? "" : pos ? "pos" : "neg"}`}>{value}</div></div>;
}
function Bar({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{(value * 100).toFixed(1)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-gradient-to-r from-[#2f6fed] to-[#6d5efc]" style={{ width: `${Math.min(100, value * 100)}%` }} /></div></div>;
}
