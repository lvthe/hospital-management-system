import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/appointments', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi tải lịch hẹn');
  }
});

export const createAppointment = createAsyncThunk('appointments/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/appointments', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi đặt lịch hẹn');
  }
});

export const cancelAppointment = createAsyncThunk('appointments/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/appointments/${id}/cancel`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi hủy lịch hẹn');
  }
});

export const updateAppointmentStatus = createAsyncThunk('appointments/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/appointments/${id}`, { status });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
  }
});

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAppointments.fulfilled, (s, { payload }) => {
        s.loading = false; s.list = payload.data; s.pagination = payload.pagination;
      })
      .addCase(fetchAppointments.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createAppointment.fulfilled, (s, { payload }) => { s.list.unshift(payload); })
      .addCase(cancelAppointment.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(a => a.id === payload.id);
        if (i >= 0) s.list[i] = { ...s.list[i], status: 'cancelled' };
      })
      .addCase(updateAppointmentStatus.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(a => a.id === payload.id);
        if (i >= 0) s.list[i] = { ...s.list[i], ...payload };
      });
  },
});

export const { clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
