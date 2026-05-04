import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPrescriptionsByRecord = createAsyncThunk('prescriptions/byRecord', async (recordId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/prescriptions/medical-record/${recordId}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải đơn thuốc'); }
});

export const fetchPrescriptionsByPatient = createAsyncThunk('prescriptions/byPatient', async (patientId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/prescriptions/patient/${patientId}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải đơn thuốc'); }
});

export const createPrescription = createAsyncThunk('prescriptions/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/prescriptions', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tạo đơn thuốc'); }
});

export const dispensePrescription = createAsyncThunk('prescriptions/dispense', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/prescriptions/${id}/dispense`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi cấp phát thuốc'); }
});

export const deletePrescription = createAsyncThunk('prescriptions/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/prescriptions/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi xóa đơn thuốc'); }
});

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState: { list: [], loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; }, clearList: (s) => { s.list = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptionsByRecord.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPrescriptionsByRecord.fulfilled,   (s, { payload }) => { s.loading = false; s.list = payload; })
      .addCase(fetchPrescriptionsByRecord.rejected,    (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(fetchPrescriptionsByPatient.fulfilled,  (s, { payload }) => { s.loading = false; s.list = payload; })
      .addCase(createPrescription.fulfilled,  (s, { payload }) => { s.list.push(payload); })
      .addCase(dispensePrescription.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(p => p.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(deletePrescription.fulfilled, (s, { payload }) => { s.list = s.list.filter(p => p.id !== payload); });
  },
});

export const { clearError, clearList } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
