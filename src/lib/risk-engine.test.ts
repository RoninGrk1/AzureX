import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateTrade, evaluateWalletTx } from "./risk-engine";
import type { EmergencyState, PortfolioSnapshot, Position, RiskLimits } from "./types";

const limits: RiskLimits = {
  maxPositionSizePct: 20, maxAssetConcentrationPct: 25, maxGrossExposure: 50_000_000,
  maxNetExposure: 45_000_000, maxLeverage: 1.35, minLiquidityPct: 6, dailyLossThresholdPct: 3,
  drawdownThresholdPct: 8, maxWalletTxUsd: 250_000, blockedCounterparties: ["RESTRICTED-VENUE"],
};
const live: EmergencyState = { pauseTrading: false, pauseWithdrawals: false, disableAgentExecution: false, globalKillSwitch: false };
const snapshot: PortfolioSnapshot = {
  nav: 10_000_000, cash: 1_000_000, liquidityBuffer: 0.1, grossExposure: 9_000_000, netExposure: 9_000_000,
  leverage: 0.9, drawdown: -1.2, peakNav: 10_120_000, pnlDay: 20_000, pnlWeek: 50_000, pnlMonth: 120_000, asOf: new Date().toISOString(),
};
const positions: Position[] = [{
  id: "1", symbol: "AAPL", name: "Apple", assetClass: "equity", quantity: 10000, avgCost: 180, lastPrice: 200,
  marketValue: 2_000_000, unrealizedPnl: 200_000, weight: 0.2, venue: "US-EQUITY",
}];

describe("evaluateTrade", () => {
  it("passes a modest buy inside all limits", () => {
    const result = evaluateTrade({ trade: { symbol: "MSFT", side: "buy", quantity: 100, price: 400 }, positions, snapshot, limits, emergency: live });
    assert.equal(result.blocked, false);
  });
  it("blocks when kill switch is on", () => {
    const result = evaluateTrade({ trade: { symbol: "MSFT", side: "buy", quantity: 1, price: 400 }, positions, snapshot, limits, emergency: { ...live, globalKillSwitch: true } });
    assert.equal(result.blocked, true);
  });
  it("blocks oversized position", () => {
    const result = evaluateTrade({ trade: { symbol: "TSLA", side: "buy", quantity: 100_000, price: 250 }, positions, snapshot, limits, emergency: live });
    assert.equal(result.blocked, true);
    assert.ok(result.checks.some((c) => c.code === "MAX_POSITION" && !c.passed));
  });
  it("blocks invalid quantity", () => {
    const result = evaluateTrade({ trade: { symbol: "MSFT", side: "buy", quantity: 0, price: 400 }, positions, snapshot, limits, emergency: live });
    assert.equal(result.blocked, true);
  });
  it("blocks restricted venue", () => {
    const result = evaluateTrade({ trade: { symbol: "MSFT", side: "buy", quantity: 1, price: 400, venue: "RESTRICTED-VENUE" }, positions, snapshot, limits, emergency: live });
    assert.equal(result.blocked, true);
  });
  it("blocks when cash would go negative", () => {
    const result = evaluateTrade({ trade: { symbol: "MSFT", side: "buy", quantity: 10_000, price: 400 }, positions, snapshot, limits, emergency: live });
    assert.equal(result.blocked, true);
    assert.ok(result.checks.some((c) => c.code === "LIQUIDITY" && !c.passed));
  });
  it("blocks naked short", () => {
    const result = evaluateTrade({ trade: { symbol: "MSFT", side: "sell", quantity: 10, price: 400 }, positions, snapshot, limits, emergency: live });
    assert.equal(result.blocked, true);
    assert.ok(result.checks.some((c) => c.code === "INVENTORY" && !c.passed));
  });
  it("allows a reducing sell when drawdown is breached", () => {
    const result = evaluateTrade({
      trade: { symbol: "AAPL", side: "sell", quantity: 10, price: 200 },
      positions, snapshot: { ...snapshot, drawdown: -20 }, limits, emergency: live,
    });
    assert.equal(result.blocked, false);
  });
  it("blocks a buy when drawdown is breached", () => {
    const result = evaluateTrade({
      trade: { symbol: "MSFT", side: "buy", quantity: 1, price: 400 },
      positions, snapshot: { ...snapshot, drawdown: -20 }, limits, emergency: live,
    });
    assert.equal(result.blocked, true);
  });
});

describe("evaluateWalletTx", () => {
  it("blocks withdrawal to non-allowlisted address", () => {
    const result = evaluateWalletTx({ tx: { type: "withdrawal", usd: 1000, counterparty: "0xabc" }, limits, emergency: live, allowlistHit: false });
    assert.equal(result.blocked, true);
  });
  it("blocks over-limit wallet transfer", () => {
    const result = evaluateWalletTx({ tx: { type: "transfer", usd: 1_000_000 }, limits, emergency: live, allowlistHit: true });
    assert.equal(result.blocked, true);
  });
  it("allows small allowlisted withdrawal", () => {
    const result = evaluateWalletTx({ tx: { type: "withdrawal", usd: 10_000 }, limits, emergency: live, allowlistHit: true });
    assert.equal(result.passed, true);
  });
});
