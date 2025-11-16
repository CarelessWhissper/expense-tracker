import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReminderFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ReminderType = 'payment' | 'savings';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  amount?: number;
  frequency: ReminderFrequency;
  customDays?: number;
  nextDueDate: string;
  reminderDaysBefore: number;
  category?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  lastPaid?: string;
}

interface RemindersState {
  reminders: Reminder[];
  notificationTime: string; // HH:mm format
}

const initialState: RemindersState = {
  reminders: [],
  notificationTime: '09:00',
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.reminders.push(action.payload);
      saveToStorage(state);
    },
    updateReminder: (state, action: PayloadAction<Reminder>) => {
      const index = state.reminders.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reminders[index] = action.payload;
        saveToStorage(state);
      }
    },
    deleteReminder: (state, action: PayloadAction<string>) => {
      state.reminders = state.reminders.filter(r => r.id !== action.payload);
      saveToStorage(state);
    },
    markAsPaid: (state, action: PayloadAction<string>) => {
      const reminder = state.reminders.find(r => r.id === action.payload);
      if (reminder) {
        reminder.lastPaid = new Date().toISOString();
        reminder.nextDueDate = calculateNextDueDate(reminder);
        saveToStorage(state);
      }
    },
    toggleReminderActive: (state, action: PayloadAction<string>) => {
      const reminder = state.reminders.find(r => r.id === action.payload);
      if (reminder) {
        reminder.isActive = !reminder.isActive;
        saveToStorage(state);
      }
    },
    setNotificationTime: (state, action: PayloadAction<string>) => {
      state.notificationTime = action.payload;
      saveToStorage(state);
    },
    loadReminders: (state, action: PayloadAction<RemindersState>) => {
      return action.payload;
    },
  },
});

// Helper function to calculate next due date
function calculateNextDueDate(reminder: Reminder): string {
  const current = new Date(reminder.nextDueDate);
  
  switch (reminder.frequency) {
    case 'weekly':
      current.setDate(current.getDate() + 7);
      break;
    case 'biweekly':
      current.setDate(current.getDate() + 14);
      break;
    case 'monthly':
      current.setMonth(current.getMonth() + 1);
      break;
    case 'quarterly':
      current.setMonth(current.getMonth() + 3);
      break;
    case 'yearly':
      current.setFullYear(current.getFullYear() + 1);
      break;
    case 'custom':
      if (reminder.customDays) {
        current.setDate(current.getDate() + reminder.customDays);
      }
      break;
  }
  
  return current.toISOString();
}

// Helper to save to AsyncStorage
async function saveToStorage(state: RemindersState) {
  try {
    await AsyncStorage.setItem('reminders', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving reminders:', error);
  }
}

// Thunk to load reminders from storage
export const loadRemindersFromStorage = () => async (dispatch: any) => {
  try {
    const data = await AsyncStorage.getItem('reminders');
    if (data) {
      dispatch(loadReminders(JSON.parse(data)));
    }
  } catch (error) {
    console.error('Error loading reminders:', error);
  }
};

export const {
  addReminder,
  updateReminder,
  deleteReminder,
  markAsPaid,
  toggleReminderActive,
  setNotificationTime,
  loadReminders,
} = remindersSlice.actions;

export default remindersSlice.reducer;