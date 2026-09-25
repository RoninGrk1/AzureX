import type { ExecutionAdapter, ExecutionFill, ExecutionRequest } from "./types";
const seen = new Map<string, ExecutionFill>();
export const paperAdapter: ExecutionAdapter = {
  id: "paper",
  kind: "paper",
  enabled: () => process.env.EXECUTION_MODE !== "live",
  async submit(req: ExecutionRequest): Promise<ExecutionFill> {
    const existing = seen.get(req.clientOrderId);
    if (existing) return existing;
    if (!req.approvedBy) {
      return { adapter: "paper", venue: "PAPER", clientOrderId: req.clientOrderId, brokerOrderId: "", quantity: 0, price: 0, status: "rejected", reason: "Human approval required." };
    }
    const fill: ExecutionFill = { adapter: "paper", venue: "PAPER", clientOrderId: req.clientOrderId, brokerOrderId: `paper_${req.clientOrderId}`, quantity: req.quantity, price: req.limitPrice, status: "filled" };
    seen.set(req.clientOrderId, fill);
    return fill;
  },
};
