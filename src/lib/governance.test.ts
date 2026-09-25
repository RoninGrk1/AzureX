import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertAgentAllowed } from "./governance";
import { hashEvent, appendAudit, verifyChain } from "./audit";
import type { AuditEvent } from "./types";

describe("AI governance", () => {
  it("denies private key access", () => {
    assert.equal(assertAgentAllowed({ agentId: "execution", action: "prepare_order", wantsPrivateKeys: true }).allowed, false);
  });
  it("denies unauthorised fund movement", () => {
    assert.equal(assertAgentAllowed({ agentId: "execution", action: "move_funds", authorizedByHuman: false }).allowed, false);
  });
  it("allows analysis", () => {
    assert.equal(assertAgentAllowed({ agentId: "macro", action: "publish_brief" }).allowed, true);
  });
});

describe("audit chain", () => {
  it("verifies an intact chain", () => {
    const chain: AuditEvent[] = [];
    appendAudit(chain, { id: "1", timestamp: "t", actor: "a", actorType: "system", action: "X", resource: "r", details: {} });
    appendAudit(chain, { id: "2", timestamp: "t", actor: "a", actorType: "user", action: "Y", resource: "r", details: { n: 1 } });
    assert.equal(verifyChain(chain).valid, true);
    assert.equal(chain[1].prevHash, chain[0].hash);
    assert.equal(hashEvent("GENESIS", { id: "1", timestamp: "t", actor: "a", actorType: "system", action: "X", resource: "r", details: {} }).length, 64);
  });
  it("detects tampering", () => {
    const chain: AuditEvent[] = [];
    appendAudit(chain, { id: "1", timestamp: "t", actor: "a", actorType: "system", action: "X", resource: "r", details: {} });
    chain[0].details = { tampered: true };
    assert.equal(verifyChain(chain).valid, false);
  });
});
