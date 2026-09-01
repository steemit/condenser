import { NextResponse } from "next/server";

/**
 * Coin Marketplace data (legacy server/utils/SteemMarket.js): the legacy
 * server polled an external market endpoint (STEEM_MARKET_ENDPOINT with a
 * Token-auth header), cached it in-process with a 2h TTL, and injected it
 * into every SSR render. Here the client fetches this route instead; the
 * route does the same fetch+cache server-side. Unset endpoint means the
 * module stays hidden (legacy stored empty data and SteemMarket rendered
 * null).
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
  const endpoint = process.env.STEEM_MARKET_ENDPOINT;
  if (!endpoint) return {};
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
      .catch((err) => {
        // Serve stale past TTL rather than dropping the module; empty on
        // the very first failure like legacy storeEmpty().
        console.error("Steem market fetch failed:", err instanceof Error ? err.message : err);
        return cache?.data ?? {};
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function GET() {
  return NextResponse.json({ data: await getMarket() });
}
