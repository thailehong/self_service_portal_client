import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/api/authApi';
import { tokenManager } from '../../services/api/client';

const initialState = {
  user: null,
  accessToken: null,
  accessTokenExpiresAtUtc: null,
  isAuthenticated: false,
  isInitializing: true,
  status: 'idle',
  error: null,
};

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.detail) {
    return responseData.detail;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.title) {
    return responseData.title;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }

  if (responseData?.errors && typeof responseData.errors === 'object') {
    const firstErrorGroup = Object.values(responseData.errors).find((value) => Array.isArray(value) && value.length > 0);

    if (firstErrorGroup) {
      return firstErrorGroup[0];
    }
  }

  if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
    return fallback;
  }

  if (error.message && error.message !== `Request failed with status code ${error.response?.status}`) {
    return error.message;
  }

  return fallback;
}

export const login = createAsyncThunk('auth/login', async (payload, thunkApi) => {
  try {
    const response = await authApi.login(payload);
    tokenManager.setAccessToken(response.accessToken);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, 'Login failed.'));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, thunkApi) => {
  try {
    const response = await authApi.register(payload);
    tokenManager.setAccessToken(response.accessToken);
    return response;
  } catch (error) {
    return thunkApi.rejectWithValue(getErrorMessage(error, 'Registration failed.'));
  }
});

export const refreshSession = createAsyncThunk('auth/refreshSession', async (_, thunkApi) => {
  try {
    const refreshResponse = await authApi.refresh();
    tokenManager.setAccessToken(refreshResponse.accessToken);
    return refreshResponse;
  } catch (error) {
    tokenManager.clearAccessToken();
    return thunkApi.rejectWithValue(getErrorMessage(error, 'Session could not be refreshed.'));
  }
});

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, thunkApi) => {
  try {
    const refreshResponse = await authApi.refresh();
    tokenManager.setAccessToken(refreshResponse.accessToken);
    return refreshResponse;
  } catch (error) {
    tokenManager.clearAccessToken();
    return thunkApi.rejectWithValue(getErrorMessage(error, 'No existing session found.'));
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkApi) => {
  try {
    await authApi.logout();
    tokenManager.clearAccessToken();
    return true;
  } catch (error) {
    tokenManager.clearAccessToken();
    return thunkApi.rejectWithValue(getErrorMessage(error, 'Logout failed.'));
  }
});

function applyAuthState(state, action) {
  state.user = action.payload.user;
  state.accessToken = action.payload.accessToken;
  state.accessTokenExpiresAtUtc = action.payload.accessTokenExpiresAtUtc;
  state.isAuthenticated = true;
  state.isInitializing = false;
  state.status = 'succeeded';
  state.error = null;
}

function clearAuthState(state) {
  state.user = null;
  state.accessToken = null;
  state.accessTokenExpiresAtUtc = null;
  state.isAuthenticated = false;
  state.isInitializing = false;
  state.status = 'idle';
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, applyAuthState)
      .addCase(login.rejected, (state, action) => {
        clearAuthState(state);
        state.error = action.payload || 'Login failed.';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, applyAuthState)
      .addCase(register.rejected, (state, action) => {
        clearAuthState(state);
        state.error = action.payload || 'Registration failed.';
      })
      .addCase(refreshSession.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, applyAuthState)
      .addCase(refreshSession.rejected, (state) => {
        clearAuthState(state);
      })
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, applyAuthState)
      .addCase(initializeAuth.rejected, (state) => {
        clearAuthState(state);
      })
      .addCase(logout.fulfilled, (state) => {
        clearAuthState(state);
      })
      .addCase(logout.rejected, (state) => {
        clearAuthState(state);
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
