import { guard, requirePermission } from "@/lib/session";
import { runAgent, runTeam } from "@/lib/agents";
import type { AgentId } from "@/lib/types";
const VALID: AgentId[] = ["cio","macro","equities","crypto","quant","news","portfolio","risk","execution"];
export async function POST(req: Request) {
  try {
    const session = await requirePermission("agents:run");
    const body = await req.json().catch(() => ({}));
    const agentId = body.agentId as AgentId | "team" | undefined;
    if (!agentId || agentId === "team") return Response.json({ outputs: runTeam(session.email) });
    if (!VALID.includes(agentId)) return Response.json({ error: "Unknown agent." }, { status: 400 });
    return Response.json({ output: runAgent(agentId, session.email) });
  } catch (e) { return guard(e); }
}
