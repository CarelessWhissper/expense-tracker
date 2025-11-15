import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    credentials: [], 
  },
  reducers: {
    signUp(state, action) {
      // action.payload: { email, password, name }
      state.credentials.push(action.payload);
    },
    login(state, action) {
      // action.payload: { email, password } 
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { signUp, login, logout } = authSlice.actions;
export default authSlice.reducer;