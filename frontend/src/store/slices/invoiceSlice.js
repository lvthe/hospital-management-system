import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/invoices', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải danh sách hóa đơn'); }
});

export const createInvoice = createAsyncThunk('invoices/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/invoices', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tạo hóa đơn'); }
});

export const payInvoice = createAsyncThunk('invoices/pay', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/invoices/${id}/payment`, payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi thanh toán'); }
});

export const cancelInvoice = createAsyncThunk('invoices/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/invoices/${id}/cancel`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi hủy hóa đơn'); }
});

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchInvoices.fulfilled,  (s, { payload }) => { s.loading = false; s.list = payload.data; s.pagination = payload.pagination; })
      .addCase(fetchInvoices.rejected,   (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createInvoice.fulfilled,  (s, { payload }) => { s.list.unshift(payload); })
      .addCase(payInvoice.fulfilled,    (s, { payload }) => {
        const i = s.list.findIndex(inv => inv.id === payload.id);
        if (i >= 0) s.list[i] = { ...s.list[i], ...payload };
      })
      .addCase(cancelInvoice.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(inv => inv.id === payload.id);
        if (i >= 0) s.list[i] = { ...s.list[i], ...payload };
      });
  },
});

export const { clearError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
