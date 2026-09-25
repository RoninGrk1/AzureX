export interface VenueQuote { venue: string; price: number; expectedSlippageBps: number; available: boolean; }
export interface BestExRecord { orderId: string; selectedVenue: string; venuesConsidered: VenueQuote[]; rationale: string; }
export function selectVenue(orderId: string, quotes: VenueQuote[]): BestExRecord {
  const live = quotes.filter((q) => q.available);
  if (live.length === 0) return { orderId, selectedVenue: "NONE", venuesConsidered: quotes, rationale: "No available venue. Fail closed." };
  const best = live.slice().sort((a, b) => a.expectedSlippageBps - b.expectedSlippageBps)[0];
  return { orderId, selectedVenue: best.venue, venuesConsidered: quotes, rationale: `Selected ${best.venue} on expected slippage ${best.expectedSlippageBps}bps among ${live.length} live venues.` };
}
