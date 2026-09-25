"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
export default function Approvals() {
  const [queue, setQueue] = useState<any[]>([]);
  useEffect(() => { fetch("/api/approvals").then((r) => r.json()).then((d) => setQueue(d.queue ?? [])); }, []);
  return <AppShell><Card title="Approvals">{queue.map((o) => <div key={o.id} className="text-sm">{o.asset} {o.status}</div>)}</Card></AppShell>;
}
