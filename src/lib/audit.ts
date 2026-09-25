import { createHash } from "crypto";
import type { AuditEvent } from "./types";
export function hashEvent(prevHash: string, event: Omit<AuditEvent, "hash" | "prevHash">): string {
  const payload = JSON.stringify({ id: event.id, timestamp: event.timestamp, actor: event.actor, actorType: event.actorType, action: event.action, resource: event.resource, details: event.details, prevHash });
  return createHash("sha256").update(payload).digest("hex");
}
export function appendAudit(chain: AuditEvent[], event: Omit<AuditEvent, "hash" | "prevHash">): AuditEvent {
  const prevHash = chain.length === 0 ? "GENESIS" : chain[chain.length - 1].hash;
  const hash = hashEvent(prevHash, event);
  const full: AuditEvent = { ...event, prevHash, hash };
  chain.push(full);
  return full;
}
export function verifyChain(chain: AuditEvent[]): { valid: boolean; brokenAt?: number } {
  for (let i = 0; i < chain.length; i++) {
    const prevHash = i === 0 ? "GENESIS" : chain[i - 1].hash;
    if (chain[i].prevHash !== prevHash) return { valid: false, brokenAt: i };
    const { hash, prevHash: _p, ...rest } = chain[i];
    if (hashEvent(prevHash, rest) !== hash) return { valid: false, brokenAt: i };
  }
  return { valid: true };
}
