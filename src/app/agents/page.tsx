"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
export default function Agents() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/agents").then((r) => r.json()).then(setData); }, []);
  async function run() { await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: "team" }) }); const d = await fetch("/api/agents").then((r) => r.json()); setData(d); }
  return <AppShell><Card title="AI Fund Team"><button className="rounded-xl bg-[#0b1b33] px-3 py-2 text-sm text-white" onClick={run}>Run team</button><ul className="mt-4 text-sm">{(data?.agents ?? []).map((a: any) => <li key={a.id}>{a.name} — {a.summary}</li>)}</ul></Card></AppShell>;
}
