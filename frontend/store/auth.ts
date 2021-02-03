import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { login as loginImpl, logout as logoutImpl } from '@vaadin/flow-frontend';

import type { LoginOptions, LoginResult } from '@vaadin/flow-frontend';
import type { RootState } from './index';

const LAST_LOGIN_TIMESTAMP = 'lastLoginTimestamp';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const lastLoginTimestamp = localStorage.getItem(LAST_LOGIN_TIMESTAMP);
const hasRecentLoginTimestamp = (lastLoginTimestamp &&
  (new Date().getTime() - new Date(+lastLoginTimestamp).getTime()) < THIRTY_DAYS_MS) || false;

export interface AppState {
  isLoggedIn: boolean,
  loginResult?: LoginResult,
}

const initialState: AppState = {
  isLoggedIn: hasRecentLoginTimestamp,
};

export interface LoginRequest {
  username: string;
  password: string;
  options?: LoginOptions;
}

export const login = createAsyncThunk(
  'login',
  async (request: LoginRequest, thunkAPI) => {
    const store = thunkAPI.getState() as RootState;
    if (store.auth.isLoggedIn) {
      return { error: false } as LoginResult;
    } else {
      const result = await loginImpl(request.username, request.password, request.options);
      if (!result.error) {
        localStorage.setItem(LAST_LOGIN_TIMESTAMP, new Date().getTime() + '')
      }
      return result;
    }
  }
);

export const logout = createAsyncThunk(
  'logout',
  async () => {
    localStorage.removeItem(LAST_LOGIN_TIMESTAMP);
    return await logoutImpl();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSessionExpired: state => {
      state.isLoggedIn = false;
    }
  },
  extraReducers: builder => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = !action.payload.error;
      state.loginResult = action.payload;
    });
    builder.addCase(logout.pending, (state) => {
      state.isLoggedIn = false;
      state.loginResult = undefined;
    });
  }
});

export const authReducer = authSlice.reducer;
export const { setSessionExpired } = authSlice.actions;