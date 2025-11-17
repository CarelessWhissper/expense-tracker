import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SavingsPlan {
  id: string;
  goalName: string;
  amount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface SavingsPlansState {
  plans: SavingsPlan[];
}

const initialState: SavingsPlansState = {
  plans: [],
};

const savingsPlansSlice = createSlice({
  name: "savingsPlans",
  initialState,
  reducers: {
    add(state, action: PayloadAction<SavingsPlan>) {
      state.plans.push(action.payload);
    },
    update(state, action: PayloadAction<SavingsPlan>) {
      const index = state.plans.findIndex(
        (plan) => plan.id === action.payload.id
      );
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    remove(state, action: PayloadAction<string>) {
      state.plans = state.plans.filter((plan) => plan.id !== action.payload);
    },
    addToCurrentAmount(
      state,
      action: PayloadAction<{ id: string; amount: number }>
    ) {
      const plan = state.plans.find((p) => p.id === action.payload.id);
      if (plan) {
        plan.currentAmount += action.payload.amount;
      }
    },
  },
});

export const { add, update, remove, addToCurrentAmount } =
  savingsPlansSlice.actions;
export default savingsPlansSlice.reducer;