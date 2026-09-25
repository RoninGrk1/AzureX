import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("orders:execute");
    return Response.json({
      ready: store.proposals.filter((p) => p.status === "approved"),
      live: store.proposals.filter((p) => p.status === "executing"),
      filled: store.proposals.filter((p) => p.status === "filled").slice(0, 20),
      paused: store.emergency.pauseTrading || store.emergency.globalKillSwitch,
    });
  } catch (e) { return guard(e); }
}
