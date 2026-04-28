-- ============================================================
-- HOSPITAL MANAGEMENT SYSTEM - SEED DATA
-- ============================================================
-- File: database/seeds/001_seed_data.sql
-- Mật khẩu tất cả tài khoản: Hospital@123
-- Chạy: psql -U hospital_user -d hospital_db -f 001_seed_data.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- XÓA DỮ LIỆU CŨ (thứ tự reverse FK)
-- ============================================================
TRUNCATE TABLE
  audit_logs, invoice_items, prescriptions, invoices,
  medical_records, appointments, staff, departments,
  doctors, patients, medical_equipment, medications, users
CASCADE;

-- ============================================================
-- 1. USERS (1 admin, 5 bác sĩ, 3 y tá, 2 lễ tân, 5 bệnh nhân)
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active, email_verified) VALUES
-- Admin
('00000000-0000-0000-0000-000000000001', 'admin@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Nguyễn Quản Trị', '0901000001', 'admin', true, true),

-- Bác sĩ
('00000000-0000-0000-0000-000000000002', 'dr.nguyenvanan@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Nguyễn Văn An', '0901000002', 'doctor', true, true),

('00000000-0000-0000-0000-000000000003', 'dr.tranthib@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Trần Thị Bích', '0901000003', 'doctor', true, true),

('00000000-0000-0000-0000-000000000004', 'dr.levancuong@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Lê Văn Cường', '0901000004', 'doctor', true, true),

('00000000-0000-0000-0000-000000000005', 'dr.phamthidung@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Phạm Thị Dung', '0901000005', 'doctor', true, true),

('00000000-0000-0000-0000-000000000006', 'dr.hoangvane@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Hoàng Văn Em', '0901000006', 'doctor', true, true),

-- Y tá
('00000000-0000-0000-0000-000000000007', 'nurse.lethihoa@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Lê Thị Hoa', '0901000007', 'nurse', true, true),

('00000000-0000-0000-0000-000000000008', 'nurse.nguyenvangiang@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Nguyễn Văn Giang', '0901000008', 'nurse', true, true),

('00000000-0000-0000-0000-000000000009', 'nurse.phamthingoc@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Phạm Thị Ngọc', '0901000009', 'nurse', true, true),

-- Lễ tân
('00000000-0000-0000-0000-000000000010', 'recep.tranthilan@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Trần Thị Lan', '0901000010', 'receptionist', true, true),

