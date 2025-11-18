// redux/store.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";

import appModeReducer from "./appModeSlice";
import authReducer from "./authSlice";
import budgetReducer from "./budgetSlice";
import savingsPlansReducer from "./savingsPlanSlice";
import transactionsReducer from "./transactionsSlice";
import remindersReducer from "./remindersSlice";

// Persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Only persist these reducers
  whitelist: ["auth", "budget", "transactions", "savingsPlan", "reminders", "appMode"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  budget: budgetReducer,
  transactions: transactionsReducer,
  savingsPlans: savingsPlansReducer,
  reminders: remindersReducer,
  appMode: appModeReducer,
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
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
