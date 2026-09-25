"use client";
import { useEffect, useState } from "react";
import { AppShell, Card } from "@/components/AppShell";
export default function Risk() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/risk").then((r) => r.json()).then(setData); }, []);
  return <AppShell><Card title="Risk">{data?.emergency?.globalKillSwitch ? "KILL SWITCH ON" : "Limits live"}</Card></AppShell>;
}
