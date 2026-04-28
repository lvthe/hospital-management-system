import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Đăng ký thất bại');
  }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) return rejectWithValue('No token');
  try {
    const { data } = await api.get('/auth/profile');
    return data.data;
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return rejectWithValue('Session expired');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try { await api.post('/auth/logout', { refreshToken }); } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false, loading: true, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.loading = false; s.isAuthenticated = true; s.user = payload.user;
      })
      .addCase(login.rejected, (s, { payload }) => {
        s.loading = false; s.error = payload;
      })
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, (s) => { s.loading = false; })
      .addCase(register.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(loadUser.pending, (s) => { s.loading = true; })
      .addCase(loadUser.fulfilled, (s, { payload }) => {
        s.loading = false; s.isAuthenticated = true; s.user = payload;
      })
      .addCase(loadUser.rejected, (s) => {
        s.loading = false; s.isAuthenticated = false; s.user = null;
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null; s.isAuthenticated = false; s.loading = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
