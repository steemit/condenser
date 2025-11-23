import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for CommunitySlice
interface CommunityState {
  [key: string]: any;
}

const initialState: CommunityState = {};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {},
});

export default communitySlice.reducer;

