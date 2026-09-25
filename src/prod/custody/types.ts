export interface CustodyBalance { vaultId: string; asset: string; available: number; usd: number; }
export interface TransferIntent { vaultId: string; asset: string; amount: number; destinationId: string; approvedBy: string; }
export interface CustodyProvider {
  id: "fireblocks" | "bitgo" | "ledger-enterprise" | "simulated";
  listBalances(): Promise<CustodyBalance[]>;
  proposeTransfer(intent: TransferIntent): Promise<{ requestId: string; status: string }>;
}
