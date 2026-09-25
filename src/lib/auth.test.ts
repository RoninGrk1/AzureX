import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authenticate, issueSession, verifySession, can } from "./auth";

describe("auth", () => {
  it("rejects bad passwords", () => {
    assert.equal(authenticate("principal@azurex.local", "wrong"), null);
  });
  it("accepts demo principal", () => {
    const user = authenticate("principal@azurex.local", "AzureX-Demo-2026!");
    assert.ok(user);
    assert.equal(user!.role, "principal");
    const session = verifySession(issueSession(user!));
    assert.ok(session);
    assert.equal(session!.email, "principal@azurex.local");
  });
  it("rejects forged tokens", () => {
    assert.equal(verifySession("not.a.token"), null);
    assert.equal(verifySession(""), null);
  });
  it("enforces RBAC", () => {
    assert.equal(can("auditor", "orders:approve"), false);
    assert.equal(can("principal", "orders:approve"), true);
    assert.equal(can("auditor", "audit:read"), true);
  });
});
