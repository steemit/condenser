import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface SearchResult {
  _source: {
    created_at: string;
    author_rep: number;
    total_votes: number;
    [key: string]: any;
  };
  _index?: string;
  [key: string]: any;
}

interface SearchHits {
  hits: SearchResult[];
  total: {
    value: number;
  };
}

interface SearchState {
  pending: boolean;
  error: boolean | string;
  scrollId: string | false;
  result: any[];
  depth: number;
  total_result: number;
  sort: string;
}

const searchTypes = ['hive_posts', 'hive_replies', 'hive_accounts'];

const initialState: SearchState = {
  pending: false,
  error: false,
  scrollId: false,
  result: [],
  depth: 0,
  total_result: 0,
  sort: 'created_at',
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
    searchError: (state, action: PayloadAction<{ error: boolean | string }>) => {
      state.error = action.payload.error;
    },
    searchReset: (state) => {
      state.result = [];
    },
    searchDepth: (state, action: PayloadAction<number>) => {
      state.depth = action.payload;
    },
    searchSort: (state, action: PayloadAction<string>) => {
      state.sort = action.payload;
    },
    searchTotal: (state, action: PayloadAction<number>) => {
      state.total_result = action.payload;
    },
    searchResult: (state, action: PayloadAction<{
      hits: SearchHits;
      _scroll_id?: string;
      append?: boolean;
    }>) => {
      const { hits, _scroll_id, append } = action.payload;
      const results = hits.hits;
      const scroll_id = _scroll_id || false;
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
        state.scrollId = scroll_id;
        state.total_result = hits.total.value;
      } else {
        state.result = [...state.result, ...posts];
        state.scrollId = scroll_id;
        state.total_result = hits.total.value;
      }
    },
  },
});

export const {
  searchDispatch,
  searchPending,
  searchError,
  searchReset,
  searchDepth,
  searchSort,
  searchTotal,
  searchResult,
} = searchSlice.actions;

export default searchSlice.reducer;
