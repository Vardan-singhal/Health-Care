import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  role: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStart: (s) => {
      s.loading = true;
      s.error = null;
    },
    setAuthSuccess: (s, a) => {
      s.loading = false;
      s.user = a.payload.user;
      s.token = a.payload.token;
      s.role = a.payload.role;
    },
    setAuthFailure: (s, a) => {
      s.loading = false;
      s.error = a.payload;
    },
    logout: (s) => {
      s.user = null;
      s.token = null;
      s.role = null;
    },
  },
});

export const { setAuthStart, setAuthSuccess, setAuthFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
