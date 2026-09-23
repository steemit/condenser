/**
 * Search API Route
 * POST /api/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { readJsonWithLimit } from '@/lib/api/body-limit';
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitResponse,
} from '@/lib/cache/rate-limit';

interface SearchParams {
  q: string; // search query
  s: string; // sort type
  depth: number; // 0 = posts, 1 = replies, 2 = users
  from?: number; // offset pagination ("load more" page start)
  scroll_id?: string; // legacy scroll continuation (no longer opened here)
}

interface ElasticsearchQuery {
  size: number;
  from?: number;
  query?: Record<string, unknown>;
  sort?: Record<string, unknown>;
}

// Legacy parity (src/server/api/general.js): abortable ES fetch with a short
// timeout to avoid socket exhaustion when ES DNS breaks or ES is down.
const ES_FETCH_TIMEOUT_MS = 1200;

// Page size (legacy parity).
const PAGE_SIZE = 30;

// ES defaults index.max_result_window to 10000; keep from+size inside it so
// deep pagination can never trip a 400 from ES.
const MAX_FROM = 10_000 - PAGE_SIZE;

// Sort fields actually exposed by the UI (SearchContent select: Newest /
// Highest Payout). `s` is used directly as an ES field name, so anything
// outside this set falls back to the legacy default instead of being
// forwarded (audit N-09: arbitrary ES field probing).
const SORT_FIELDS = new Set(['created_at', 'payout']);

/**
 * Escape ES wildcard metacharacters (`*`, `?`, `\`) in user input so a
 * crafted query like `a*a*a*...*b` cannot fan out the automaton
 * (catastrophic backtracking against the ES CPU). The server-appended
 * trailing `*` keeps the prefix-search semantics (audit N-09).
 */
function escapeWildcard(value: string): string {
  return value.replace(/[\\*?]/g, (c) => `\\${c}`);
}

/** Parse and clamp an integer request param; non-numeric values fall back. */
function clampIntParam(
  raw: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed = typeof raw === 'number' && Number.isFinite(raw) ? raw : NaN;
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}

export async function POST(request: NextRequest) {
  try {
    // Abuse wrappers (audit N-08): rate limit before reading the body, then
    // the body size cap. This bounds per-IP load on the ES cluster.
    const rateLimit = await checkRateLimit(request, RATE_LIMITS.search);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterSeconds);
    }

    const limited = await readJsonWithLimit(request);
    if (!limited.ok) {
      return limited.response;
    }
    // Legacy default sort field is `created_at` (the ES field name).
    const { q, s, depth = 0, from, scroll_id } = limited.data as SearchParams;

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // `ELASTICSEARCH_URL` is the documented name (.env.example,
    // docs/CONFIGURATION.md); `ELASTICSEARCH_ENDPOINT` is kept as a legacy
    // alias for existing deployments.
    const elasticSearchEndpoint =
      process.env.ELASTICSEARCH_URL || process.env.ELASTICSEARCH_ENDPOINT;

    if (!elasticSearchEndpoint) {
      // Return mock data for development (intentional dev convenience)
      return NextResponse.json({
        hits: {
          hits: [],
          total: { value: 0 },
        },
        _scroll_id: null,
      });
    }

    // New queries are stateless: no `?scroll=1m`, no `from` beyond the
    // result window. Legacy opened a 1m scroll context on every search;
    // with ES max_open_scroll_context=500 that let ~8 req/s exhaust the
    // scroll pool and 502 all searches (audit N-09). A one-page search
    // (size 30) never needs a scroll context; "load more" paginates with
    // a clamped `from` offset instead. The scroll continuation branch
    // below is kept for callers that already hold a scroll_id — it
    // continues an existing context and never opens a new one.
    let searchEndpoint: string;
    if (depth === 1) {
      // Replies
      searchEndpoint = `${elasticSearchEndpoint}/hive_replies/_search`;
    } else if (depth === 2) {
      // Users
      searchEndpoint = `${elasticSearchEndpoint}/hive_accounts/_search`;
    } else {
      // Posts (default)
      searchEndpoint = `${elasticSearchEndpoint}/hive_posts/_search`;
    }

    // Sort whitelist: only the fields the UI exposes; anything else falls
    // back to the legacy default (no arbitrary ES field names, audit N-09).
    const sortField =
      typeof s === 'string' && SORT_FIELDS.has(s) ? s : 'created_at';
    const offset = clampIntParam(from, 0, 0, MAX_FROM);

    // Build search query
    const searchQuery: ElasticsearchQuery = {
      size: PAGE_SIZE,
    };
    if (offset > 0) {
      searchQuery.from = offset;
    }

    if (depth < 2) {
      // Posts and replies search
      searchQuery.query = {
        match_phrase: {
          searchable: {
            query: q,
            slop: 3,
          },
        },
      };
      searchQuery.sort = {
        [sortField]: {
          order: 'desc',
        },
      };
    } else {
      // User search: escape wildcard metacharacters in q, then append the
      // server-owned trailing `*` (prefix search, audit N-09).
      searchQuery.query = {
        wildcard: {
          name: {
            value: `${escapeWildcard(q)}*`,
          },
        },
      };
    }

    // ES expects the query object itself ({size, from, query, sort}), NOT a
    // { searchQuery: {...} } wrapper — the wrapper made ES return 400.
    let requestBody: unknown = searchQuery;
    let endpoint = searchEndpoint;

    // Legacy scroll continuation (audit N-09): only reachable when the
    // caller already holds a scroll_id; never opens a new context.
    if (scroll_id) {
      endpoint = `${elasticSearchEndpoint}/_search/scroll`;
      requestBody = {
        scroll: '1m',
        scroll_id,
      };
    }

    // Make request to Elasticsearch
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(ES_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Pass through non-2xx from ES as 502 to make the failure explicit
      // (legacy behavior).
      return NextResponse.json(
        {
          error: 'Search backend error',
          code: 'SEARCH_BACKEND_ERROR',
          es_status: response.status,
        },
        { status: 502 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: unknown) {
    // ES connectivity failure or timeout: search is unavailable (503),
    // never a silent 200 with empty hits.
    const errName = (error as { name?: string } | null)?.name;
    const isConnectivityError =
      error instanceof DOMException ||
      error instanceof TypeError ||
      errName === 'TimeoutError' ||
      errName === 'AbortError';
    if (isConnectivityError) {
      console.error('Search unavailable (ES connectivity/timeout):', error);
      return NextResponse.json(
        {
          error: 'Search temporarily unavailable',
          code: 'SEARCH_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}
