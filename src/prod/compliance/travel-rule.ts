export interface TravelRuleResult {
  required: boolean;
  status: "not_applicable" | "clear" | "hold" | "blocked";
  reason: string;
}
const BLOCKED_VASP = new Set(
  (process.env.BLOCKED_VASPS ?? "SANCTIONED-OTC,RESTRICTED-VENUE").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
);
export function evaluateTravelRule(params: { assetClass: string; usd: number; counterparty?: string; originatorName?: string; }): TravelRuleResult {
  if (params.assetClass !== "crypto") return { required: false, status: "not_applicable", reason: "Travel rule applies to crypto transfers." };
  const threshold = Number(process.env.TRAVEL_RULE_USD ?? 3000);
  const cp = (params.counterparty ?? "").toUpperCase();
  if (cp && BLOCKED_VASP.has(cp)) return { required: true, status: "blocked", reason: "Counterparty is on the restricted VASP list." };
  if (params.usd < threshold) return { required: false, status: "clear", reason: `Below travel-rule threshold (${threshold} USD).` };
  if (!params.originatorName) return { required: true, status: "hold", reason: "Originator information required above threshold." };
  return { required: true, status: "clear", reason: "Originator recorded; counterparty not restricted." };
}
