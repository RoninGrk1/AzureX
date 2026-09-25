"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
export default function Research() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/research").then((r) => r.json()).then(setData); }, []);
  return <AppShell><Card title="Research">{(data?.briefs ?? []).map((b: any) => <p key={b.id} className="text-sm">{b.agentId}: {b.recommendation}</p>)}</Card></AppShell>;
}
