import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Grid, CircularProgress, Alert, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, Chip, Button,
} from '@mui/material';
import { TrendingUp, CalendarMonth, LocalPharmacy, Search } from '@mui/icons-material';
import api from '../../services/api';

const getMonthRange = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { from: fmt(first), to: fmt(last) };
};

const StatCard = ({ title, value, subtitle, color }) => (
  <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
    <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
  </Paper>
);

function RevenueTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(() => getMonthRange().from);
  const [dateTo,   setDateTo]   = useState(() => getMonthRange().to);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/reports/revenue', { params: { date_from: dateFrom || undefined, date_to: dateTo || undefined } });
      setData(r.data.data);
    } catch (e) { setError(e.response?.data?.message || 'Lỗi tải báo cáo doanh thu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <TextField label="Từ ngày" type="date" size="small" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Đến ngày" type="date" size="small" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" size="small" startIcon={<Search />} onClick={load}>Lọc</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box> : data && (
        <>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Tổng hóa đơn" value={Number(data.summary.total_billed).toLocaleString('vi-VN') + ' ₫'} subtitle="Tất cả trạng thái" color="#1976d2" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Đã thu" value={Number(data.summary.total_collected).toLocaleString('vi-VN') + ' ₫'} subtitle={`${data.summary.paid_count} hóa đơn`} color="#388e3c" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Còn nợ" value={Number(data.summary.outstanding).toLocaleString('vi-VN') + ' ₫'} subtitle={`${data.summary.pending_count} chờ TT, ${data.summary.overdue_count} quá hạn`} color="#f57c00" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Tổng hóa đơn" value={data.summary.total_invoices} subtitle="Đã tạo" color="#7b1fa2" />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight={600}>Doanh thu theo tháng</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Tháng</TableCell>
                      <TableCell align="right">Phát hành (₫)</TableCell>
                      <TableCell align="right">Thu được (₫)</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {data.monthly_trend.length === 0
                        ? <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                        : data.monthly_trend.map(r => (
                          <TableRow key={r.month} hover>
                            <TableCell>{r.month}</TableCell>
                            <TableCell align="right">{Number(r.billed).toLocaleString('vi-VN')}</TableCell>
                            <TableCell align="right">{Number(r.collected).toLocaleString('vi-VN')}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight={600}>Theo loại dịch vụ</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Loại</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                      <TableCell align="right">Doanh thu (₫)</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {data.by_item_type.length === 0
                        ? <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                        : data.by_item_type.map(r => (
                          <TableRow key={r.item_type} hover>
                            <TableCell sx={{ textTransform: 'capitalize' }}>{r.item_type}</TableCell>
                            <TableCell align="right">{r.count}</TableCell>
                            <TableCell align="right">{Number(r.revenue).toLocaleString('vi-VN')}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

function AppointmentsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(() => getMonthRange().from);
  const [dateTo,   setDateTo]   = useState(() => getMonthRange().to);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/reports/appointments', { params: { date_from: dateFrom || undefined, date_to: dateTo || undefined } });
      setData(r.data.data);
    } catch (e) { setError(e.response?.data?.message || 'Lỗi tải báo cáo lịch hẹn'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <TextField label="Từ ngày" type="date" size="small" value={dateFrom} onChange={e => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="Đến ngày" type="date" size="small" value={dateTo} onChange={e => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" size="small" startIcon={<Search />} onClick={load}>Lọc</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box> : data && (
        <>
          <Grid container spacing={2} mb={3}>
            {[
              ['Tổng lịch hẹn', data.summary.total, '#1976d2'],
              ['Hoàn thành', data.summary.completed, '#388e3c'],
              ['Đã hủy', data.summary.cancelled, '#d32f2f'],
              ['Vắng mặt', data.summary.no_show, '#f57c00'],
            ].map(([label, val, color]) => (
              <Grid item xs={6} sm={3} key={label}>
                <StatCard title={label} value={val} color={color} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight={600}>Theo bác sĩ</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell>Bác sĩ</TableCell>
                      <TableCell>Chuyên khoa</TableCell>
                      <TableCell align="right">Tổng</TableCell>
                      <TableCell align="right">Hoàn thành</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {data.by_doctor.length === 0
                        ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                        : data.by_doctor.map((r, i) => (
                          <TableRow key={i} hover>
                            <TableCell>{r.doctor_name}</TableCell>
                            <TableCell>{r.specialist}</TableCell>
                            <TableCell align="right">{r.total}</TableCell>
                            <TableCell align="right">
                              <Chip label={r.completed} size="small" color="success" variant="outlined" />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" fontWeight={600}>Xu hướng theo ngày</Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead><TableRow>
                      <TableCell sx={{ bgcolor: '#f5f5f5' }}>Ngày</TableCell>
                      <TableCell sx={{ bgcolor: '#f5f5f5' }} align="right">Số lịch hẹn</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {data.daily_trend.length === 0
                        ? <TableRow><TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>Không có dữ liệu</TableCell></TableRow>
                        : data.daily_trend.map(r => (
                          <TableRow key={r.date} hover>
                            <TableCell>{new Date(r.date).toLocaleDateString('vi-VN')}</TableCell>
                            <TableCell align="right">{r.total}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Báo cáo & Thống kê</Typography>
        <Typography variant="body2" color="text.secondary">Tổng hợp dữ liệu hệ thống</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}>
          <Tab icon={<TrendingUp />} iconPosition="start" label="Doanh thu" />
          <Tab icon={<CalendarMonth />} iconPosition="start" label="Lịch hẹn" />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tab === 0 && <RevenueTab />}
          {tab === 1 && <AppointmentsTab />}
        </Box>
      </Paper>
    </Box>
  );
}
