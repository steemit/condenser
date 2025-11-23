import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for AdSlice
interface AdState {
  [key: string]: any;
}

const initialState: AdState = {};

const adSlice = createSlice({
  name: 'ad',
  initialState,
  reducers: {},
});

export default adSlice.reducer;