('00000000-0000-0000-0000-000000000011', 'recep.levanminh@hospital.vn',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Lê Văn Minh', '0901000011', 'receptionist', true, true),

-- Bệnh nhân
('00000000-0000-0000-0000-000000000012', 'bn.nguyenvananh@gmail.com',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Nguyễn Văn Anh', '0912000001', 'patient', true, true),

('00000000-0000-0000-0000-000000000013', 'bn.tranthiminh@gmail.com',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Trần Thị Minh', '0912000002', 'patient', true, true),

('00000000-0000-0000-0000-000000000014', 'bn.levankhanh@gmail.com',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Lê Văn Khánh', '0912000003', 'patient', true, true),

('00000000-0000-0000-0000-000000000015', 'bn.phamthidieu@gmail.com',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Phạm Thị Diệu', '0912000004', 'patient', true, true),

('00000000-0000-0000-0000-000000000016', 'bn.hoangvanphuc@gmail.com',
 crypt('Hospital@123', gen_salt('bf', 10)),
 'Hoàng Văn Phúc', '0912000005', 'patient', true, true);

-- ============================================================
-- 2. PATIENTS
-- ============================================================
INSERT INTO patients (id, user_id, medical_record_number, date_of_birth, gender, blood_type,
                      allergies, emergency_contact_name, emergency_contact_phone,
                      emergency_contact_relationship, insurance_provider, insurance_policy_number) VALUES
('a0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000012',
 'MRN-2026-0001', '1985-03-15', 'M', 'O+',
 ARRAY['Penicillin'],
 'Nguyễn Văn Bình', '0912000010', 'Anh trai',
 'Bảo hiểm y tế nhà nước', 'BHYT-2026-001234'),

('a0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000013',
 'MRN-2026-0002', '2018-07-22', 'F', 'A+',
 ARRAY['Aspirin', 'Sulfa'],
 'Trần Văn Nam', '0912000020', 'Cha',
 'Bảo Minh Health', 'BAOMINH-2026-5678'),

('a0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000014',
 'MRN-2026-0003', '1975-11-08', 'M', 'B+',
 NULL,
 'Lê Thị Hương', '0912000030', 'Vợ',
 'Prudential Health', 'PRU-2026-9012'),

('a0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000015',
 'MRN-2026-0004', '2000-05-30', 'F', 'AB-',
 ARRAY['Latex', 'Shellfish'],
 'Phạm Văn Tùng', '0912000040', 'Cha',
 'Bảo hiểm y tế nhà nước', 'BHYT-2026-003456'),

('a0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000016',
 'MRN-2026-0005', '1968-09-12', 'M', 'O-',
 ARRAY['Ibuprofen'],
 'Hoàng Thị Mai', '0912000050', 'Vợ',
 'Vincare Health', 'VIN-2026-7890');

-- ============================================================
-- 3. DOCTORS
-- ============================================================
INSERT INTO doctors (id, user_id, specialist, license_number, license_expiry,
                     phone_extension, office_room, max_patients_per_day, bio) VALUES
('b0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000002',
 'Tim mạch', 'BS-TM-2019-001', '2029-12-31',
 '101', 'P.101A', 25,
 'Bác sĩ chuyên khoa II Tim mạch, 15 năm kinh nghiệm. Chuyên về van tim, suy tim và rối loạn nhịp.'),

('b0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000003',
 'Nhi khoa', 'BS-NK-2021-002', '2031-06-30',
 '202', 'P.202B', 30,
 'Bác sĩ chuyên khoa I Nhi khoa. Chuyên điều trị bệnh nhiễm khuẩn và hô hấp ở trẻ em.'),

('b0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000004',
 'Ngoại khoa', 'BS-NG-2018-003', '2028-03-31',
 '303', 'P.303C', 15,
 'PGS.TS Ngoại khoa. Chuyên phẫu thuật nội soi, tiêu hóa và ung thư.'),

('b0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000005',
 'Nội tổng quát', 'BS-NT-2020-004', '2030-09-30',
 '404', 'P.404D', 35,
 'Bác sĩ Nội tổng quát, chuyên về tiểu đường, huyết áp và bệnh mãn tính.'),

('b0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000006',
 'Tai Mũi Họng', 'BS-TMH-2022-005', '2032-12-31',
 '505', 'P.505E', 28,
 'Bác sĩ chuyên khoa Tai Mũi Họng. Chuyên viêm xoang mãn, ù tai và rối loạn thính giác.');

-- ============================================================
-- 4. DEPARTMENTS
-- ============================================================
INSERT INTO departments (id, name, code, leader_id, phone, location, floor) VALUES
('c0000000-0000-0000-0000-000000000001', 'Khoa Tim mạch', 'TM',
 'b0000000-0000-0000-0000-000000000001', '028-3800-0101', 'Tòa A, Tầng 1', 1),

('c0000000-0000-0000-0000-000000000002', 'Khoa Nhi', 'NK',
 'b0000000-0000-0000-0000-000000000002', '028-3800-0202', 'Tòa B, Tầng 2', 2),

('c0000000-0000-0000-0000-000000000003', 'Khoa Ngoại', 'NG',
 'b0000000-0000-0000-0000-000000000003', '028-3800-0303', 'Tòa C, Tầng 3', 3),

('c0000000-0000-0000-0000-000000000004', 'Khoa Nội', 'NT',
 'b0000000-0000-0000-0000-000000000004', '028-3800-0404', 'Tòa A, Tầng 4', 4),

('c0000000-0000-0000-0000-000000000005', 'Khoa Tai Mũi Họng', 'TMH',
 'b0000000-0000-0000-0000-000000000005', '028-3800-0505', 'Tòa B, Tầng 5', 5);

-- ============================================================
-- 5. STAFF (3 y tá + 2 lễ tân)
-- ============================================================
INSERT INTO staff (id, user_id, position, department_id, hire_date) VALUES
('d0000000-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000007',
 'nurse', 'c0000000-0000-0000-0000-000000000001', '2022-01-15'),

('d0000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000008',
 'nurse', 'c0000000-0000-0000-0000-000000000002', '2021-06-01'),

('d0000000-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000009',
 'nurse', 'c0000000-0000-0000-0000-000000000004', '2023-03-20'),

('d0000000-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000010',
 'receptionist', NULL, '2020-08-10'),

('d0000000-0000-0000-0000-000000000005',
 '00000000-0000-0000-0000-000000000011',
 'receptionist', NULL, '2021-11-05');

-- ============================================================
-- 6. APPOINTMENTS (10 lịch hẹn: 5 completed, 3 scheduled, 1 cancelled, 1 no-show)
-- ============================================================
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time,
                          duration_minutes, status, reason_for_visit, notes) VALUES
('e0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 '2026-04-10', '08:30', 30, 'completed', 'Đau ngực, hồi hộp', 'Đã khám, ECG bình thường'),

('e0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 '2026-04-12', '09:00', 30, 'completed', 'Trẻ sốt cao 3 ngày', NULL),

('e0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 '2026-04-15', '10:00', 60, 'completed', 'Đau bụng cấp, nghi viêm ruột thừa',
 'Siêu âm xác nhận, đã phẫu thuật nội soi'),

('e0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
 '2026-04-18', '14:00', 30, 'completed', 'Kiểm tra đường huyết định kỳ', NULL),

('e0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
 '2026-04-20', '11:30', 30, 'completed', 'Ù tai phải, nghe kém', NULL),

('e0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 '2026-05-05', '08:30', 30, 'scheduled', 'Tái khám tim mạch', NULL),

('e0000000-0000-0000-0000-000000000007',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004',
 '2026-05-08', '09:30', 30, 'scheduled', 'Kiểm tra sức khỏe tổng quát', NULL),

('e0000000-0000-0000-0000-000000000008',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 '2026-05-10', '10:30', 45, 'scheduled', 'Tái khám sau phẫu thuật', NULL),

('e0000000-0000-0000-0000-000000000009',
 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
 '2026-04-22', '15:00', 30, 'cancelled', 'Sốt nhẹ, mệt mỏi', 'Bệnh nhân hủy vì bận công việc'),

('e0000000-0000-0000-0000-000000000010',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001',
 '2026-04-24', '13:00', 30, 'no-show', 'Tư vấn về chỉ số lipid', NULL);

-- ============================================================
-- 7. MEDICAL RECORDS (6 hồ sơ)
-- ============================================================
INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id,
                              diagnosis, symptoms, vital_signs, treatment_plan, notes) VALUES
('f0000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
 'e0000000-0000-0000-0000-000000000001',
 'Hội chứng hồi hộp đánh trống ngực, cần theo dõi',
 ARRAY['Đau ngực nhẹ', 'Hồi hộp', 'Khó thở khi gắng sức'],
 '{"blood_pressure":"130/85","heart_rate":88,"temperature":36.7,"weight":72,"height":170}'::JSONB,
 'Holter ECG 24 giờ. Tái khám sau 3 tuần. Hạn chế caffeine và rượu bia.',
 'ECG: Nhịp xoang bình thường, không có biến đổi ST'),

('f0000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002',
 'e0000000-0000-0000-0000-000000000002',
 'Viêm họng cấp do vi khuẩn',
 ARRAY['Sốt 38.5°C', 'Đau họng', 'Ho có đờm', 'Chảy mũi'],
 '{"blood_pressure":"100/65","heart_rate":98,"temperature":38.5,"weight":18,"height":115}'::JSONB,
 'Kháng sinh Amoxicillin 7 ngày. Hạ sốt khi >38.5°C. Uống nhiều nước.',
 'Xét nghiệm máu: Bạch cầu tăng 11.5 G/L'),

('f0000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
 'e0000000-0000-0000-0000-000000000003',
 'Viêm ruột thừa cấp — đã phẫu thuật nội soi thành công',
 ARRAY['Đau hố chậu phải', 'Sốt 37.8°C', 'Buồn nôn', 'Chán ăn'],
 '{"blood_pressure":"118/76","heart_rate":92,"temperature":37.8,"weight":68,"height":168}'::JSONB,
 'Đã phẫu thuật nội soi cắt ruột thừa. Kháng sinh 5 ngày sau mổ. Tái khám sau 1 tuần.',
 'Xuất viện ngày 17/04/2026. Không biến chứng'),

('f0000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004',
 'e0000000-0000-0000-0000-000000000004',
 'Đái tháo đường type 2 — kiểm soát tốt',
 ARRAY['Khát nước nhiều', 'Mệt mỏi nhẹ'],
 '{"blood_pressure":"125/80","heart_rate":76,"temperature":36.5,"weight":65,"height":158}'::JSONB,
 'Duy trì Metformin 500mg x 2/ngày. Kiêng tinh bột, đường. Tái khám sau 2 tháng.',
 'HbA1c: 7.2%. Chức năng thận bình thường'),

('f0000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005',
 'e0000000-0000-0000-0000-000000000005',
 'Viêm tai giữa mãn tính tai phải',
 ARRAY['Ù tai phải', 'Nghe kém tai phải', 'Chảy dịch tai'],
 '{"blood_pressure":"135/88","heart_rate":80,"temperature":36.8,"weight":78,"height":172}'::JSONB,
 'Nhỏ tai Ciprodex 4 giọt x 2/ngày x 7 ngày. Không để nước vào tai. Tái khám sau 2 tuần.',
 'Nội soi tai: Màng nhĩ thủng lỗ nhỏ phía sau trên'),

('f0000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004',
 NULL,
 'Tăng huyết áp độ 1',
 ARRAY['Đau đầu buổi sáng', 'Chóng mặt nhẹ'],
 '{"blood_pressure":"148/94","heart_rate":82,"temperature":36.6,"weight":73,"height":170}'::JSONB,
 'Bắt đầu Amlodipine 5mg/ngày. Giảm muối. Đo huyết áp tại nhà hàng ngày.',
 'Chưa có tổn thương cơ quan đích');

-- ============================================================
-- 8. MEDICATIONS (10 loại thuốc)
-- ============================================================
INSERT INTO medications (id, name, dosage, description, side_effects, drug_interactions,
                         stock_quantity, unit_price, reorder_level, expiry_date) VALUES
('10000000-0000-0000-0000-000000000001', 'Paracetamol', '500mg',
 'Thuốc hạ sốt và giảm đau thông thường',
 ARRAY['Buồn nôn (hiếm)', 'Phát ban (hiếm)'],
 ARRAY['Warfarin', 'Rượu'],
 5000, 1500.00, 500, '2027-12-31'),

('10000000-0000-0000-0000-000000000002', 'Amoxicillin', '500mg',
 'Kháng sinh phổ rộng nhóm penicillin',
 ARRAY['Tiêu chảy', 'Buồn nôn', 'Phát ban'],
 ARRAY['Warfarin', 'Methotrexate'],
 1200, 4500.00, 200, '2027-06-30'),

('10000000-0000-0000-0000-000000000003', 'Metformin', '500mg',
 'Thuốc điều trị đái tháo đường type 2',
 ARRAY['Buồn nôn', 'Tiêu chảy', 'Đau bụng'],
 ARRAY['Cimetidine', 'Rượu'],
 2500, 3000.00, 300, '2028-03-31'),

('10000000-0000-0000-0000-000000000004', 'Amlodipine', '5mg',
 'Thuốc hạ huyết áp nhóm chẹn kênh canxi',
 ARRAY['Phù chân', 'Đau đầu', 'Hồi hộp'],
 ARRAY['Simvastatin', 'Cyclosporine'],
 800, 8000.00, 100, '2028-09-30'),

('10000000-0000-0000-0000-000000000005', 'Ciprodex', '0.3%/0.1% nhỏ tai',
 'Thuốc nhỏ tai kháng sinh kết hợp corticosteroid (5ml)',
 ARRAY['Ngứa tai', 'Ù tai nhẹ tạm thời'],
 ARRAY[]::VARCHAR[],
 300, 125000.00, 50, '2027-08-31'),

('10000000-0000-0000-0000-000000000006', 'Omeprazole', '20mg',
 'Ức chế bơm proton, điều trị loét dạ dày tá tràng',
 ARRAY['Đau đầu', 'Buồn nôn', 'Tiêu chảy'],
 ARRAY['Clopidogrel', 'Methotrexate'],
 1500, 5500.00, 150, '2027-10-31'),

('10000000-0000-0000-0000-000000000007', 'Cetirizine', '10mg',
 'Thuốc kháng histamine thế hệ 2, điều trị dị ứng',
 ARRAY['Buồn ngủ nhẹ', 'Khô miệng'],
 ARRAY['Rượu', 'Thuốc an thần'],
 900, 4000.00, 100, '2028-01-31'),

('10000000-0000-0000-0000-000000000008', 'Ibuprofen', '400mg',
 'Thuốc kháng viêm không steroid (NSAID)',
 ARRAY['Đau dạ dày', 'Buồn nôn', 'Chóng mặt'],
 ARRAY['Aspirin', 'Warfarin', 'Lithium'],
 2000, 3500.00, 200, '2027-05-31'),

('10000000-0000-0000-0000-000000000009', 'Azithromycin', '250mg',
 'Kháng sinh macrolide, nhiễm khuẩn đường hô hấp',
 ARRAY['Tiêu chảy', 'Buồn nôn', 'Đau bụng'],
 ARRAY['Antacid', 'Warfarin'],
 600, 12000.00, 100, '2027-11-30'),

('10000000-0000-0000-0000-000000000010', 'Salbutamol', '2.5mg/2.5ml',
 'Thuốc giãn phế quản, điều trị hen suyễn (dạng khí dung)',
 ARRAY['Run rẩy', 'Hồi hộp', 'Đau đầu'],
 ARRAY['Beta-blockers', 'Diuretics'],
 450, 28000.00, 80, '2027-07-31');

-- ============================================================
-- 9. PRESCRIPTIONS (9 đơn thuốc cho 6 hồ sơ y tế)
-- ============================================================
INSERT INTO prescriptions (id, medical_record_id, medication_id, dosage, frequency,
                           duration_days, instructions, dispensed_date) VALUES
-- Hồ sơ 1: Tim mạch
('20000000-0000-0000-0000-000000000001',
 'f0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007',
 '1 viên', '1 lần/ngày buổi tối', 30,
 'Uống sau bữa tối. Tránh lái xe sau khi uống.', '2026-04-10 10:00:00'),

-- Hồ sơ 2: Nhi viêm họng (2 thuốc)
('20000000-0000-0000-0000-000000000002',
 'f0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
 '1/2 viên (250mg)', '3 lần/ngày', 7,
 'Uống sau bữa ăn. Uống đủ kháng sinh dù đã khỏe.', '2026-04-12 11:00:00'),

('20000000-0000-0000-0000-000000000003',
 'f0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
 '1/2 viên (250mg)', 'Khi sốt ≥38.5°C (cách nhau ≥4 giờ)', 7,
 'Chỉ dùng khi sốt cao. Không quá 4 lần/ngày.', '2026-04-12 11:00:00'),

-- Hồ sơ 3: Ngoại sau mổ (2 thuốc)
('20000000-0000-0000-0000-000000000004',
 'f0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009',
 '1 viên', '1 lần/ngày buổi sáng', 5,
 'Uống lúc đói, trước bữa sáng 1 giờ.', '2026-04-15 16:00:00'),

('20000000-0000-0000-0000-000000000005',
 'f0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008',
 '1 viên', '2 lần/ngày', 5,
 'Uống sau bữa ăn. Dừng nếu đau dạ dày.', '2026-04-15 16:00:00'),

-- Hồ sơ 4: Tiểu đường
('20000000-0000-0000-0000-000000000006',
 'f0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003',
 '1 viên', '2 lần/ngày (sáng và tối)', 60,
 'Uống trong hoặc ngay sau bữa ăn. Không bỏ liều.', '2026-04-18 15:00:00'),

-- Hồ sơ 5: Tai Mũi Họng
('20000000-0000-0000-0000-000000000007',
 'f0000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005',
 '4 giọt/lần', '2 lần/ngày', 7,
 'Nằm nghiêng tai bệnh khi nhỏ. Giữ 5 phút sau khi nhỏ.', '2026-04-20 13:00:00'),

-- Hồ sơ 6: Tăng huyết áp (2 thuốc)
('20000000-0000-0000-0000-000000000008',
 'f0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004',
 '1 viên', '1 lần/ngày buổi sáng', 30,
 'Uống cùng một giờ mỗi ngày. Không tự ngừng đột ngột.', '2026-04-22 09:00:00'),

('20000000-0000-0000-0000-000000000009',
 'f0000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006',
 '1 viên', '1 lần/ngày buổi sáng trước ăn', 30,
 'Uống trước bữa sáng 30 phút để bảo vệ dạ dày.', '2026-04-22 09:00:00');

-- ============================================================
-- 10. INVOICES (6 hóa đơn: 3 paid, 1 partially_paid, 1 pending, 1 overdue)
-- ============================================================
INSERT INTO invoices (id, patient_id, appointment_id, invoice_number, invoice_date,
                      total_amount, paid_amount, status, due_date) VALUES
('30000000-0000-0000-0000-000000000001',
 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
 'INV-2026-001', '2026-04-10', 450000.00, 450000.00, 'paid', '2026-04-17'),

('30000000-0000-0000-0000-000000000002',
 'a0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002',
 'INV-2026-002', '2026-04-12', 350000.00, 350000.00, 'paid', '2026-04-19'),

('30000000-0000-0000-0000-000000000003',
 'a0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003',
 'INV-2026-003', '2026-04-15', 8500000.00, 5000000.00, 'partially_paid', '2026-05-15'),

('30000000-0000-0000-0000-000000000004',
 'a0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004',
 'INV-2026-004', '2026-04-18', 380000.00, 380000.00, 'paid', '2026-04-25'),

('30000000-0000-0000-0000-000000000005',
 'a0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005',
 'INV-2026-005', '2026-04-20', 625000.00, 0.00, 'pending', '2026-04-27'),

('30000000-0000-0000-0000-000000000006',
 'a0000000-0000-0000-0000-000000000001', NULL,
 'INV-2026-006', '2026-04-22', 290000.00, 0.00, 'overdue', '2026-04-22');

-- ============================================================
-- 11. INVOICE ITEMS (chi tiết từng hóa đơn — tổng phải khớp)
-- ============================================================
INSERT INTO invoice_items (invoice_id, item_type, description, quantity, unit_price, total_price) VALUES
-- INV-001: Tim mạch (300k + 150k = 450k)
('30000000-0000-0000-0000-000000000001', 'consultation', 'Khám chuyên khoa Tim mạch', 1, 300000.00, 300000.00),
('30000000-0000-0000-0000-000000000001', 'test', 'Điện tâm đồ ECG 12 chuyển đạo', 1, 150000.00, 150000.00),

-- INV-002: Nhi (200k + 100k + 50k = 350k)
('30000000-0000-0000-0000-000000000002', 'consultation', 'Khám Nhi khoa', 1, 200000.00, 200000.00),
('30000000-0000-0000-0000-000000000002', 'test', 'Xét nghiệm máu CBC', 1, 100000.00, 100000.00),
('30000000-0000-0000-0000-000000000002', 'medication', 'Thuốc kháng sinh (gói)', 1, 50000.00, 50000.00),

-- INV-003: Ngoại phẫu thuật (5tr + 2tr + 1tr + 500k = 8.5tr)
('30000000-0000-0000-0000-000000000003', 'consultation', 'Phí phẫu thuật nội soi cắt ruột thừa', 1, 5000000.00, 5000000.00),
('30000000-0000-0000-0000-000000000003', 'consultation', 'Phòng bệnh viện hạng thường (2 ngày)', 2, 1000000.00, 2000000.00),
('30000000-0000-0000-0000-000000000003', 'medication', 'Thuốc sau mổ (gói)', 1, 1000000.00, 1000000.00),
('30000000-0000-0000-0000-000000000003', 'test', 'Siêu âm bụng tổng quát', 1, 500000.00, 500000.00),

-- INV-004: Nội tiểu đường (200k + 130k + 50k = 380k)
('30000000-0000-0000-0000-000000000004', 'consultation', 'Khám Nội tổng quát', 1, 200000.00, 200000.00),
('30000000-0000-0000-0000-000000000004', 'test', 'Xét nghiệm HbA1c', 1, 130000.00, 130000.00),
('30000000-0000-0000-0000-000000000004', 'medication', 'Metformin 500mg x 60 viên', 60, 833.33, 50000.00),

-- INV-005: Tai Mũi Họng (250k + 200k + 125k + 50k = 625k)
('30000000-0000-0000-0000-000000000005', 'consultation', 'Khám chuyên khoa Tai Mũi Họng', 1, 250000.00, 250000.00),
('30000000-0000-0000-0000-000000000005', 'test', 'Nội soi tai và đo thính lực', 1, 200000.00, 200000.00),
('30000000-0000-0000-0000-000000000005', 'medication', 'Ciprodex nhỏ tai 5ml', 1, 125000.00, 125000.00),
('30000000-0000-0000-0000-000000000005', 'medication', 'Cetirizine 10mg x 14 viên', 14, 3571.43, 50000.00),

-- INV-006: Huyết áp (200k + 50k + 40k = 290k)
('30000000-0000-0000-0000-000000000006', 'consultation', 'Khám Nội tổng quát', 1, 200000.00, 200000.00),
('30000000-0000-0000-0000-000000000006', 'medication', 'Amlodipine 5mg x 30 viên', 30, 1333.33, 40000.00),
('30000000-0000-0000-0000-000000000006', 'medication', 'Omeprazole 20mg x 30 viên', 30, 1666.67, 50000.00);

-- ============================================================
-- 12. MEDICAL EQUIPMENT (8 thiết bị)
-- ============================================================
INSERT INTO medical_equipment (id, name, category, model, serial_number,
                                purchase_date, last_maintenance_date, next_maintenance_date,
                                location, status) VALUES
('40000000-0000-0000-0000-000000000001',
 'Máy ECG 12 chuyển đạo', 'Chẩn đoán tim mạch', 'Nihon Kohden ECG-1550P', 'NK-ECG-2023-001',
 '2023-01-15', '2026-01-15', '2026-07-15', 'Khoa Tim mạch - P.101A', 'active'),

('40000000-0000-0000-0000-000000000002',
 'Máy siêu âm tổng quát', 'Chẩn đoán hình ảnh', 'GE LOGIQ E10', 'GE-US-2022-005',
 '2022-06-20', '2025-12-20', '2026-06-20', 'Khoa Ngoại - P.303', 'active'),

('40000000-0000-0000-0000-000000000003',
 'Máy đo huyết áp tự động', 'Theo dõi sinh tồn', 'Omron HBP-1300', 'OM-BP-2024-012',
 '2024-03-10', '2026-03-10', '2026-09-10', 'Khoa Nội - P.404D', 'active'),

('40000000-0000-0000-0000-000000000004',
 'Đèn nội soi tai mũi họng', 'Nội soi', 'Karl Storz 11101 VP', 'KS-ENT-2023-003',
 '2023-08-05', '2026-02-05', '2026-08-05', 'Khoa TMH - P.505E', 'active'),

('40000000-0000-0000-0000-000000000005',
 'Máy thở oxy trẻ em', 'Hô hấp hỗ trợ', 'Fisher & Paykel AIRVO 2', 'FP-OX-2021-008',
 '2021-11-22', '2025-11-22', '2026-05-22', 'Khoa Nhi - P.202', 'active'),

('40000000-0000-0000-0000-000000000006',
 'Bàn phẫu thuật điều khiển điện', 'Phòng mổ', 'Maquet Alphamaxx', 'MQ-OT-2020-001',
 '2020-04-18', '2025-10-18', '2026-04-18', 'Phòng mổ 1 - Tầng 3', 'maintenance'),

('40000000-0000-0000-0000-000000000007',
 'Máy đo đường huyết cầm tay', 'Xét nghiệm nhanh', 'Roche Accu-Chek Guide', 'RC-BG-2025-020',
 '2025-01-08', '2026-01-08', '2026-07-08', 'Khoa Nội - P.404D', 'active'),

('40000000-0000-0000-0000-000000000008',
 'Máy X-quang kỹ thuật số', 'Chẩn đoán hình ảnh', 'Philips DigitalDiagnost C90', 'PH-XR-2022-002',
 '2022-09-30', '2026-03-30', '2026-09-30', 'Phòng X-quang - Tầng 1', 'inactive');

-- ============================================================
-- 13. AUDIT LOGS (10 bản ghi hoạt động)
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values,
                        ip_address, details) VALUES
('00000000-0000-0000-0000-000000000001', 'CREATE', 'User',
 '00000000-0000-0000-0000-000000000002', NULL,
 '{"email":"dr.nguyenvanan@hospital.vn","role":"doctor"}'::JSONB,
 '192.168.1.1', 'Admin tạo tài khoản bác sĩ Nguyễn Văn An'),

('00000000-0000-0000-0000-000000000010', 'CREATE', 'Appointment',
 'e0000000-0000-0000-0000-000000000001', NULL,
 '{"patient_id":"a0000000-0000-0000-0000-000000000001","doctor_id":"b0000000-0000-0000-0000-000000000001","date":"2026-04-10"}'::JSONB,
 '192.168.1.10', 'Lễ tân Trần Thị Lan đặt lịch hẹn cho bệnh nhân Nguyễn Văn Anh'),

('00000000-0000-0000-0000-000000000002', 'UPDATE', 'Appointment',
 'e0000000-0000-0000-0000-000000000001',
 '{"status":"scheduled"}'::JSONB,
 '{"status":"completed"}'::JSONB,
 '192.168.1.20', 'BS Nguyễn Văn An cập nhật trạng thái lịch hẹn → completed'),

('00000000-0000-0000-0000-000000000002', 'CREATE', 'MedicalRecord',
 'f0000000-0000-0000-0000-000000000001', NULL,
 '{"diagnosis":"Hội chứng hồi hộp đánh trống ngực"}'::JSONB,
 '192.168.1.20', 'BS Nguyễn Văn An tạo hồ sơ y tế sau khám'),

('00000000-0000-0000-0000-000000000010', 'CREATE', 'Invoice',
 '30000000-0000-0000-0000-000000000001', NULL,
 '{"invoice_number":"INV-2026-001","total_amount":450000}'::JSONB,
 '192.168.1.10', 'Lễ tân tạo hóa đơn INV-2026-001'),

('00000000-0000-0000-0000-000000000010', 'UPDATE', 'Invoice',
 '30000000-0000-0000-0000-000000000001',
 '{"status":"pending","paid_amount":0}'::JSONB,
 '{"status":"paid","paid_amount":450000}'::JSONB,
 '192.168.1.10', 'Ghi nhận thanh toán đầy đủ INV-2026-001'),

('00000000-0000-0000-0000-000000000004', 'CREATE', 'MedicalRecord',
 'f0000000-0000-0000-0000-000000000003', NULL,
 '{"diagnosis":"Viêm ruột thừa cấp"}'::JSONB,
 '192.168.1.30', 'BS Lê Văn Cường tạo hồ sơ phẫu thuật'),

('00000000-0000-0000-0000-000000000009', 'UPDATE', 'Appointment',
 'e0000000-0000-0000-0000-000000000009',
 '{"status":"scheduled"}'::JSONB,
 '{"status":"cancelled"}'::JSONB,
 '192.168.1.15', 'Y tá hủy lịch hẹn theo yêu cầu bệnh nhân'),

('00000000-0000-0000-0000-000000000001', 'UPDATE', 'MedicalEquipment',
 '40000000-0000-0000-0000-000000000006',
 '{"status":"active"}'::JSONB,
 '{"status":"maintenance"}'::JSONB,
 '192.168.1.1', 'Admin chuyển bàn mổ sang chế độ bảo trì định kỳ'),

('00000000-0000-0000-0000-000000000005', 'CREATE', 'MedicalRecord',
 'f0000000-0000-0000-0000-000000000006', NULL,
 '{"diagnosis":"Tăng huyết áp độ 1"}'::JSONB,
 '192.168.1.25', 'BS Phạm Thị Dung tạo hồ sơ tăng huyết áp');

-- ============================================================
-- KIỂM TRA DỮ LIỆU
-- ============================================================
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL SELECT 'patients', COUNT(*) FROM patients
UNION ALL SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'staff', COUNT(*) FROM staff
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'medical_records', COUNT(*) FROM medical_records
UNION ALL SELECT 'medications', COUNT(*) FROM medications
UNION ALL SELECT 'prescriptions', COUNT(*) FROM prescriptions
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL SELECT 'medical_equipment', COUNT(*) FROM medical_equipment
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
ORDER BY table_name;
