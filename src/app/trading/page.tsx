"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
export default function Trading() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? [])); }, []);
  return <AppShell><Card title="Trading">{orders.map((o) => <div key={o.id} className="text-sm">{o.side} {o.quantity} {o.asset} — {o.status}</div>)}</Card></AppShell>;
}
