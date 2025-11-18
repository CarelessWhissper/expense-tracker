import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BudgetState {
  weeklyBudget: number;
}

const initialState: BudgetState = {
  weeklyBudget: 0, // Start with 0, user sets it during onboarding or later
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setWeeklyBudget(state, action: PayloadAction<number>) {
      state.weeklyBudget = action.payload;
    },
    clearBudget(state) {
      state.weeklyBudget = 0;
    },
  },
});

export const { setWeeklyBudget, clearBudget } = budgetSlice.actions;
export default budgetSlice.reducer;