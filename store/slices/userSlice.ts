import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for UserSlice - will be migrated from legacy/src/app/redux/UserReducer.js

interface UserState {
  // Will be populated during migration
  [key: string]: any;
}

const initialState: UserState = {};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reducers will be added during migration
  },
});

export const {} = userSlice.actions;
export default userSlice.reducer;

