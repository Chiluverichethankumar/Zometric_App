// src/store/store.ts
import {
  configureStore,
  combineReducers,
  AnyAction,
} from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import authReducer, { clearAuth } from './authSlice';
import filesReducer from './filesSlice';

const appReducer = combineReducers({
  auth: authReducer,
  files: filesReducer,
  [api.reducerPath]: api.reducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction,
) => {
  // When clearAuth is dispatched, reset all non-persisted state
  if (action.type === clearAuth.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
