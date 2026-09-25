export type Role =
  | "principal"
  | "cio"
  | "risk_officer"
  | "trader"
  | "auditor"
  | "ops";

export type AssetClass = "equity" | "etf" | "crypto" | "cash";
export type Side = "buy" | "sell";
export type OrderStatus =
  | "proposed" | "risk_check" | "blocked" | "cio_review" | "pending_approval"
  | "approved" | "rejected" | "executing" | "filled" | "failed" | "cancelled";
export type AgentId =
  | "cio" | "macro" | "equities" | "crypto" | "quant" | "news" | "portfolio" | "risk" | "execution";
export type AgentStatus = "idle" | "running" | "ready" | "error" | "paused";

export interface User { id: string; email: string; name: string; role: Role; mfaEnabled: boolean; }
export interface Position { id: string; symbol: string; name: string; assetClass: AssetClass; quantity: number; avgCost: number; lastPrice: number; marketValue: number; unrealizedPnl: number; weight: number; venue: string; }
export interface PortfolioSnapshot { nav: number; cash: number; liquidityBuffer: number; grossExposure: number; netExposure: number; leverage: number; drawdown: number; peakNav: number; pnlDay: number; pnlWeek: number; pnlMonth: number; asOf: string; }
export interface RiskLimits { maxPositionSizePct: number; maxAssetConcentrationPct: number; maxGrossExposure: number; maxNetExposure: number; maxLeverage: number; minLiquidityPct: number; dailyLossThresholdPct: number; drawdownThresholdPct: number; maxWalletTxUsd: number; blockedCounterparties: string[]; }
export interface RiskCheck { code: string; label: string; passed: boolean; required: boolean; observed: string; limit: string; message: string; }
export interface RiskCheckResult { passed: boolean; blocked: boolean; checks: RiskCheck[]; }
export interface TradeProposal { id: string; asset: string; assetClass: AssetClass; side: Side; quantity: number; estimatedValue: number; entry: number; riskUsd: number; expectedSlippageBps: number; portfolioImpact: string; reasoning: string; evidence: string[]; agentId: AgentId; status: OrderStatus; riskApproval?: RiskCheckResult; cioNotes?: string; createdAt: string; updatedAt: string; approvedBy?: string; rejectedReason?: string; fillPrice?: number; }
export interface Wallet { id: string; label: string; chain: string; address: string; type: "custodial" | "hardware" | "multisig"; balanceUsd: number; assets: { symbol: string; amount: number; usd: number }[]; whitelisted: boolean; performance30d: number; }
export interface WalletTx { id: string; walletId: string; type: "deposit" | "withdrawal" | "transfer" | "trade"; asset: string; amount: number; usd: number; counterparty?: string; status: "pending" | "confirmed" | "blocked" | "failed"; createdAt: string; }
export interface AddressBookEntry { id: string; label: string; chain: string; address: string; whitelisted: boolean; riskScreen: "clear" | "review" | "blocked"; }
export interface AgentState { id: AgentId; name: string; role: string; status: AgentStatus; lastRun?: string; summary?: string; model: string; version: string; }
export interface AgentOutput { id: string; agentId: AgentId; model: string; version: string; timestamp: string; inputSources: string[]; evidence: string[]; assumptions: string[]; recommendation: string; riskAssessment: string; approvalHistory: string[]; }
export interface AuditEvent { id: string; timestamp: string; actor: string; actorType: "user" | "agent" | "system"; action: string; resource: string; details: Record<string, unknown>; hash: string; prevHash: string; }
export interface Alert { id: string; severity: "info" | "warning" | "critical"; title: string; body: string; createdAt: string; acknowledged: boolean; }
export interface MarketQuote { symbol: string; name: string; assetClass: AssetClass; price: number; changePct: number; volume: string; }
export interface EmergencyState { pauseTrading: boolean; pauseWithdrawals: boolean; disableAgentExecution: boolean; globalKillSwitch: boolean; }
export interface SessionPayload { userId: string; email: string; role: Role; exp: number; }
