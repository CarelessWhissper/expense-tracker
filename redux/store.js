// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

import authReducer from "./authSlice";
import transactionsReducer from "./transactionsSlice";
import remindersReducer from "./remindersSlice";

// Persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Persist all three reducers, no api for now
  whitelist: ["auth", "transactions", "reminders"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  transactions: transactionsReducer,
  reminders: remindersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);