import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for SearchSlice
interface SearchState {
  [key: string]: any;
}

const initialState: SearchState = {};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {},
});

export default searchSlice.reducer;

