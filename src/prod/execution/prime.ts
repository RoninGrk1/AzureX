import type { ExecutionAdapter, ExecutionFill, ExecutionRequest } from "./types";
export function primeAdapter(id: string, kind: "equity_prime" | "crypto_prime"): ExecutionAdapter {
  return {
    id, kind,
    enabled: () => process.env.EXECUTION_MODE === "live" && Boolean(process.env.VAULT_ADDR),
    async submit(req: ExecutionRequest): Promise<ExecutionFill> {
      if ("privateKey" in (req as object)) throw new Error("Execution request must not contain secrets.");
      if (process.env.EXECUTION_MODE !== "live") {
        return { adapter: id, venue: id, clientOrderId: req.clientOrderId, brokerOrderId: "", quantity: 0, price: 0, status: "disabled", reason: "Live execution disabled." };
      }
      if (!req.approvedBy) {
        return { adapter: id, venue: id, clientOrderId: req.clientOrderId, brokerOrderId: "", quantity: 0, price: 0, status: "rejected", reason: "Human approval required." };
      }
      return { adapter: id, venue: id, clientOrderId: req.clientOrderId, brokerOrderId: "", quantity: 0, price: 0, status: "disabled", reason: `${id} live transport not attached in this environment.` };
    },
  };
}
export const coinbasePrime = primeAdapter("coinbase-prime", "crypto_prime");
export const equityPrime = primeAdapter("equity-prime", "equity_prime");
