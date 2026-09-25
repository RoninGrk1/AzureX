"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
export default function Audit() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/audit").then((r) => r.json()).then(setData); }, []);
  return <AppShell><Card title="Audit">{(data?.events ?? []).slice(0, 20).map((e: any) => <div key={e.id} className="text-xs">{e.action} {e.actor}</div>)}</Card></AppShell>;
}
