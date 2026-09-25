"use client";
import { AppShell, Card } from "@/components/AppShell";
export default function Settings() {
  async function kill() { await fetch("/api/emergency", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ globalKillSwitch: true }) }); }
  return <AppShell><Card title="Controls"><button className="rounded-xl bg-red-800 px-3 py-2 text-sm text-white" onClick={kill}>Engage kill switch</button></Card></AppShell>;
}
