import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  email: string;
  username: string;
}

interface Credential {
  email: string;
  password: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: User | null;
  credentials: Credential[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
  credentials: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signUp(state, action: PayloadAction<Credential>) {
      // action.payload: { email, password, username }
      state.credentials.push(action.payload);
      // Auto-login after signup
      state.isAuthenticated = true;
      state.user = {
        email: action.payload.email,
        username: action.payload.username,
      };
    },
    login(state, action: PayloadAction<{ email: string; username: string }>) {
      // action.payload: { email, username }
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    skipOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
  },
});

export const { signUp, login, logout, completeOnboarding, skipOnboarding } =
  authSlice.actions;
export default authSlice.reducer;