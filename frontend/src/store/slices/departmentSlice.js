import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDepartments = createAsyncThunk('departments/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/departments', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tải phòng ban'); }
});

export const createDepartment = createAsyncThunk('departments/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/departments', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi tạo phòng ban'); }
});

export const updateDepartment = createAsyncThunk('departments/update', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/departments/${id}`, updates);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật phòng ban'); }
});

export const deleteDepartment = createAsyncThunk('departments/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/departments/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Lỗi xóa phòng ban'); }
});

const departmentSlice = createSlice({
  name: 'departments',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: { clearError: (s) => { s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDepartments.fulfilled,  (s, { payload }) => { s.loading = false; s.list = payload.data; s.pagination = payload.pagination; })
      .addCase(fetchDepartments.rejected,   (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createDepartment.fulfilled,  (s, { payload }) => { s.list.unshift(payload); })
      .addCase(updateDepartment.fulfilled,  (s, { payload }) => {
        const i = s.list.findIndex(d => d.id === payload.id);
        if (i >= 0) s.list[i] = payload;
      })
      .addCase(deleteDepartment.fulfilled, (s, { payload }) => { s.list = s.list.filter(d => d.id !== payload); });
  },
});

export const { clearError } = departmentSlice.actions;
export default departmentSlice.reducer;
