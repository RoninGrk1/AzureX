import { guard, requirePermission } from "@/lib/session";
import { record, store } from "@/lib/store";
import type { EmergencyState } from "@/lib/types";
export async function GET() {
  try {
    await requirePermission("risk:read");
    return Response.json({ emergency: store.emergency });
  } catch (e) { return guard(e); }
}
export async function POST(req: Request) {
  try {
    const session = await requirePermission("emergency:write");
    const body = (await req.json()) as Partial<EmergencyState>;
    const keys: (keyof EmergencyState)[] = ["pauseTrading", "pauseWithdrawals", "disableAgentExecution", "globalKillSwitch"];
    for (const key of keys) {
      if (typeof body[key] === "boolean") store.emergency[key] = body[key] as boolean;
    }
    if (store.emergency.globalKillSwitch) {
      store.emergency.pauseTrading = true;
      store.emergency.pauseWithdrawals = true;
      store.emergency.disableAgentExecution = true;
    }
    record(session.email, "user", "EMERGENCY_UPDATE", "emergency", { emergency: { ...store.emergency } });
    return Response.json({ emergency: store.emergency });
  } catch (e) { return guard(e); }
}
