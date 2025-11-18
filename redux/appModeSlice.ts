import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppMode = "personal" | "business";

interface AppModeState {
  mode: AppMode;
}

const initialState: AppModeState = {
  mode: "personal",
};

const appModeSlice = createSlice({
  name: "appMode",
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<AppMode>) {
      state.mode = action.payload;
    },
    toggleMode(state) {
      state.mode = state.mode === "personal" ? "business" : "personal";
    },
  },
});

export const { setMode, toggleMode } = appModeSlice.actions;
export default appModeSlice.reducer;

