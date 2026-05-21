import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';
import { savePreferences } from '../utils/storage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
  },
});

store.subscribe(() => {
  savePreferences(store.getState().settings);
});
