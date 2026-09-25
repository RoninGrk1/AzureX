import { store, record } from "./store";
import type { AgentId, AgentOutput } from "./types";
function brief(agentId: AgentId, model: string, version: string, inputSources: string[], evidence: string[], assumptions: string[], recommendation: string, riskAssessment: string): Omit<AgentOutput, "id" | "timestamp" | "approvalHistory"> {
  return { agentId, model, version, inputSources, evidence, assumptions, recommendation, riskAssessment };
}
const PLAYBOOKS: Record<AgentId, () => Omit<AgentOutput, "id" | "timestamp" | "approvalHistory">> = {
  cio: () => brief("cio", "azurex-cio-orchestrator", "1.4.2", ["macro", "risk"], ["limits green"], ["no hawkish surprise"], "Hold core equity. Tactical BTC add. No leverage increase.", "Human authorization required before any fill."),
  macro: () => brief("macro", "azurex-macro", "1.3.0", ["FOMC"], ["real rates stable"], ["disinflation"], "Do not raise cash solely on macro.", "Risk-on constrained."),
  equities: () => brief("equities", "azurex-eq", "1.2.8", ["filings"], ["NVDA multiple extended"], ["no guidance cut"], "Maintain AAPL/MSFT. Reduce NVDA 800 shares.", "Concentration risk."),
  crypto: () => brief("crypto", "azurex-crypto", "1.5.1", ["on-chain"], ["BTC outflow"], ["no ETF shock"], "Accumulate BTC on weakness.", "Gap risk remains."),
  quant: () => brief("quant", "azurex-quant", "1.1.9", ["momentum"], ["BTC 20d positive"], ["signal decay"], "Momentum supports a small BTC add.", "Signals do not override limits."),
  news: () => brief("news", "azurex-news", "1.0.7", ["wires"], ["no adverse print"], ["headline residual"], "No forced action.", "Do not size off headlines."),
  portfolio: () => brief("portfolio", "azurex-port", "1.2.0", ["ledger"], [`NAV ${store.snapshot.nav.toFixed(0)}`], ["last-price marks"], "Next change should be limit-aware.", "Drift modest."),
  risk: () => brief("risk", "azurex-risk", "1.4.0", ["limits"], ["fail closed"], ["limits binding"], "Reject any proposal that fails a required control.", "Fail-closed."),
  execution: () => brief("execution", "azurex-exec", "1.0.4", ["proposals"], ["no autonomous send"], ["approval required"], "Prepare child orders only after approval.", "No wallet keys."),
};
export function runAgent(agentId: AgentId, actor: string): AgentOutput {
  const agent = store.agents.find((a) => a.id === agentId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  if (store.emergency.globalKillSwitch || store.emergency.disableAgentExecution) {
    agent.status = "paused";
    throw new Error("Agent execution is disabled by emergency control.");
  }
  const output: AgentOutput = { ...PLAYBOOKS[agentId](), id: store.id("aout"), timestamp: store.now(), approvalHistory: [`generated:${actor}`] };
  store.outputs.unshift(output);
  agent.status = "ready";
  agent.lastRun = output.timestamp;
  agent.summary = output.recommendation;
  record(agentId, "agent", "AGENT_OUTPUT", `agent:${agentId}`, { outputId: output.id });
  return output;
}
export function runTeam(actor: string): AgentOutput[] {
  const order: AgentId[] = ["macro", "equities", "crypto", "quant", "news", "portfolio", "risk", "execution", "cio"];
  return order.map((id) => runAgent(id, actor));
}
