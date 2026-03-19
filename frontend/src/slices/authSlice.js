/**
 * Auth Slice
 * FILE: src/slices/authSlice.js
 *
 * Changes from original:
 *  - Added setAccessToken as alias for setToken (axiosInstance uses this name)
 *  - logout now also clears isDashboardOpen
 *  - user localStorage parsing has try/catch to prevent JSON.parse crash on corrupt data
 */

import { createSlice } from "@reduxjs/toolkit";

// Safe parse — prevents crash if localStorage has corrupt/stale JSON
const safeParse = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const initialState = {
  signupData:      null,
  isDashboardOpen: false,
  loading:         false,
  token:           localStorage.getItem("token")        || null,
  refreshToken:    localStorage.getItem("refreshToken") || null,
  user:            safeParse("user"),
  error:           null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    setSignupData(state, action) {
      state.signupData = action.payload;
    },

    // Primary access token setter — stores in localStorage
    setToken(state, action) {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },

    // Alias used by authServices.js (login returns accessToken)
    setAccessToken(state, action) {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
      } else {
        localStorage.removeItem("token");
      }
    },

    setRefreshToken(state, action) {
      state.refreshToken = action.payload;
      if (action.payload) {
        localStorage.setItem("refreshToken", action.payload);
      } else {
        localStorage.removeItem("refreshToken");
      }
    },

    setUser(state, action) {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },

    setError(state, action) {
      state.error = action.payload;
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    toggleDashboard(state) {
      state.isDashboardOpen = !state.isDashboardOpen;
    },

    closeDashboard(state) {
      state.isDashboardOpen = false;
    },

    // Full logout — clears all auth state and localStorage
    logout(state) {
      state.token           = null;
      state.refreshToken    = null;
      state.user            = null;
      state.signupData      = null;
      state.error           = null;
      state.isDashboardOpen = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
});

export const {
  setSignupData,
  setToken,
  setAccessToken,
  setRefreshToken,
  setUser,
  setError,
  setLoading,
  toggleDashboard,
  closeDashboard,
  logout,
} = authSlice.actions;

export default authSlice.reducer;