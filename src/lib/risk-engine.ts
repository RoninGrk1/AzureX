import type { EmergencyState, PortfolioSnapshot, Position, RiskCheck, RiskCheckResult, RiskLimits, Side, WalletTx } from "./types";
export interface ProposedTradeInput { symbol: string; side: Side; quantity: number; price: number; venue?: string; }
function check(code: string, label: string, passed: boolean, observed: string, limit: string, message: string, required = true): RiskCheck {
  return { code, label, passed, required, observed, limit, message };
}
export function evaluateTrade(params: { trade: ProposedTradeInput; positions: Position[]; snapshot: PortfolioSnapshot; limits: RiskLimits; emergency: EmergencyState; }): RiskCheckResult {
  const { trade, positions, snapshot, limits, emergency } = params;
  const notional = Math.abs(trade.quantity * trade.price);
  const checks: RiskCheck[] = [];
  checks.push(check("VALID_QTY", "Valid quantity", Number.isFinite(trade.quantity) && trade.quantity > 0, String(trade.quantity), "> 0", "Quantity must be finite and > 0."));
  checks.push(check("VALID_PRICE", "Valid price", Number.isFinite(trade.price) && trade.price > 0, String(trade.price), "> 0", "Price must be finite and > 0."));
  checks.push(check("KILL_SWITCH", "Global kill switch", !emergency.globalKillSwitch, emergency.globalKillSwitch ? "ON" : "OFF", "OFF", emergency.globalKillSwitch ? "Kill switch engaged." : "Kill switch off."));
  checks.push(check("PAUSE_TRADING", "Trading pause", !emergency.pauseTrading, emergency.pauseTrading ? "PAUSED" : "LIVE", "LIVE", emergency.pauseTrading ? "Trading paused." : "Trading live."));
  const positionPct = snapshot.nav > 0 ? (notional / snapshot.nav) * 100 : Infinity;
  checks.push(check("MAX_POSITION", "Maximum position size", positionPct <= limits.maxPositionSizePct, `${positionPct.toFixed(2)}%`, `≤ ${limits.maxPositionSizePct}%`, "Position size check."));
  const existing = positions.find((p) => p.symbol === trade.symbol);
  if (trade.side === "sell") {
    const held = existing?.quantity ?? 0;
    checks.push(check("INVENTORY", "Inventory / no naked short", held >= trade.quantity, `held ${held}`, `≥ ${trade.quantity}`, held >= trade.quantity ? "Covered." : "Naked shorting is not enabled."));
  }
  const newQty = (existing?.quantity ?? 0) + (trade.side === "buy" ? trade.quantity : -trade.quantity);
  const concentrationPct = snapshot.nav > 0 ? (Math.abs(newQty * trade.price) / snapshot.nav) * 100 : Infinity;
  checks.push(check("CONCENTRATION", "Maximum asset concentration", concentrationPct <= limits.maxAssetConcentrationPct, `${concentrationPct.toFixed(2)}%`, `≤ ${limits.maxAssetConcentrationPct}%`, "Concentration check."));
  const currentLong = positions.filter((p) => p.marketValue > 0).reduce((s, p) => s + p.marketValue, 0);
  const projectedGross = currentLong + notional;
  const projectedLeverage = snapshot.nav > 0 ? projectedGross / snapshot.nav : Infinity;
  checks.push(check("GROSS", "Gross exposure limit", projectedGross <= limits.maxGrossExposure, projectedGross.toFixed(0), `≤ ${limits.maxGrossExposure}`, "Gross check."));
  checks.push(check("LEVERAGE", "Leverage limit", projectedLeverage <= limits.maxLeverage, projectedLeverage.toFixed(2) + "x", `≤ ${limits.maxLeverage}x`, "Leverage check."));
  const cashAfter = trade.side === "buy" ? snapshot.cash - notional : snapshot.cash + notional;
  const liquidityPct = snapshot.nav > 0 ? (cashAfter / snapshot.nav) * 100 : 0;
  const liquidityOk = trade.side === "sell" ? true : liquidityPct >= limits.minLiquidityPct && cashAfter >= 0;
  checks.push(check("LIQUIDITY", "Liquidity requirement", liquidityOk, `${liquidityPct.toFixed(2)}%`, `≥ ${limits.minLiquidityPct}%`, "Liquidity check."));
  const ddOk = snapshot.drawdown > -Math.abs(limits.drawdownThresholdPct);
  checks.push(check("DRAWDOWN", "Drawdown threshold", ddOk, `${snapshot.drawdown.toFixed(2)}%`, `> -${Math.abs(limits.drawdownThresholdPct)}%`, "Drawdown check."));
  const venue = trade.venue ?? "";
  const blocked = Boolean(venue && limits.blockedCounterparties.some((c) => c.toLowerCase() === venue.toLowerCase()));
  checks.push(check("COUNTERPARTY", "Counterparty restrictions", !blocked, venue || "unspecified", "not restricted", blocked ? `Venue ${venue} restricted.` : "Permitted."));
  const requiredFailed = checks.some((c) => c.required && !c.passed);
  return { passed: !requiredFailed, blocked: requiredFailed, checks };
}
export function evaluateWalletTx(params: { tx: Pick<WalletTx, "type" | "usd" | "counterparty">; limits: RiskLimits; emergency: EmergencyState; allowlistHit: boolean; }): RiskCheckResult {
  const { tx, limits, emergency, allowlistHit } = params;
  const checks: RiskCheck[] = [];
  checks.push(check("KILL_SWITCH", "Global kill switch", !emergency.globalKillSwitch, emergency.globalKillSwitch ? "ON" : "OFF", "OFF", "Kill switch check."));
  if (tx.type === "withdrawal" || tx.type === "transfer") {
    checks.push(check("PAUSE_WD", "Withdrawal pause", !emergency.pauseWithdrawals, emergency.pauseWithdrawals ? "PAUSED" : "LIVE", "LIVE", "Withdrawal pause check."));
    checks.push(check("ALLOWLIST", "Address allowlist", allowlistHit, allowlistHit ? "whitelisted" : "not listed", "must be whitelisted", allowlistHit ? "Allowlisted." : "Not allowlisted."));
  }
  checks.push(check("TX_LIMIT", "Wallet transaction limit", tx.usd <= limits.maxWalletTxUsd, tx.usd.toFixed(0), `≤ ${limits.maxWalletTxUsd}`, "Tx limit check."));
  if (tx.counterparty) {
    const blockedCp = limits.blockedCounterparties.some((c) => c.toLowerCase() === tx.counterparty!.toLowerCase());
    checks.push(check("COUNTERPARTY", "Counterparty restrictions", !blockedCp, tx.counterparty, "not restricted", blockedCp ? "Restricted." : "Permitted."));
  }
  const requiredFailed = checks.some((c) => c.required && !c.passed);
  return { passed: !requiredFailed, blocked: requiredFailed, checks };
}
