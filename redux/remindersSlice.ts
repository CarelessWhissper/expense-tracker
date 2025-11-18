import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  isRecurring: boolean;
  recurringType?: "daily" | "weekly" | "monthly" | "yearly";
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

interface RemindersState {
  reminders: Reminder[];
}

const initialState: RemindersState = {
  reminders: [],
};

const remindersSlice = createSlice({
  name: "reminders",
  initialState,
  reducers: {
    addReminder(state, action: PayloadAction<Reminder>) {
      state.reminders.push(action.payload);
    },
    updateReminder(state, action: PayloadAction<Reminder>) {
      const index = state.reminders.findIndex(
        (r) => r.id === action.payload.id
      );
      if (index !== -1) {
        state.reminders[index] = action.payload;
      }
    },
    deleteReminder(state, action: PayloadAction<string>) {
      state.reminders = state.reminders.filter((r) => r.id !== action.payload);
    },
    markAsPaid(state, action: PayloadAction<string>) {
      const reminder = state.reminders.find((r) => r.id === action.payload);
      if (reminder) {
        reminder.isPaid = true;

        // If recurring, create next reminder
        if (reminder.isRecurring && reminder.recurringType) {
          const nextDate = new Date(reminder.dueDate);

          switch (reminder.recurringType) {
            case "daily":
              nextDate.setDate(nextDate.getDate() + 1);
              break;
            case "weekly":
              nextDate.setDate(nextDate.getDate() + 7);
              break;
            case "monthly":
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case "yearly":
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
          }

          const newReminder: Reminder = {
            ...reminder,
            id: Date.now().toString(),
            dueDate: nextDate.toISOString(),
            isPaid: false,
            createdAt: new Date().toISOString(),
          };

          state.reminders.push(newReminder);
        }
      }
    },
    markAsUnpaid(state, action: PayloadAction<string>) {
      const reminder = state.reminders.find((r) => r.id === action.payload);
      if (reminder) {
        reminder.isPaid = false;
      }
    },
  },
});

export const {
  addReminder,
  updateReminder,
  deleteReminder,
  markAsPaid,
  markAsUnpaid,
} = remindersSlice.actions;
export default remindersSlice.reducer;
