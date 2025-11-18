import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  icon: string;
  iconType?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  weeklyBudget: number;
}

const initialState: TransactionsState = {
  transactions: [
    // Mock data
    {
      id: "1",
      amount: -15.5,
      category: "Food & Drinks",
      description: "Albert Heijn",
      date: new Date().toISOString(),
      icon: "shopping-cart",
      iconType: "MaterialIcons",
    },
    {
      id: "2",
      amount: -45.0,
      category: "Transportation",
      description: "NS Reizen",
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: "train",
      iconType: "MaterialIcons",
    },
    {
      id: "3",
      amount: -8.5,
      category: "Food & Drinks",
      description: "Starbucks",
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: "coffee",
      iconType: "MaterialIcons",
    },
    {
      id: "4",
      amount: 2500.0,
      category: "Income",
      description: "Salary",
      date: new Date(Date.now() - 172800000).toISOString(),
      icon: "attach-money",
      iconType: "MaterialIcons",
    },
    {
      id: "5",
      amount: -125.0,
      category: "Shopping",
      description: "Zara",
      date: new Date(Date.now() - 259200000).toISOString(),
      icon: "shopping-bag",
      iconType: "MaterialIcons",
    },
    {
      id: "6",
      amount: -32.0,
      category: "Entertainment",
      description: "Pathé Bioscoop",
      date: new Date(Date.now() - 345600000).toISOString(),
      icon: "movie",
      iconType: "MaterialIcons",
    },
  ],
  weeklyBudget: 150,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions.unshift(action.payload);
    },
    deleteTransaction(state, action: PayloadAction<string>) {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload
      );
    },
    clearTransactions(state) {
      state.transactions = [];
    },
    setWeeklyBudget(state, action: PayloadAction<number>) {
      state.weeklyBudget = action.payload;
    },
  },
});

export const {
  addTransaction,
  deleteTransaction,
  clearTransactions,
  setWeeklyBudget,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
