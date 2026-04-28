import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Pagination, CircularProgress,
  Alert, InputAdornment, Avatar, Button,
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import api from '../../services/api';

export default function DoctorsPage() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async (p = page, q = search) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doctors', { params: { page: p, limit: 10, search: q } });
      setList(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Tìm bác sĩ theo tên, chuyên khoa..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(1, search)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 300 }}
        />
        <Button variant="outlined" onClick={() => { setPage(1); load(1, search); }}>Tìm</Button>
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => load()}>Làm mới</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Bác sĩ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Chuyên khoa</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Số giấy phép</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phòng khám</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tối đa/ngày</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress /></TableCell></TableRow>
              ) : list.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
              ) : list.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36, fontSize: 14 }}>
                        {d.full_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{d.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={d.specialist} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{d.license_number}</TableCell>
                  <TableCell>{d.office_room || '—'}</TableCell>
                  <TableCell align="center">{d.max_patients_per_day}</TableCell>
                  <TableCell>
                    <Chip label={d.is_active ? 'Hoạt động' : 'Khóa'} color={d.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination?.totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => { setPage(v); load(v); }} color="primary" />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
