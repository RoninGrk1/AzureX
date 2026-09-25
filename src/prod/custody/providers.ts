import { assertNoPrivateMaterial, custodyAllowed } from "./policy";
import type { CustodyBalance, CustodyProvider, TransferIntent } from "./types";
export const simulatedCustody: CustodyProvider = {
  id: "simulated",
  async listBalances(): Promise<CustodyBalance[]> {
    return [
      { vaultId: "vault-prime", asset: "USDC", available: 890000, usd: 890000 },
      { vaultId: "vault-cold", asset: "BTC", available: 25.2, usd: 25.2 * 64280 },
    ];
  },
  async proposeTransfer(intent: TransferIntent) {
    assertNoPrivateMaterial(intent);
    const gate = custodyAllowed("propose_transfer", Boolean(intent.approvedBy));
    if (!gate.ok) throw new Error(gate.reason);
    return { requestId: `cust_${Date.now().toString(36)}`, status: "pending_custodian_policy" };
  },
};
