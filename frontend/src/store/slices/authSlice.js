import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI, registerAPI } from "../../services/api";

// ===== THUNKS =====
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginAPI(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || data));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerAPI(userData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || data));
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== SLICE =====
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user || action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user || action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
