import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPatients = createAsyncThunk('patients/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/patients', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi tải danh sách bệnh nhân');
  }
});

export const createPatient = createAsyncThunk('patients/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/patients', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi tạo bệnh nhân');
  }
});

export const updatePatient = createAsyncThunk('patients/update', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/patients/${id}`, updates);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật bệnh nhân');
  }
});

export const deletePatient = createAsyncThunk('patients/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/patients/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Lỗi xóa bệnh nhân');
  }
});

const patientSlice = createSlice({
  name: 'patients',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPatients.fulfilled, (s, { payload }) => {
        s.loading = false; s.list = payload.data; s.pagination = payload.pagination;
      })
      .addCase(fetchPatients.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createPatient.fulfilled, (s, { payload }) => { s.list.unshift(payload); })
      .addCase(updatePatient.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(p => p.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(deletePatient.fulfilled, (s, { payload }) => {
        s.list = s.list.filter(p => p.id !== payload);
      });
  },
});

export const { clearError } = patientSlice.actions;
export default patientSlice.reducer;
