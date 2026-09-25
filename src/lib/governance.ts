import type { AgentId } from "./types";
const FORBIDDEN_ACTIONS = new Set(["bypass_risk", "modify_permissions", "access_private_keys", "disable_security", "move_funds_unauth", "change_own_policies"]);
export interface GovernanceRequest { agentId: AgentId; action: string; wantsPrivateKeys?: boolean; wantsPermissionChange?: boolean; wantsDisableSecurity?: boolean; wantsBypassRisk?: boolean; authorizedByHuman?: boolean; }
export function assertAgentAllowed(req: GovernanceRequest): { allowed: boolean; reason: string } {
  if (req.wantsPrivateKeys) return { allowed: false, reason: "AI agents never receive private keys or unrestricted wallet authority." };
  if (req.wantsPermissionChange) return { allowed: false, reason: "Agents cannot modify permissions." };
  if (req.wantsDisableSecurity) return { allowed: false, reason: "Agents cannot disable security controls." };
  if (req.wantsBypassRisk) return { allowed: false, reason: "Agents cannot bypass the risk engine." };
  if (req.action === "move_funds" && !req.authorizedByHuman) return { allowed: false, reason: "Funds cannot move without human authorization." };
  if (req.action === "change_own_policies") return { allowed: false, reason: "Agents cannot change their own policies." };
  if (FORBIDDEN_ACTIONS.has(req.action)) return { allowed: false, reason: `Forbidden action: ${req.action}` };
  return { allowed: true, reason: "Action permitted under governance policy." };
}
