import { routes } from "@/route";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  email: string;
  username: string;
}

interface signUpPayload {
  consumer?: string;
  username: string;
  email: string;
  password: string;
}

interface signInPayload {
  consumer?: string;
  username: string;
  password: string;
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
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
  credentials: [],
  loading: false,
  error: null,
};

export const signUpAPI = createAsyncThunk(
  "auth/sign-up",
  async (payload: signUpPayload, thunkAPI) => {
    try {
      const body = {
        consumer: payload.consumer || "",
        username: payload.username,
        email: payload.email,
        password: payload.password,
      };

      const response = await axios.post(routes.auth.signup, body);

      console.log("sign up payload", JSON.stringify(body));
      console.log("response sign up", JSON.stringify(response));

      const data = response.data;

      if (data.rspCode === "00") {
        return data.rspObject;
      }

      return thunkAPI.rejectWithValue(data.rspMsg || "Signup failed");
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.rspMsg || "Signup failed"
      );
    }
  }
);

export const signInAPI = createAsyncThunk(
  "auth/sign-in",
  async (payload: signInPayload, thunkAPI) => {
    try {
      const body = {
        consumer: payload.consumer || "",
        username: payload.username,
        password: payload.password,
      };

      const response = await axios.post(routes.auth.login, body);

      const data = response.data;

      if (data.rspCode === "00") {
        return data.rspObject;
      }

      return thunkAPI.rejectWithValue(data.rspMsg || "Signup failed");
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.rspMsg || "Signup failed"
      );
    }
  }
);

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
  extraReducers(builder) {
    builder
      .addCase(signUpAPI.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true; // log the user in on first succesfull sign up
      })
      .addCase(signInAPI.fulfilled, (state, action) => {
        (state.user = action.payload), (state.isAuthenticated = true);
      });
  },
});

export const { signUp, login, logout, completeOnboarding, skipOnboarding } =
  authSlice.actions;
export default authSlice.reducer;
