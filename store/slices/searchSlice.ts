import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface SearchResult {
  _source: {
    created_at: string;
    author_rep: number;
    total_votes: number;
    [key: string]: unknown;
  };
  _index?: string;
  [key: string]: unknown;
}

interface SearchHits {
  hits: SearchResult[];
  total: {
    value: number;
  };
}

interface SearchState {
  pending: boolean;
  result: unknown[];
  depth: number;
  total_result: number;
  /**
   * Structured failure kind from /api/search (route answers {error, code?}
   * with 502/503/500). Stored semantically and localized at render time —
   * 'unavailable' covers backend/outage/network failures, 'failed' anything
   * else. Null while results flow normally. The UI must render an error
   * state, not "nothing found", when this is set.
   */
  error: 'unavailable' | 'failed' | null;
}

const searchTypes = ['hive_posts', 'hive_replies', 'hive_accounts'];

const initialState: SearchState = {
  pending: false,
  result: [],
  depth: 0,
  total_result: 0,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchDispatch: (state) => {
      // Saga handles this
    },
    searchPending: (state, action: PayloadAction<{ pending: boolean }>) => {
      state.pending = action.payload.pending;
      // A new request supersedes any rendered error.
      if (action.payload.pending) state.error = null;
    },
    searchReset: (state) => {
      state.result = [];
      state.error = null;
    },
    searchDepth: (state, action: PayloadAction<number>) => {
      state.depth = action.payload;
    },
    searchError: (state, action: PayloadAction<{ kind: 'unavailable' | 'failed' }>) => {
      state.error = action.payload.kind;
    },
    searchResult: (state, action: PayloadAction<{
      hits: SearchHits;
      append?: boolean;
    }>) => {
      const { hits, append } = action.payload;
      const results = hits.hits;
      const depth = state.depth;

      // A successful response clears any rendered error.
      state.error = null;

      if (results.length > 0) {
        if (results[0]._index !== searchTypes[depth]) {
          return; // Don't update if index doesn't match
        }
      }

      const posts = results.map((post) => {
        const updatedPost = { ...post._source };
        updatedPost.created = post._source.created_at;
        updatedPost.author_reputation = post._source.author_rep;
        updatedPost.stats = {
          total_votes: post._source.total_votes,
        };
        return updatedPost;
      });

      if (!append) {
        state.result = posts;
        state.total_result = hits.total.value;
      } else {
        state.result = [...state.result, ...posts];
        state.total_result = hits.total.value;
      }
    },
  },
});

export const {
  searchDispatch,
  searchPending,
  searchReset,
  searchDepth,
  searchError,
  searchResult,
} = searchSlice.actions;

export default searchSlice.reducer;
