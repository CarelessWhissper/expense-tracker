import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
  name: "transactions",
  initialState: {
    transactions: [
      // Mock data  for now
      {
        id: "1",
        amount: -15.5,
        category: "Food & Drinks",
        description: "Albert Heijn",
        date: new Date().toISOString(),
        icon: "",
      },
      {
        id: "2",
        amount: -45.0,
        category: "Transportation",
        description: "NS Reizen",
        date: new Date(Date.now() - 86400000).toISOString(),
        icon: "",
      },
      {
        id: "3",
        amount: -8.5,
        category: "Food & Drinks",
        description: "Starbucks",
        date: new Date(Date.now() - 86400000).toISOString(),
        icon: "",
      },
      {
        id: "4",
        amount: 2500.0,
        category: "Income",
        description: "Salary",
        date: new Date(Date.now() - 172800000).toISOString(),
        icon: "",
      },
      {
        id: "5",
        amount: -125.0,
        category: "Shopping",
        description: "Zara",
        date: new Date(Date.now() - 259200000).toISOString(),
        icon: "",
      },
      {
        id: "6",
        amount: -32.0,
        category: "Entertainment",
        description: "Pathé Bioscoop",
        date: new Date(Date.now() - 345600000).toISOString(),
        icon: "",
      },
    ],
    weeklyBudget: 200,
    savingsGoal: 500,
    currentSavings: 125,
  },
  reducers: {
    addTransaction(state, action) {
      state.transactions.unshift(action.payload);
    },
    deleteTransaction(state, action) {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      );
    },
    setWeeklyBudget(state, action) {
      state.weeklyBudget = action.payload;
    },
    updateSavings(state, action) {
      state.currentSavings = action.payload;
    },
  },
});

export const {
  addTransaction,
  deleteTransaction,
  setWeeklyBudget,
  updateSavings,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
