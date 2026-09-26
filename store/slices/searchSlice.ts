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
}

const searchTypes = ['hive_posts', 'hive_replies', 'hive_accounts'];

const initialState: SearchState = {
  pending: false,
  result: [],
  depth: 0,
  total_result: 0,
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
    },
    searchReset: (state) => {
      state.result = [];
    },
    searchDepth: (state, action: PayloadAction<number>) => {
      state.depth = action.payload;
    },
    searchResult: (state, action: PayloadAction<{
      hits: SearchHits;
      append?: boolean;
    }>) => {
      const { hits, append } = action.payload;
      const results = hits.hits;
      const depth = state.depth;
      
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
  searchResult,
} = searchSlice.actions;

export default searchSlice.reducer;
