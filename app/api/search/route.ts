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
  query?: any;
  sort?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, s = 'created', depth = 0, scroll_id } = body as SearchParams;

    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Get Elasticsearch endpoint from environment
    const elasticSearchEndpoint = process.env.ELASTICSEARCH_ENDPOINT;
    
    if (!elasticSearchEndpoint) {
      // Return mock data for development
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

    let requestBody: any = { searchQuery };
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
    });

    if (!response.ok) {
      throw new Error(`Elasticsearch request failed: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Search error:', error);
    
    // Return empty results on error (for development)
    return NextResponse.json({
      hits: {
        hits: [],
        total: { value: 0 },
      },
      _scroll_id: null,
      error: error.message,
    });
  }
}
