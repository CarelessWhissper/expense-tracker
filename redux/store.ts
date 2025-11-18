// redux/store.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers, UnknownAction } from "redux";
import { persistReducer, persistStore } from "redux-persist";

import appModeReducer from "./appModeSlice";
import authReducer from "./authSlice";
import budgetReducer from "./budgetSlice";
import { chatsSlice } from "./chatSlice";
import remindersReducer from "./remindersSlice";
import savingsPlansReducer from "./savingsPlanSlice";
import transactionsReducer from "./transactionsSlice";

// Persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Only persist these reducers
  whitelist: [
    "auth",
    "budget",
    "transactions",
    "savingsPlans",
    "reminders",
    "appMode",
    "messages",
    "chat",
  ],
};





const rootReducer = (state: any, action: UnknownAction) => {
  if (action.type === "auth/clearAll" || action.type === "RESET_ALL") {
    
    AsyncStorage.removeItem('persist:root');
    state = undefined;
  }

  return combineReducers({
    auth: authReducer,
    budget: budgetReducer,
    transactions: transactionsReducer,
    savingsPlans: savingsPlansReducer,
    reminders: remindersReducer,
    appMode: appModeReducer,
    chat: chatsSlice.reducer,
  })(state, action);
};

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
