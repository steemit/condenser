import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OffchainState {
  user: Record<string, any>;
  account?: any;
}

const initialState: OffchainState = {
  user: {},
};

const offchainSlice = createSlice({
  name: 'offchain',
  initialState,
  reducers: {
    // Handle user/SAVE_LOGIN_CONFIRM action from user slice
    saveLoginConfirm: (state, action: PayloadAction<any>) => {
      if (!action.payload) {
        state.account = null;
      }
    },
  },
});

export const { saveLoginConfirm } = offchainSlice.actions;
export default offchainSlice.reducer;
