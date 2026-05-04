import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMedications = createAsyncThunk('medications/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/medications', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải danh sách thuốc'); }
});

export const createMedication = createAsyncThunk('medications/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/medications', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi thêm thuốc'); }
});

export const updateMedication = createAsyncThunk('medications/update', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/medications/${id}`, updates);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật thuốc'); }
});

export const adjustMedicationStock = createAsyncThunk('medications/adjustStock', async ({ id, delta }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/medications/${id}/stock`, { delta });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật tồn kho'); }
});

export const deleteMedication = createAsyncThunk('medications/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/medications/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi xóa thuốc'); }
});

const medicationSlice = createSlice({
  name: 'medications',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedications.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMedications.fulfilled,  (s, { payload }) => { s.loading = false; s.list = payload.data; s.pagination = payload.pagination; })
      .addCase(fetchMedications.rejected,   (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createMedication.fulfilled,  (s, { payload }) => { s.list.unshift(payload); })
      .addCase(updateMedication.fulfilled,  (s, { payload }) => {
        const i = s.list.findIndex(m => m.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(adjustMedicationStock.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(m => m.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(deleteMedication.fulfilled, (s, { payload }) => { s.list = s.list.filter(m => m.id !== payload); });
  },
});

export const { clearError } = medicationSlice.actions;
export default medicationSlice.reducer;
