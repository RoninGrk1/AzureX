import { paperAdapter } from "./paper";
import type { ExecutionAdapter, ExecutionFill, ExecutionRequest } from "./types";
const adapters: ExecutionAdapter[] = [paperAdapter];
export function listAdapters() {
  return adapters.map((a) => ({ id: a.id, kind: a.kind, enabled: a.enabled() }));
}
export function getAdapter(id?: string): ExecutionAdapter {
  if (id) {
    const found = adapters.find((a) => a.id === id);
    if (!found) throw new Error(`Unknown execution adapter: ${id}`);
    return found;
  }
  return paperAdapter;
}
export async function routeOrder(req: ExecutionRequest, adapterId?: string): Promise<ExecutionFill> {
  if (!req.clientOrderId) throw new Error("clientOrderId required for idempotency.");
  return getAdapter(adapterId).submit(req);
}
