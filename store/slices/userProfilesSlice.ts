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
