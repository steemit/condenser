/**
 * Search API Route
 * POST /api/search
 */

import { NextRequest, NextResponse } from 'next/server';

interface SearchParams {
  q: string; // search query
  s: string; // sort type
  depth: number; // 0 = posts, 1 = replies, 2 = users
  scroll_id?: string; // for pagination
}

interface ElasticsearchQuery {
  size: number;
  query?: Record<string, unknown>;
  sort?: Record<string, unknown>;
}

// Legacy parity (src/server/api/general.js): abortable ES fetch with a short
// timeout to avoid socket exhaustion when ES DNS breaks or ES is down.
const ES_FETCH_TIMEOUT_MS = 1200;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Legacy default sort field is `created_at` (the ES field name).
    const { q, s = 'created_at', depth = 0, scroll_id } = body as SearchParams;

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

    // Determine search endpoint based on depth
    let searchEndpoint: string;
    if (depth === 1) {
      // Replies
      searchEndpoint = `${elasticSearchEndpoint}/hive_replies/_search?scroll=1m`;
    } else if (depth === 2) {
      // Users
      searchEndpoint = `${elasticSearchEndpoint}/hive_accounts/_search?scroll=1m`;
    } else {
      // Posts (default)
      searchEndpoint = `${elasticSearchEndpoint}/hive_posts/_search?scroll=1m`;
    }

    // Build search query
    const searchQuery: ElasticsearchQuery = {
      size: 30,
    };

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
        [s]: {
          order: 'desc',
        },
      };
    } else {
      // User search
      searchQuery.query = {
        wildcard: {
          name: {
            value: `${q}*`,
          },
        },
      };
    }

    // ES expects the query object itself ({size, query, sort}), NOT a
    // { searchQuery: {...} } wrapper — the wrapper made ES return 400.
    let requestBody: unknown = searchQuery;
    let endpoint = searchEndpoint;

    // Handle scroll pagination
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
