export type VenueKind = "equity_prime" | "crypto_prime" | "paper";
export interface ExecutionRequest {
  clientOrderId: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  limitPrice: number;
  venue?: string;
  approvedBy: string;
}
export interface ExecutionFill {
  adapter: string;
  venue: string;
  clientOrderId: string;
  brokerOrderId: string;
  quantity: number;
  price: number;
  status: "accepted" | "filled" | "rejected" | "disabled";
  reason?: string;
}
export interface ExecutionAdapter {
  id: string;
  kind: VenueKind;
  enabled(): boolean;
  submit(req: ExecutionRequest): Promise<ExecutionFill>;
}
