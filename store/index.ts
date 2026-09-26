import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import globalReducer from './slices/globalSlice';
import userReducer from './slices/userSlice';
import searchReducer from './slices/searchSlice';
import { createPreferencesPersistenceMiddleware } from './middleware/preferencesPersistence';

export const store = configureStore({
  reducer: {
    app: appReducer,
    global: globalReducer,
    user: userReducer,
    search: searchReducer,
  },
  // Legacy SagaShared: preference toggles auto-persist to the session.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createPreferencesPersistenceMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

