"use client";

import { useEffect, useState } from "react";

import { useAppSelector } from "@/store/hooks";
import { recordAdsView } from "@/lib/analytics/overseer";

/**
 * Coin Marketplace (legacy elements/SteemMarket.jsx): sparkline chart per
 * coin in the right rail. Each chart is an ad slot — clicking through to
 * poloniex reports recordAdsView with the page tag. Renders nothing while
 * the market endpoint returns no data (legacy parity).
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

/** Legacy Coin url switch: exchange pages on poloniex per symbol. */
function exchangeUrl(symbol: string): string {
  switch (symbol) {
    case "STEEM":
      return "https://poloniex.com/exchange#trx_steem";
    case "BTC":
      return "https://poloniex.com/exchange#usdt_btc";
    case "ETH":
      return "https://poloniex.com/exchange#usdt_eth";
    case "TRX":
      return "https://poloniex.com/exchange#usdt_trx";
    case "JST":
      return "https://poloniex.com/exchange#trx_jst";
    default:
      return "";
  }
}

const STEEM_COLOR = "#09d6a8";
const DEFAULT_COLOR = "#788187";
const W = 120;
const H = 30;

function Sparkline({
  prices,
  color,
  onHover,
}: {
  prices: number[];
  color: string;
  onHover?: (index: number | null) => void;
}) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const points = prices.map((p, i) => {
    const x = prices.length > 1 ? (i / (prices.length - 1)) * W : W / 2;
    const y = H - 2 - ((p - min) / span) * (H - 4);
    return { x, y };
  });
  const poly = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-[30px] w-full cursor-pointer"
      onMouseLeave={() => onHover?.(null)}
    >
      <polyline
        points={poly}
        fill="none"
        stroke={color}
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      />
      {onHover &&
        points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={8}
            fill="transparent"
            onMouseEnter={() => onHover(i)}
          />
        ))}
    </svg>
  );
}

function CoinChart({
  coin,
  color,
  trackingId,
  page,
}: {
  coin: Coin;
  color: string;
  trackingId: string;
  page: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  // Legacy hides XEP via display:none in the Coin component.
  if (coin.symbol === "XRP") return null;

  const prices = coin.timepoints.map((p) => parseFloat(String(p.price_usd)));
  if (prices.length === 0) return null;
  const priceUsd = prices[prices.length - 1];
  const url = exchangeUrl(coin.symbol);

  let caption = "";
  if (hover !== null && coin.timepoints[hover]) {
    const point = coin.timepoints[hover];
    const price = parseFloat(String(point.price_usd)).toFixed(2);
    const time = new Date(point.timepoint).toLocaleString();
    caption = `$${price} ${time}`;
  }

  const chart = (
    <div className="chart">
      <Sparkline
        prices={prices}
        color={color}
        onHover={(i) => setHover(i)}
      />
      <div className="caption h-[1.2em] text-[0.75rem] text-muted-foreground">
        {caption}
      </div>
    </div>
  );

  return (
    <div className="coin mb-2 last:mb-0">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => recordAdsView({ trackingId, adTag: page })}
        >
          {chart}
        </a>
      ) : (
        chart
      )}
      <div className="coin-label">
        <span className="symbol font-bold text-foreground">{coin.symbol}</span>{" "}
        <span className="price text-foreground">
          {priceUsd.toFixed(coin.symbol === "JST" ? 3 : 2)}
        </span>
      </div>
    </div>
  );
}

export default function SteemMarket({ page }: { page: string }) {
  const trackingId = useAppSelector((s) => s.user.trackingId);
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/steem/market")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) setData(json.data as MarketData);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data || !data.steem) return null;

  // Legacy render order: steem, tron, jst, top_coins..., sbd.
  const coins = [data.steem, data.tron, data.jst, ...(data.top_coins ?? []), data.sbd].filter(
    (c): c is Coin => Boolean(c)
  );
  if (coins.length === 0) return null;

  return (
    <div className="c-sidebar__module mb-4 rounded-[6px] border border-border bg-card p-[1.5em]">
      <div className="c-sidebar__header mb-2">
        <h3 className="c-sidebar__h3 font-bold text-foreground">Coin Marketplace</h3>
      </div>
      <div className="c-sidebar__content">
        {coins.map((coin) => (
          <CoinChart
            key={coin.symbol}
            coin={coin}
            color={coin.symbol === "STEEM" ? STEEM_COLOR : DEFAULT_COLOR}
            trackingId={trackingId}
            page={page}
          />
        ))}
      </div>
    </div>
  );
}
