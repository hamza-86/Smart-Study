/**
 * App Entry Point
 * FILE: src/index.js
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import authReducer    from "./slices/authSlice";
import courseReducer  from "./slices/courseSlice";
import { setStore }   from "./services/axiosInstance";

// ── Redux Store ───────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: {
    auth:   authReducer,
    course: courseReducer,
  },
});

// Connect store to axios interceptor so 401 auto-logout works
setStore(store);

// ── Render ────────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e1e2e",
            color:      "#cdd6f4",
            border:     "1px solid #313244",
            borderRadius: "8px",
            fontSize:   "14px",
          },
          success: {
            iconTheme: { primary: "#a6e3a1", secondary: "#1e1e2e" },
          },
          error: {
            iconTheme: { primary: "#f38ba8", secondary: "#1e1e2e" },
          },
          loading: {
            iconTheme: { primary: "#89b4fa", secondary: "#1e1e2e" },
          },
        }}
      />
    </BrowserRouter>
  </Provider>
);