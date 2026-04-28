-- ==========================================
-- HOSPITAL MANAGEMENT SYSTEM - INDEXES
-- ==========================================
-- File: 002_add_indexes.sql
-- Description: Tạo indexes để optimize performance
-- Created: 2026-04-26

-- ==========================================
-- USERS TABLE INDEXES
-- ==========================================
-- Tìm kiếm nhanh theo email (dùng cho login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tìm người dùng theo role (filter)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Tìm người dùng hoạt động
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ==========================================
-- PATIENTS TABLE INDEXES
-- ==========================================
-- Tìm bệnh nhân theo user_id
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);

-- Tìm bệnh nhân theo MRN (medical record number)
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(medical_record_number);

-- ==========================================
-- DOCTORS TABLE INDEXES
-- ==========================================
-- Tìm bác sĩ theo user_id
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

-- Tìm bác sĩ theo chuyên khoa (filter)
CREATE INDEX IF NOT EXISTS idx_doctors_specialist ON doctors(specialist);

-- ==========================================
-- STAFF TABLE INDEXES
-- ==========================================
-- Tìm nhân viên theo department
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);

-- Tìm nhân viên theo position
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position);

-- ==========================================
-- APPOINTMENTS TABLE INDEXES
-- ==========================================
-- Tìm lịch hẹn của bệnh nhân (rất hay dùng)
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);

-- Tìm lịch hẹn của bác sĩ
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);

-- Tìm lịch hẹn theo ngày (kiểm tra tính sẵn có)
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Tìm lịch hẹn theo ngày + bác sĩ + trạng thái
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status 
  ON appointments(doctor_id, appointment_date, status);

-- Tìm lịch hẹn theo trạng thái (lọc)
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ==========================================
-- MEDICAL_RECORDS TABLE INDEXES
-- ==========================================
-- Tìm hồ sơ y tế của bệnh nhân
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);

-- Tìm hồ sơ theo bác sĩ
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);

-- Tìm hồ sơ theo appointment
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment_id ON medical_records(appointment_id);

-- ==========================================
-- PRESCRIPTIONS TABLE INDEXES
-- ==========================================
-- Tìm đơn thuốc theo hồ sơ y tế
CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record_id 
  ON prescriptions(medical_record_id);

-- Tìm đơn thuốc theo loại thuốc
CREATE INDEX IF NOT EXISTS idx_prescriptions_medication_id ON prescriptions(medication_id);

-- ==========================================
-- INVOICES TABLE INDEXES
-- ==========================================
-- Tìm hóa đơn của bệnh nhân
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);

-- Tìm hóa đơn theo trạng thái (chưa đóng, quá hạn, etc)
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Tìm hóa đơn theo ngày (báo cáo doanh thu)
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

-- Tìm hóa đơn quá hạn
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date 
  ON invoices(status, due_date) WHERE status != 'paid';

-- ==========================================
-- INVOICE_ITEMS TABLE INDEXES
-- ==========================================
-- Tìm chi tiết theo hóa đơn
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ==========================================
-- MEDICATIONS TABLE INDEXES
-- ==========================================
-- Tìm kiếm thuốc theo tên
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);

-- Tìm thuốc theo số lượng tồn kho
CREATE INDEX IF NOT EXISTS idx_medications_stock_level
  ON medications(stock_quantity);

-- Tìm thuốc hết hạn
CREATE INDEX IF NOT EXISTS idx_medications_expiry ON medications(expiry_date);

-- ==========================================
-- MEDICAL_EQUIPMENT TABLE INDEXES
-- ==========================================
-- Tìm thiết bị theo trạng thái (active, inactive, etc)
CREATE INDEX IF NOT EXISTS idx_equipment_status ON medical_equipment(status);

-- Tìm thiết bị cần bảo trì
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance 
  ON medical_equipment(next_maintenance_date);

-- ==========================================
-- DEPARTMENTS TABLE INDEXES
-- ==========================================
-- Tìm phòng ban theo code
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- ==========================================
-- AUDIT_LOGS TABLE INDEXES
-- ==========================================
-- Tìm lịch sử hoạt động của người dùng
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Tìm lịch sử theo entity (VD: tất cả hoạt động liên quan bệnh nhân)
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
  ON audit_logs(entity_type, entity_id);

-- Tìm theo hành động (tất cả CREATE, UPDATE, DELETE)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Tìm theo thời gian (phổ biến cho báo cáo)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==========================================
-- COMPOSITE INDEXES (Chỉ số kết hợp - tối ưu cho truy vấn phức tạp)
-- ==========================================

-- Tìm lịch hẹn chưa hoàn thành của bệnh nhân
CREATE INDEX IF NOT EXISTS idx_appointments_patient_to_do 
  ON appointments(patient_id, status) 
  WHERE status IN ('scheduled', 'in-progress');

-- Tìm hóa đơn chưa đóng toàn bộ của bệnh nhân
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid 
  ON invoices(patient_id, status) 
  WHERE status IN ('pending', 'partially_paid', 'overdue');

-- ==========================================
-- PARTIAL INDEXES (Chỉ số cho một phần dữ liệu)
-- ==========================================

-- Chỉ lập index cho users hoạt động (bỏ qua tài khoản bị xóa)
CREATE INDEX IF NOT EXISTS idx_active_users 
  ON users(email) 
  WHERE is_active = true AND deleted_at IS NULL;

-- Index tìm bác sĩ theo chuyên khoa (đã có idx_doctors_specialist ở trên)
-- idx_active_doctors bỏ qua vì PostgreSQL không cho subquery trong index predicate
