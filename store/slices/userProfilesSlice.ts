import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    // @deprecated: this reducer has no dispatchers in the Next.js app. The
    // browser SWR layer (lib/cache/client-fetch) is now the single source of
    // truth for cached profile data. Kept only to avoid breaking imports.
    addProfile: (state, action: PayloadAction<{
      username: string;
      account: any;
    }>) => {
      const { username, account } = action.payload;
      if (username && account) {
        state.profiles[username] = account;
      }
    },
  },
});

export const { addProfile } = userProfilesSlice.actions;
export default userProfilesSlice.reducer;
