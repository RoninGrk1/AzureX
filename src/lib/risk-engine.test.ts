import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateTrade } from "./risk-engine";
import type { EmergencyState, PortfolioSnapshot, Position, RiskLimits } from "./types";
const snapshot: PortfolioSnapshot = { nav: 1000000, cash: 200000, liquidityBuffer: 0.2, grossExposure: 800000, netExposure: 800000, leverage: 0.8, drawdown: -1, peakNav: 1010000, pnlDay: 1000, pnlWeek: 2000, pnlMonth: 3000, asOf: "t" };
const limits: RiskLimits = { maxPositionSizePct: 20, maxAssetConcentrationPct: 25, maxGrossExposure: 1250000, maxNetExposure: 1150000, maxLeverage: 1.35, minLiquidityPct: 6, dailyLossThresholdPct: 3, drawdownThresholdPct: 8, maxWalletTxUsd: 250000, blockedCounterparties: ["BAD"] };
const emergency: EmergencyState = { pauseTrading: false, pauseWithdrawals: false, disableAgentExecution: false, globalKillSwitch: false };
const positions: Position[] = [{ id: "1", symbol: "BTC", name: "Bitcoin", assetClass: "crypto", quantity: 2, avgCost: 40000, lastPrice: 60000, marketValue: 120000, unrealizedPnl: 40000, weight: 0.12, venue: "X" }];
describe("risk engine", () => {
  it("passes a small buy", () => {
    const r = evaluateTrade({ trade: { symbol: "ETH", side: "buy", quantity: 1, price: 2000 }, positions, snapshot, limits, emergency });
    assert.equal(r.blocked, false);
  });
  it("blocks kill switch", () => {
    const r = evaluateTrade({ trade: { symbol: "ETH", side: "buy", quantity: 1, price: 2000 }, positions, snapshot, limits, emergency: { ...emergency, globalKillSwitch: true } });
    assert.equal(r.blocked, true);
  });
});
