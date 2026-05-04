import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMedicalRecords = createAsyncThunk('medicalRecords/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/medical-records', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải hồ sơ y tế'); }
});

export const fetchRecordsByPatient = createAsyncThunk('medicalRecords/byPatient', async (patientId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/medical-records/patient/${patientId}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải hồ sơ'); }
});

export const createMedicalRecord = createAsyncThunk('medicalRecords/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/medical-records', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tạo hồ sơ'); }
});

export const updateMedicalRecord = createAsyncThunk('medicalRecords/update', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/medical-records/${id}`, updates);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật hồ sơ'); }
});

export const deleteMedicalRecord = createAsyncThunk('medicalRecords/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/medical-records/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi xóa hồ sơ'); }
});

const medicalRecordSlice = createSlice({
  name: 'medicalRecords',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalRecords.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMedicalRecords.fulfilled,  (s, { payload }) => { s.loading = false; s.list = payload.data; s.pagination = payload.pagination; })
      .addCase(fetchMedicalRecords.rejected,   (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createMedicalRecord.fulfilled,  (s, { payload }) => { s.list.unshift(payload); })
      .addCase(updateMedicalRecord.fulfilled,  (s, { payload }) => {
        const i = s.list.findIndex(r => r.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(deleteMedicalRecord.fulfilled, (s, { payload }) => { s.list = s.list.filter(r => r.id !== payload); });
  },
});

export const { clearError } = medicalRecordSlice.actions;
export default medicalRecordSlice.reducer;
