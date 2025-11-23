import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for OffchainSlice
interface OffchainState {
  [key: string]: any;
}

const initialState: OffchainState = {};

const offchainSlice = createSlice({
  name: 'offchain',
  initialState,
  reducers: {},
});

export default offchainSlice.reducer;

