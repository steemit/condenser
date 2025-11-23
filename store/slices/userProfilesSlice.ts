import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Placeholder for UserProfilesSlice
interface UserProfilesState {
  [key: string]: any;
}

const initialState: UserProfilesState = {};

const userProfilesSlice = createSlice({
  name: 'userProfiles',
  initialState,
  reducers: {},
});

export default userProfilesSlice.reducer;

