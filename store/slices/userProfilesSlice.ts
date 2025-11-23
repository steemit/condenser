import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
interface UserProfile {
  username: string;
  [key: string]: any;
}

interface UserProfilesState {
  profiles: Record<string, UserProfile>;
}

const initialState: UserProfilesState = {
  profiles: {},
};

const userProfilesSlice = createSlice({
  name: 'userProfiles',
  initialState,
  reducers: {
    addProfile: (state, action: PayloadAction<UserProfile>) => {
      const profile = action.payload;
      if (profile && profile.username) {
        state.profiles[profile.username] = profile;
      }
    },
  },
});

export const { addProfile } = userProfilesSlice.actions;
export default userProfilesSlice.reducer;
