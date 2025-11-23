import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import globalReducer from './slices/globalSlice';
import userReducer from './slices/userSlice';
import transactionReducer from './slices/transactionSlice';
import offchainReducer from './slices/offchainSlice';
import communityReducer from './slices/communitySlice';
import userProfilesReducer from './slices/userProfilesSlice';
import searchReducer from './slices/searchSlice';
import adReducer from './slices/adSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    global: globalReducer,
    user: userReducer,
    transaction: transactionReducer,
    offchain: offchainReducer,
    community: communityReducer,
    userProfiles: userProfilesReducer,
    search: searchReducer,
    ad: adReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

