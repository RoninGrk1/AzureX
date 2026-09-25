import { guard, requirePermission } from "@/lib/session";
import { store } from "@/lib/store";
export async function GET() {
  try {
    await requirePermission("agents:read");
    return Response.json({ agents: store.agents, outputs: store.outputs.slice(0, 30), disabled: store.emergency.disableAgentExecution || store.emergency.globalKillSwitch });
  } catch (e) { return guard(e); }
}
