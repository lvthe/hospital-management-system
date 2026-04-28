-- ==========================================
-- HOSPITAL MANAGEMENT SYSTEM - INITIAL SCHEMA
-- ==========================================
-- File: 001_init_schema.sql
-- Description: Tạo các bảng chính cho hệ thống
-- Created: 2026-04-26

-- ==========================================
-- 1. USERS TABLE (Bảng người dùng)
-- ==========================================
-- Lưu trữ thông tin tất cả người dùng (bác sĩ, y tá, lễ tân, bệnh nhân, admin)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'patient')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- Soft delete
);

-- ==========================================
-- 2. PATIENTS TABLE (Bảng bệnh nhân)
-- ==========================================
-- Lưu trữ thông tin chi tiết bệnh nhân (liên kết với users)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medical_record_number VARCHAR(50) UNIQUE NOT NULL, -- Mã hồ sơ bệnh nhân
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'Other')),
  blood_type VARCHAR(5), -- O+, O-, A+, A-, B+, B-, AB+, AB-
  allergies TEXT[], -- Array các dị ứng
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. DOCTORS TABLE (Bảng bác sĩ)
-- ==========================================
-- Lưu trữ thông tin chi tiết bác sĩ
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialist VARCHAR(100) NOT NULL, -- Chuyên khoa: Tim mạch, Nhi khoa, etc
  license_number VARCHAR(50) UNIQUE NOT NULL, -- Số giấy phép hành nghề
  license_expiry DATE,
  phone_extension VARCHAR(10),
  office_room VARCHAR(20),
  max_patients_per_day INTEGER DEFAULT 20, -- Số bệnh nhân tối đa/ngày
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. DEPARTMENTS TABLE (Bảng phòng ban)
-- ==========================================
-- Chia thành các phòng ban/khoa (Tim mạch, Nhi khoa, etc)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE, -- VD: CT, NK, TM
  leader_id UUID REFERENCES doctors(id) ON DELETE SET NULL, -- Trưởng phòng
  phone VARCHAR(20),
  location VARCHAR(100),
  floor INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. STAFF TABLE (Bảng nhân viên)
-- ==========================================
-- Y tá, kỹ thuật viên, và các nhân viên khác (không phải bác sĩ)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(50) NOT NULL, -- nurse, technician, receptionist, admin
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  hire_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. APPOINTMENTS TABLE (Bảng lịch hẹn)
-- ==========================================
-- Quản lý lịch hẹn khám bệnh
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30, -- Thời lượng khám
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled', 'no-show', 'in-progress')
  ),
  reason_for_visit TEXT, -- Lý do khám
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. MEDICAL_RECORDS TABLE (Bảng hồ sơ y tế)
-- ==========================================
-- Lưu trữ kết quả khám bệnh từng lần
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  diagnosis TEXT, -- Chẩn đoán
  symptoms TEXT[], -- Các triệu chứng
  vital_signs JSONB, -- { blood_pressure, heart_rate, temperature, weight, height }
  treatment_plan TEXT, -- Kế hoạch điều trị
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. MEDICATIONS TABLE (Bảng thuốc)
-- ==========================================
-- Kho dữ liệu các loại thuốc
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL, -- Tên thuốc
  dosage VARCHAR(50), -- Liều lượng (500mg, 1000mg, etc)
  description TEXT,
  side_effects TEXT[], -- Tác dụng phụ
  drug_interactions VARCHAR(150)[], -- Tương tác với thuốc khác
  stock_quantity INTEGER NOT NULL DEFAULT 0, -- Số lượng tồn kho
  unit_price DECIMAL(10, 2) NOT NULL, -- Giá mỗi đơn vị
  reorder_level INTEGER DEFAULT 100, -- Mức cảnh báo tồn kho
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. PRESCRIPTIONS TABLE (Bảng đơn thuốc)
-- ==========================================
-- Các thuốc được kê đơn cho bệnh nhân
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE RESTRICT,
  dosage VARCHAR(50) NOT NULL, -- VD: 1 viên
  frequency VARCHAR(50) NOT NULL, -- VD: 3 lần/ngày
  duration_days INTEGER, -- Số ngày uống
  instructions TEXT, -- Hướng dẫn dùng (ăn trước/sau cơm)
  dispensed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 10. INVOICES TABLE (Bảng hóa đơn)
-- ==========================================
-- Quản lý hóa đơn thanh toán
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- VD: INV-2026-001
  invoice_date DATE NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'paid', 'partially_paid', 'overdue', 'cancelled')
  ),
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 11. INVOICE_ITEMS TABLE (Bảng chi tiết hóa đơn)
-- ==========================================
-- Chi tiết từng mục chi phí trong hóa đơn
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- consultation, medication, test, equipment
  description VARCHAR(255),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 12. MEDICAL_EQUIPMENT TABLE (Bảng khuôn khổ y tế)
-- ==========================================
-- Quản lý thiết bị y tế
CREATE TABLE IF NOT EXISTS medical_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- Tên thiết bị
  category VARCHAR(50), -- Điện tâm đồ, siêu âm, etc
  model VARCHAR(50),
  serial_number VARCHAR(50) UNIQUE,
  purchase_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  location VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (
    status IN ('active', 'inactive', 'maintenance', 'retired')
  ),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 13. AUDIT_LOGS TABLE (Bảng ghi nhật ký kiểm tra)
-- ==========================================
-- Ghi lại tất cả hoạt động (tạo, sửa, xóa dữ liệu)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE
  entity_type VARCHAR(50) NOT NULL, -- Patient, Appointment, etc
  entity_id VARCHAR(100),
  old_values JSONB, -- Giá trị cũ trước khi sửa
  new_values JSONB, -- Giá trị mới
  ip_address VARCHAR(45),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- EXTENSIONS (Các tính năng mở rộng)
-- ==========================================
-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- COMMENTS - Giải thích chi tiết
-- ==========================================
COMMENT ON TABLE users IS 'Lưu trữ thông tin đăng nhập và hồ sơ cơ bản của tất cả người dùng hệ thống';
COMMENT ON TABLE patients IS 'Chi tiết bệnh nhân, bao gồm thông tin y tế, dị ứng, bảo hiểm';
COMMENT ON TABLE doctors IS 'Thông tin bác sĩ, chuyên khoa, giấy phép hành nghề';
COMMENT ON TABLE appointments IS 'Quản lý lịch hẹn khám bệnh của bệnh nhân với bác sĩ';
COMMENT ON TABLE medical_records IS 'Kết quả từng lần khám bệnh, chẩn đoán, treatment plan';
COMMENT ON TABLE medications IS 'Kho dữ liệu các loại thuốc sẵn có tại bệnh viện';
COMMENT ON TABLE prescriptions IS 'Các thuốc kê đơn cho bệnh nhân trong mỗi lần khám';
COMMENT ON TABLE invoices IS 'Hóa đơn thanh toán cho khám bệnh';
COMMENT ON TABLE medical_equipment IS 'Quản lý thiết bị y tế và bảo trì';
COMMENT ON TABLE audit_logs IS 'Ghi nhật ký tất cả hoạt động để tracking và kiểm toán';
