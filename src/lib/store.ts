import { appendAudit } from "./audit";
import type { AddressBookEntry, AgentOutput, AgentState, Alert, AuditEvent, EmergencyState, MarketQuote, PortfolioSnapshot, Position, RiskLimits, TradeProposal, Wallet, WalletTx } from "./types";

const now = () => new Date().toISOString();
function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
const POSITIONS: Position[] = [
  { id: "pos_aapl", symbol: "AAPL", name: "Apple Inc.", assetClass: "equity", quantity: 18500, avgCost: 178.4, lastPrice: 228.16, marketValue: 18500 * 228.16, unrealizedPnl: 18500 * (228.16 - 178.4), weight: 0, venue: "US-EQUITY" },
  { id: "pos_msft", symbol: "MSFT", name: "Microsoft Corp.", assetClass: "equity", quantity: 9200, avgCost: 312.1, lastPrice: 428.9, marketValue: 9200 * 428.9, unrealizedPnl: 9200 * (428.9 - 312.1), weight: 0, venue: "US-EQUITY" },
  { id: "pos_nvda", symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "equity", quantity: 6400, avgCost: 62.4, lastPrice: 119.8, marketValue: 6400 * 119.8, unrealizedPnl: 6400 * (119.8 - 62.4), weight: 0, venue: "US-EQUITY" },
  { id: "pos_spy", symbol: "SPY", name: "SPDR S&P 500 ETF", assetClass: "etf", quantity: 12000, avgCost: 448.2, lastPrice: 572.4, marketValue: 12000 * 572.4, unrealizedPnl: 12000 * (572.4 - 448.2), weight: 0, venue: "US-EQUITY" },
  { id: "pos_btc", symbol: "BTC", name: "Bitcoin", assetClass: "crypto", quantity: 42.5, avgCost: 41200, lastPrice: 64280, marketValue: 42.5 * 64280, unrealizedPnl: 42.5 * (64280 - 41200), weight: 0, venue: "COINBASE-PRIME" },
  { id: "pos_eth", symbol: "ETH", name: "Ethereum", assetClass: "crypto", quantity: 380, avgCost: 2140, lastPrice: 2688, marketValue: 380 * 2688, unrealizedPnl: 380 * (2688 - 2140), weight: 0, venue: "COINBASE-PRIME" },
  { id: "pos_sol", symbol: "SOL", name: "Solana", assetClass: "crypto", quantity: 4200, avgCost: 98.5, lastPrice: 148.2, marketValue: 4200 * 148.2, unrealizedPnl: 4200 * (148.2 - 98.5), weight: 0, venue: "COINBASE-PRIME" },
];
const CASH = 4850000;
const INVESTED = POSITIONS.reduce((s, p) => s + p.marketValue, 0);
const NAV = INVESTED + CASH;
POSITIONS.forEach((p) => { p.weight = p.marketValue / NAV; });
const snapshot: PortfolioSnapshot = { nav: NAV, cash: CASH, liquidityBuffer: CASH / NAV, grossExposure: INVESTED, netExposure: INVESTED, leverage: INVESTED / NAV, drawdown: -2.8, peakNav: NAV / 0.972, pnlDay: 186420, pnlWeek: 512880, pnlMonth: 1248600, asOf: now() };
const limits: RiskLimits = { maxPositionSizePct: 20, maxAssetConcentrationPct: 25, maxGrossExposure: NAV * 1.25, maxNetExposure: NAV * 1.15, maxLeverage: 1.35, minLiquidityPct: 6, dailyLossThresholdPct: 3, drawdownThresholdPct: 8, maxWalletTxUsd: 250000, blockedCounterparties: ["RESTRICTED-VENUE", "SANCTIONED-OTC"] };
const agents: AgentState[] = [
  { id: "cio", name: "CIO / Orchestrator", role: "Coordinates the AI team.", status: "ready", lastRun: now(), summary: "Neutral-to-constructive.", model: "azurex-cio-orchestrator", version: "1.4.2" },
  { id: "macro", name: "Macro Agent", role: "Rates and regimes.", status: "ready", lastRun: now(), summary: "USD mildly firm.", model: "azurex-macro", version: "1.3.0" },
  { id: "equities", name: "Equities Agent", role: "Fundamentals.", status: "ready", lastRun: now(), summary: "Quality compounders.", model: "azurex-eq", version: "1.2.8" },
  { id: "crypto", name: "Crypto Agent", role: "On-chain and structure.", status: "ready", lastRun: now(), summary: "Outflows constructive.", model: "azurex-crypto", version: "1.5.1" },
  { id: "quant", name: "Quant Agent", role: "Factors and vol.", status: "ready", lastRun: now(), summary: "Momentum intact on BTC.", model: "azurex-quant", version: "1.1.9" },
  { id: "news", name: "News Agent", role: "Headlines.", status: "ready", lastRun: now(), summary: "No adverse print.", model: "azurex-news", version: "1.0.7" },
  { id: "portfolio", name: "Portfolio Agent", role: "Book and attribution.", status: "ready", lastRun: now(), summary: "Balanced book.", model: "azurex-port", version: "1.2.0" },
  { id: "risk", name: "Risk Agent", role: "Limits.", status: "ready", lastRun: now(), summary: "Limits green.", model: "azurex-risk", version: "1.4.0" },
  { id: "execution", name: "Execution Agent", role: "Orders. No autonomous send.", status: "idle", lastRun: now(), summary: "Standing by.", model: "azurex-exec", version: "1.0.4" },
];
const quotes: MarketQuote[] = [
  { symbol: "AAPL", name: "Apple", assetClass: "equity", price: 228.16, changePct: 0.42, volume: "48.2M" },
  { symbol: "MSFT", name: "Microsoft", assetClass: "equity", price: 428.9, changePct: 0.18, volume: "21.4M" },
  { symbol: "NVDA", name: "NVIDIA", assetClass: "equity", price: 119.8, changePct: -0.86, volume: "312M" },
  { symbol: "SPY", name: "S&P 500 ETF", assetClass: "etf", price: 572.4, changePct: 0.21, volume: "62M" },
  { symbol: "BTC", name: "Bitcoin", assetClass: "crypto", price: 64280, changePct: 1.64, volume: "$28.4B" },
  { symbol: "ETH", name: "Ethereum", assetClass: "crypto", price: 2688, changePct: 0.92, volume: "$12.1B" },
  { symbol: "SOL", name: "Solana", assetClass: "crypto", price: 148.2, changePct: 2.11, volume: "$3.8B" },
];
const wallets: Wallet[] = [
  { id: "wal_prime", label: "Prime Custody", chain: "multi", address: "custodian:fireblocks:vault-01", type: "custodial", balanceUsd: 2140000, assets: [{ symbol: "USDC", amount: 890000, usd: 890000 }], whitelisted: true, performance30d: 3.2 },
  { id: "wal_hw", label: "Cold Storage Ledger", chain: "bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", type: "hardware", balanceUsd: 1620000, assets: [{ symbol: "BTC", amount: 25.2, usd: 25.2 * 64280 }], whitelisted: true, performance30d: 4.1 },
];
const addressBook: AddressBookEntry[] = [
  { id: "ab_1", label: "Prime settlement", chain: "ethereum", address: "0x1111111111111111111111111111111111111111", whitelisted: true, riskScreen: "clear" },
];
const walletTxs: WalletTx[] = [];
const proposals: TradeProposal[] = [
  { id: "ord_btc_add", asset: "BTC", assetClass: "crypto", side: "buy", quantity: 1.25, estimatedValue: 1.25 * 64280, entry: 64280, riskUsd: 4800, expectedSlippageBps: 6, portfolioImpact: "BTC weight +0.17%.", reasoning: "Constructive on-chain outflows.", evidence: ["exchange net outflow"], agentId: "cio", status: "pending_approval", createdAt: now(), updatedAt: now() },
];
const outputs: AgentOutput[] = [];
const alerts: Alert[] = [{ id: "al_1", severity: "info", title: "CIO briefing ready", body: "Two proposals require review.", createdAt: now(), acknowledged: false }];
const emergency: EmergencyState = { pauseTrading: false, pauseWithdrawals: false, disableAgentExecution: false, globalKillSwitch: false };
const audit: AuditEvent[] = [];
appendAudit(audit, { id: id("aud"), timestamp: now(), actor: "system", actorType: "system", action: "STORE_INIT", resource: "platform", details: { env: process.env.NODE_ENV ?? "development" } });
export const store = { positions: POSITIONS, snapshot, limits, agents, quotes, wallets, addressBook, walletTxs, proposals, outputs, alerts, emergency, audit, id, now };
export function recalcSnapshot(): void {
  const invested = store.positions.reduce((s, p) => s + p.marketValue, 0);
  store.snapshot.nav = invested + store.snapshot.cash;
  store.snapshot.grossExposure = invested;
  store.snapshot.netExposure = invested;
  store.snapshot.leverage = store.snapshot.nav > 0 ? invested / store.snapshot.nav : 0;
  store.snapshot.liquidityBuffer = store.snapshot.nav > 0 ? store.snapshot.cash / store.snapshot.nav : 0;
  store.snapshot.asOf = now();
  store.positions.forEach((p) => { p.weight = store.snapshot.nav > 0 ? p.marketValue / store.snapshot.nav : 0; });
}
export function record(actor: string, actorType: AuditEvent["actorType"], action: string, resource: string, details: Record<string, unknown> = {}): AuditEvent {
  return appendAudit(store.audit, { id: id("aud"), timestamp: now(), actor, actorType, action, resource, details });
}
