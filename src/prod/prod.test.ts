import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertNoPrivateMaterial, custodyAllowed } from "./custody/policy";
import { paperAdapter } from "./execution/paper";
import { authorizeOidc } from "./identity/oidc";
import { evaluateTravelRule } from "./compliance/travel-rule";
import { selectVenue } from "./compliance/best-execution";
import { redact } from "./secrets/vault";

describe("custody policy", () => {
  it("rejects private keys", () => { assert.throws(() => assertNoPrivateMaterial({ transfer: { privateKey: "x" } })); });
  it("allows clean intents", () => { assert.doesNotThrow(() => assertNoPrivateMaterial({ vaultId: "v", amount: 1 })); });
  it("requires human approval to sign", () => {
    assert.equal(custodyAllowed("sign_request", false).ok, false);
    assert.equal(custodyAllowed("sign_request", true).ok, true);
  });
});
describe("execution", () => {
  it("is idempotent", async () => {
    const req = { clientOrderId: "cid-1", symbol: "BTC", side: "buy" as const, quantity: 1, limitPrice: 100, approvedBy: "principal@azurex.local" };
    const a = await paperAdapter.submit(req);
    const b = await paperAdapter.submit(req);
    assert.equal(a.brokerOrderId, b.brokerOrderId);
  });
});
describe("identity", () => {
  it("requires hardware AMR for principal", () => {
    assert.equal(authorizeOidc({ sub: "1", email: "a@b.c", roles: ["principal"] }).ok, false);
    assert.equal(authorizeOidc({ sub: "1", email: "a@b.c", roles: ["principal"], amr: ["hwk"] }).ok, true);
  });
});
describe("compliance", () => {
  it("blocks restricted VASPs", () => {
    assert.equal(evaluateTravelRule({ assetClass: "crypto", usd: 10, counterparty: "SANCTIONED-OTC" }).status, "blocked");
  });
  it("holds large transfers without originator", () => {
    assert.equal(evaluateTravelRule({ assetClass: "crypto", usd: 50000 }).status, "hold");
  });
  it("selects lowest slippage live venue", () => {
    const rec = selectVenue("o1", [
      { venue: "A", price: 1, expectedSlippageBps: 12, available: true },
      { venue: "B", price: 1, expectedSlippageBps: 4, available: true },
      { venue: "C", price: 1, expectedSlippageBps: 1, available: false },
    ]);
    assert.equal(rec.selectedVenue, "B");
  });
});
describe("secrets", () => {
  it("redacts", () => { assert.match(redact("supersecret"), /su/); });
});
