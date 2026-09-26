import { NextResponse } from "next/server";

/**
 * Coin Marketplace data (legacy server/utils/SteemMarket.js): the legacy
 * server polled an external market endpoint (STEEM_MARKET_ENDPOINT with a
 * Token-auth header), cached it in-process with a 2h TTL, and injected it
 * into every SSR render. Here the client fetches this route instead; the
 * route does the same fetch+cache server-side.
 *
 * Error semantics: "not configured" (endpoint env unset) answers 503, an
 * upstream failure with no cached copy answers 500, and valid data answers
 * 200 — the three states stay distinguishable instead of all collapsing
 * into a 200 with empty data. A failure with a stale copy still serves it
 * (stale-while-error, like lib/cache/server-cache.ts). The consumer hides
 * the module on any non-2xx, matching legacy's empty-data rendering.
 */

interface Timepoint {
  price_usd: string | number;
  timepoint: string;
}

interface Coin {
  name: string;
  symbol: string;
  timepoints: Timepoint[];
}

interface MarketData {
  steem?: Coin;
  sbd?: Coin;
  tron?: Coin;
  jst?: Coin;
  top_coins?: Coin[];
}

const TTL_MS = 2 * 60 * 60 * 1000; // legacy steem_market_cache.ttl: 7200

let cache: { data: MarketData; at: number } | null = null;
let inflight: Promise<MarketData> | null = null;

async function fetchMarket(): Promise<MarketData> {
  // Only reached after GET's not-configured gate; the endpoint is set.
  const endpoint = process.env.STEEM_MARKET_ENDPOINT as string;
  const headers: Record<string, string> = {};
  const token = process.env.STEEM_MARKET_TOKEN;
  if (token) headers.Authorization = `Token ${token}`;
  const res = await fetch(endpoint, {
    headers,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`market endpoint ${res.status}`);
  return (await res.json()) as MarketData;
}

function getMarket(): Promise<MarketData> {
  if (cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.data);
  if (!inflight) {
    inflight = fetchMarket()
      .then((data) => {
        cache = { data, at: Date.now() };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function GET() {
  if (!process.env.STEEM_MARKET_ENDPOINT) {
    return NextResponse.json(
      { error: "Market endpoint not configured" },
      { status: 503 }
    );
  }
  try {
    return NextResponse.json({ data: await getMarket() });
  } catch (error: unknown) {
    console.error(
      "Steem market fetch failed:",
      error instanceof Error ? error.message : error
    );
    // Upstream failure: serve the stale copy when one exists; otherwise the
    // outage is explicit (500) rather than masked as empty data.
    if (cache) {
      return NextResponse.json({ data: cache.data });
    }
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
