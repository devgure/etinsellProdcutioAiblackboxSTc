import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import matchReducer from './slices/matchSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    match: matchReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
