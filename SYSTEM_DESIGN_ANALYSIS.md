# Phân Tích Thiết Kế Hệ Thống Quản Lý Bệnh Viện

## Hospital Management System - Design Analysis

---

## 1. TÓM TẮT HỆ THỐNG (System Overview)

### 1.1 Mục Tiêu

- Quản lý bệnh nhân và hồ sơ sức khỏe điện tử
- Quản lý lịch hẹn, danh sách chờ
- Quản lý khuôn khổ y tế, thiết bị, thuốc
- Xử lý hóa đơn và thanh toán
- Tạo báo cáo và thống kê

### 1.2 Thông Số Dự Án

- **Quy mô**: Bệnh viện trung bình (50-200 bác sĩ)
- **Số bệnh nhân ước tính**: 5,000-10,000 bệnh nhân
- **Số người dùng**: 300-500 người
- **Technology Stack**: PERN (PostgreSQL, Express, React, Node.js)
- **Deployment**: On-premises
- **Thời gian phát triển ước tính**: 4-6 tháng

---

## 2. KIẾN TRÚC HỆ THỐNG (System Architecture)

### 2.1 Kiến Trúc Ba Tầng (Three-Tier Architecture)

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (React)                 │
│   Web UI | Admin Dashboard | Mobile Responsive         │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│         APPLICATION LAYER (Node.js + Express)           │
│   API Controllers | Business Logic | Authentication     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│        DATA LAYER (PostgreSQL + Services)               │
│   Database | Caching (Redis) | File Storage            │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Kiến Trúc Microservices (Optional - Tương Lai)

```
Patient Service ──┐
Appointment Service ──┤
Medical Records Service ──┼─ API Gateway ── Load Balancer ── React Frontend
Pharmacy Service ──┤
Billing Service ──┘
```

---

## 3. THIẾT KẾ CƠDỮ LIỆU (Database Design)

### 3.1 Sơ Đồ ER (Entity Relationship Diagram)

#### Bảng Người Dùng (Users)

```sql
users
├── id (UUID, PK)
├── email (UNIQUE)
├── password_hash
├── full_name
├── phone
├── role (doctor, nurse, admin, receptionist, patient)
├── is_active
├── created_at
└── updated_at
```

#### Bảng Bệnh Nhân (Patients)

```sql
patients
├── id (UUID, PK)
├── user_id (FK -> users)
├── medical_record_number (UNIQUE)
├── date_of_birth
├── gender
├── blood_type
├── allergies (JSON)
├── emergency_contact
├── insurance_info (JSON)
├── created_at
└── updated_at
```

#### Bảng Bác Sĩ (Doctors)

```sql
doctors
├── id (UUID, PK)
├── user_id (FK -> users)
├── specialist (cardiology, pediatrics, etc.)
├── license_number (UNIQUE)
├── license_expiry
├── phone_extension
├── office_room
├── max_patients_per_day
├── created_at
└── updated_at
```

#### Bảng Lịch Hẹn (Appointments)

```sql
appointments
├── id (UUID, PK)
├── patient_id (FK -> patients)
├── doctor_id (FK -> doctors)
├── appointment_date
├── appointment_time
├── duration_minutes
├── status (scheduled, completed, cancelled, no-show)
├── reason_for_visit
├── notes
├── created_at
└── updated_at
```

#### Bảng Hồ Sơ Y Tế (Medical Records)

```sql
medical_records
├── id (UUID, PK)
├── patient_id (FK -> patients)
├── doctor_id (FK -> doctors)
├── appointment_id (FK -> appointments)
├── diagnosis
├── symptoms
├── vital_signs (JSON)
├── treatment_plan
├── prescribed_medications (JSON)
├── test_results (JSON)
├── attachment_urls (ARRAY)
├── created_at
└── updated_at
```

#### Bảng Thuốc (Medications)

```sql
medications
├── id (UUID, PK)
├── name
├── dosage
├── description
├── side_effects (JSON)
├── drug_interactions (ARRAY)
├── stock_quantity
├── unit_price
├── reorder_level
├── expiry_date
├── created_at
└── updated_at
```

#### Bảng Đơn Thuốc (Prescriptions)

```sql
prescriptions
├── id (UUID, PK)
├── medical_record_id (FK -> medical_records)
├── medication_id (FK -> medications)
├── dosage
├── frequency
├── duration_days
├── instructions
├── dispensed_date
├── created_at
└── updated_at
```

#### Bảng Hóa Đơn (Invoices)

```sql
invoices
├── id (UUID, PK)
├── patient_id (FK -> patients)
├── appointment_id (FK -> appointments)
├── invoice_number (UNIQUE)
├── invoice_date
├── total_amount
├── paid_amount
├── status (pending, paid, partially_paid, overdue)
├── due_date
├── payment_method
├── created_at
└── updated_at
```

#### Bảng Chi Tiết Hóa Đơn (Invoice Items)

```sql
invoice_items
├── id (UUID, PK)
├── invoice_id (FK -> invoices)
├── item_type (consultation, medication, test, equipment)
├── item_id (UUID)
├── description
├── quantity
├── unit_price
├── total_price
└── created_at
```

#### Bảng Khuôn Khổ Y Tế (Medical Equipment)

```sql
medical_equipment
├── id (UUID, PK)
├── name
├── category
├── model
├── serial_number (UNIQUE)
├── purchase_date
├── last_maintenance_date
├── next_maintenance_date
├── location
├── status (active, inactive, maintenance)
├── created_at
└── updated_at
```

#### Bảng Phòng (Rooms/Departments)

```sql
departments
├── id (UUID, PK)
├── name
├── code
├── leader_id (FK -> doctors)
├── phone
├── location
├── floor
├── created_at
└── updated_at
```

#### Bảng Nhân Viên (Staff)

```sql
staff
├── id (UUID, PK)
├── user_id (FK -> users)
├── position (nurse, technician, admin)
├── department_id (FK -> departments)
├── hire_date
├── salary (encrypted)
├── created_at
└── updated_at
```

### 3.2 Indexes

```sql
-- Performance Indexes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_user_id ON patients(user_id);
```

---

## 4. API DESIGN (RESTful)

### 4.1 Authentication & Authorization

```
POST   /api/auth/login          → User Login
POST   /api/auth/logout         → User Logout
POST   /api/auth/refresh-token  → Refresh Token
GET    /api/auth/profile        → Get Current User Profile
```

### 4.2 Patient Management

```
GET    /api/patients                    → List all patients (filtered, paginated)
GET    /api/patients/:id                → Get patient details
POST   /api/patients                    → Create new patient
PUT    /api/patients/:id                → Update patient info
DELETE /api/patients/:id                → Delete patient
GET    /api/patients/:id/medical-records → Get patient's medical records
GET    /api/patients/:id/appointments   → Get patient's appointments
GET    /api/patients/:id/invoices       → Get patient's invoices
```

### 4.3 Appointment Management

```
GET    /api/appointments                  → List appointments (with filters)
GET    /api/appointments/:id              → Get appointment details
POST   /api/appointments                  → Book new appointment
PUT    /api/appointments/:id              → Update appointment
DELETE /api/appointments/:id              → Cancel appointment
GET    /api/appointments/availability     → Get doctor availability
PUT    /api/appointments/:id/status       → Update appointment status
```

### 4.4 Medical Records

```
GET    /api/medical-records             → List medical records
GET    /api/medical-records/:id         → Get record details
POST   /api/medical-records             → Create new record
PUT    /api/medical-records/:id         → Update record
DELETE /api/medical-records/:id         → Delete record
POST   /api/medical-records/:id/upload  → Upload attachments
```

### 4.5 Medications & Prescriptions

```
GET    /api/medications                 → List medications
GET    /api/medications/:id             → Get medication details
POST   /api/medications                 → Add new medication
PUT    /api/medications/:id             → Update medication
DELETE /api/medications/:id             → Delete medication

GET    /api/prescriptions               → List prescriptions
POST   /api/prescriptions               → Create prescription
PUT    /api/prescriptions/:id           → Update prescription
```

### 4.6 Billing & Payments

```
GET    /api/invoices                    → List invoices
GET    /api/invoices/:id                → Get invoice details
POST   /api/invoices                    → Create invoice
PUT    /api/invoices/:id/payment        → Record payment
GET    /api/invoices/report             → Generate billing report
```

### 4.7 Reports & Analytics

```
GET    /api/reports/appointments        → Appointment statistics
GET    /api/reports/patients            → Patient statistics
GET    /api/reports/revenue             → Revenue report
GET    /api/reports/doctor-performance  → Doctor performance metrics
GET    /api/reports/medication-usage    → Medication usage report
```

### 4.8 Admin & Settings

```
GET    /api/admin/users                 → List all users
POST   /api/admin/users                 → Create user
PUT    /api/admin/users/:id             → Update user
DELETE /api/admin/users/:id             → Delete user
PUT    /api/admin/users/:id/role        → Change user role
GET    /api/admin/system-settings       → Get system settings
PUT    /api/admin/system-settings       → Update settings
```

---

## 5. FRONTEND STRUCTURE (React)

### 5.1 Pages/Routes

```
/
├── /dashboard              → Main dashboard
├── /patients
│  ├── /list               → Patient list
│  ├── /new                → Add new patient
│  ├── /:id                → Patient detail
│  └── /:id/edit           → Edit patient
├── /appointments
│  ├── /list               → Appointment list
│  ├── /book               → Book appointment
│  ├── /:id                → Appointment detail
│  └── /calendar           → Calendar view
├── /medical-records
│  ├── /list               → Medical records list
│  ├── /new                → Add new record
│  ├── /:id                → Record detail
│  └── /:id/edit           → Edit record
├── /medications
│  ├── /list               → Medications list
│  ├── /new                → Add medication
│  ├── /:id                → Medication detail
│  └── /:id/edit           → Edit medication
├── /invoices
│  ├── /list               → Invoices list
│  ├── /:id                → Invoice detail
│  └── /:id/payment        → Payment page
├── /reports
│  ├── /dashboard          → Reports dashboard
│  ├── /appointments       → Appointment report
│  ├── /revenue            → Revenue report
│  └── /doctor-performance → Doctor performance
├── /admin
│  ├── /users              → User management
│  ├── /departments        → Department management
│  ├── /settings           → System settings
│  └── /logs               → System logs
├── /profile               → User profile
├── /login                 → Login page
└── /404                   → Not found page
```

### 5.2 Component Structure

```
src/
├── components/
│  ├── Common/
│  │  ├── Header.jsx
│  │  ├── Sidebar.jsx
│  │  ├── Footer.jsx
│  │  └── Breadcrumb.jsx
│  ├── Patient/
│  │  ├── PatientList.jsx
│  │  ├── PatientForm.jsx
│  │  ├── PatientDetail.jsx
│  │  └── PatientSearch.jsx
│  ├── Appointment/
│  │  ├── AppointmentList.jsx
│  │  ├── AppointmentForm.jsx
│  │  ├── AppointmentCalendar.jsx
│  │  └── AvailabilityChecker.jsx
│  ├── MedicalRecord/
│  │  ├── MedicalRecordList.jsx
│  │  ├── MedicalRecordForm.jsx
│  │  └── MedicalRecordDetail.jsx
│  ├── Medication/
│  │  ├── MedicationList.jsx
│  │  └── MedicationForm.jsx
│  ├── Invoice/
│  │  ├── InvoiceList.jsx
│  │  ├── InvoiceDetail.jsx
│  │  └── InvoiceForm.jsx
│  ├── Reports/
│  │  ├── ReportDashboard.jsx
│  │  └── Chart.jsx
│  └── Common/
│     ├── Table.jsx
│     ├── Modal.jsx
│     ├── Button.jsx
│     └── Notification.jsx
├── pages/
│  ├── Dashboard.jsx
│  ├── Login.jsx
│  └── NotFound.jsx
├── hooks/
│  ├── useAuth.js
│  ├── usePatient.js
│  ├── useAppointment.js
│  └── ...
├── services/
│  ├── api.js
│  ├── authService.js
│  ├── patientService.js
│  ├── appointmentService.js
│  └── ...
├── redux/ (or useContext)
│  ├── slices/
│  │  ├── authSlice.js
│  │  ├── patientSlice.js
│  │  └── ...
│  └── store.js
├── utils/
│  ├── validators.js
│  ├── formatters.js
│  ├── constants.js
│  └── helpers.js
├── css/
│  ├── App.css
│  └── variables.css
└── App.jsx
```

---

## 6. BACKEND STRUCTURE (Node.js + Express)

### 6.1 Project Structure

```
backend/
├── config/
│  ├── database.js          → PostgreSQL connection
│  ├── redis.js             → Redis connection
│  ├── jwt.js               → JWT configuration
│  └── environment.js       → Environment variables
├── middleware/
│  ├── authMiddleware.js    → JWT verification
│  ├── errorHandler.js      → Global error handling
│  ├── validateInput.js     → Input validation
│  ├── corsMiddleware.js    → CORS setup
│  └── loggerMiddleware.js  → Request logging
├── routes/
│  ├── authRoutes.js
│  ├── patientRoutes.js
│  ├── appointmentRoutes.js
│  ├── medicalRecordRoutes.js
│  ├── medicationRoutes.js
│  ├── invoiceRoutes.js
│  ├── reportRoutes.js
│  ├── adminRoutes.js
│  └── index.js
├── controllers/
│  ├── authController.js
│  ├── patientController.js
│  ├── appointmentController.js
│  ├── medicalRecordController.js
│  ├── medicationController.js
│  ├── invoiceController.js
│  ├── reportController.js
│  └── adminController.js
├── services/
│  ├── authService.js
│  ├── patientService.js
│  ├── appointmentService.js
│  ├── medicalRecordService.js
│  ├── medicationService.js
│  ├── invoiceService.js
│  ├── reportService.js
│  └── emailService.js
├── models/
│  ├── User.js
│  ├── Patient.js
│  ├── Doctor.js
│  ├── Appointment.js
│  ├── MedicalRecord.js
│  ├── Medication.js
│  ├── Prescription.js
│  ├── Invoice.js
│  ├── Equipment.js
│  └── Department.js
├── utils/
│  ├── logger.js
│  ├── validators.js
│  ├── errorHandler.js
│  ├── jwt.js
│  ├── encryption.js
│  └── dateHelper.js
├── migrations/
│  ├── 001_init_schema.sql
│  ├── 002_add_indexes.sql
│  └── ...
├── seeds/
│  ├── seedUsers.js
│  ├── seedDoctors.js
│  └── ...
├── tests/
│  ├── unit/
│  ├── integration/
│  └── e2e/
├── .env.example
├── package.json
├── server.js
└── README.md
```

---

## 7. SECURITY ARCHITECTURE

### 7.1 Authentication

- **JWT (JSON Web Tokens)** for stateless authentication
  - Access Token: 15 minutes expiry
  - Refresh Token: 7 days expiry
  - Token stored in httpOnly cookies (frontend)

### 7.2 Authorization

- **Role-Based Access Control (RBAC)**
  - Roles: Admin, Doctor, Nurse, Receptionist, Patient
  - Middleware checks on every protected route

### 7.3 Data Protection

- **Encryption**
  - Passwords: bcryptjs (salt rounds: 10)
  - Sensitive data: AES-256 encryption
  - HTTPS/TLS for data in transit
  - Encrypted database passwords & API keys

### 7.4 Validation & Sanitization

- Input validation using libraries like `joi` or `express-validator`
- SQL injection prevention: Parameterized queries
- XSS prevention: React escaping by default
- CSRF protection: CSRF tokens in forms

### 7.5 API Security

- Rate limiting: Token bucket algorithm (10 requests/minute for login)
- CORS: Whitelist allowed origins
- API versioning: `/api/v1/`
- Request/Response logging

### 7.6 Audit Trail

```sql
audit_logs
├── id (UUID, PK)
├── user_id (FK -> users)
├── action (CREATE, READ, UPDATE, DELETE)
├── entity_type (Patient, Appointment, etc.)
├── entity_id
├── old_values (JSONB)
├── new_values (JSONB)
├── ip_address
├── timestamp
└── details
```

---

## 8. SCALABILITY & PERFORMANCE

### 8.1 Database Optimization

- **Connection Pooling**: pg (Node.js PostgreSQL library) with connection pool
- **Query Optimization**: Proper indexes, query analysis with EXPLAIN
- **Pagination**: Always paginate large result sets
- **Caching**: Redis for frequently accessed data
  - Patient profiles (TTL: 1 hour)
  - Doctor availability (TTL: 30 minutes)
  - Medication list (TTL: 24 hours)

### 8.2 API Performance

- **Response Compression**: gzip compression for HTTP responses
- **Lazy Loading**: Load data on-demand in frontend
- **Batch Requests**: Support batch operations where possible
- **Query Optimization**: Select only required fields

### 8.3 Frontend Performance

- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: Compressed images, WebP format
- **Bundle Size**: Minification with webpack
- **Caching**: Service Worker for offline functionality

### 8.4 Load Balancing (Future)

- **Nginx** or **HAProxy**: Load balance between backend instances
- **Database Replication**: Master-slave PostgreSQL setup
- **CDN**: CloudFlare or similar for static assets

---

## 9. TESTING STRATEGY

### 9.1 Unit Testing

- Frontend: Jest + React Testing Library
- Backend: Jest + Supertest
- Coverage target: 80%+

### 9.2 Integration Testing

- API endpoint testing with various scenarios
- Database transaction testing
- Third-party service mocking

### 9.3 E2E Testing

- Cypress or Selenium for user flow testing
- Test critical workflows: Login → Book Appointment → Pay Invoice

### 9.4 Performance Testing

- Load testing with JMeter or k6
- Stress testing: 500+ concurrent users
- Memory leak detection

---

## 10. MONITORING & LOGGING

### 10.1 Logging

```javascript
// Winston Logger Configuration
Logger levels: error, warn, info, http, debug
Log output: Console + File (daily rotation)
Format: JSON with timestamps, user_id, request_id
```

### 10.2 Application Monitoring

- **Error Tracking**: Sentry or LogRocket
- **Performance Monitoring**: New Relic or DataDog
- **Uptime Monitoring**: Pingdom or UptimeRobot

### 10.3 Database Monitoring

- Query execution time tracking
- Connection pool monitoring
- Replication lag monitoring (if applicable)

---

## 11. DEPLOYMENT ARCHITECTURE

### 11.1 Development Environment

```
Developer Machine
├── Node.js (v18.x)
├── PostgreSQL (local instance)
├── Redis (local instance)
└── React dev server (port 3000)
```

### 11.2 Staging Environment

```
Staging Server (On-Premises)
├── Node.js (v18.x) - 2 processes
├── PostgreSQL 13+ (dedicated)
├── Redis (dedicated)
├── Nginx (reverse proxy)
└── SSL Certificate (Let's Encrypt)
```

### 11.3 Production Environment

```
Production Servers (On-Premises)
├── Frontend Server (Nginx + React SPA)
├── Backend Server 1 (Node.js + PM2)
├── Backend Server 2 (Node.js + PM2)
├── PostgreSQL (dedicated, with backups)
├── Redis (dedicated)
├── Elasticsearch (optional, for logging)
└── Backup server (daily snapshots)
```

### 11.4 CI/CD Pipeline

```
GitHub/GitLab
  │
  ├─→ Run Tests (Jest)
  ├─→ Code Quality (ESLint, SonarQube)
  ├─→ Build Frontend (webpack)
  ├─→ Build Backend (minify, transpile)
  ├─→ Docker Build (optional)
  ├─→ Deploy to Staging
  ├─→ Run E2E Tests
  └─→ Deploy to Production
```

---

## 12. DISASTER RECOVERY & BACKUP

### 12.1 Backup Strategy

- **Database**: Daily cold backup + hourly WAL (Write-Ahead Logging)
- **Files**: Daily incremental backup
- **Retention**: 30 days
- **Location**: Separate physical storage/external drive

### 12.2 Recovery Plan

- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Failover**: Manual restore from backup
- **Testing**: Monthly restore drills

### 12.3 High Availability

- Database replication (streaming replication)
- Automated health checks
- Monitoring & alerting

---

## 13. THIRD-PARTY INTEGRATIONS

### 13.1 Email Service

- **Purpose**: Appointment reminders, password reset, notifications
- **Provider**: SendGrid, AWS SES, or Nodemailer (SMTP)
- **Features**: HTML templates, scheduling

### 13.2 SMS Gateway (Optional)

- **Purpose**: Appointment reminders, lab results notification
- **Provider**: Twilio, AWS SNS, or Nexmo
- **Fallback**: Email + In-app notification

### 13.3 Payment Gateway

- **Purpose**: Invoice payment processing
- **Provider**: Stripe, PayPal, or local payment provider
- **Features**: PCI compliance, webhook handling, refunds

### 13.4 File Storage

- **Purpose**: Medical records, reports, attachments
- **Options**:
  - Local file system (On-premises requirement)
  - MinIO (Self-hosted S3-compatible)
  - AWS S3 (if cloud later)

### 13.5 Calendar Integration (Optional)

- **Purpose**: Sync appointments to Google Calendar, Outlook
- **Implementation**: OAuth 2.0 integration

---

## 14. DEVELOPMENT TIMELINE

### Phase 1: Backend Core (4-5 weeks)

- Database schema finalization & migration
- User authentication & RBAC
- Patient management APIs
- Appointment management APIs
- Basic error handling & logging

### Phase 2: Frontend Foundation (3-4 weeks)

- React project setup & component architecture
- Authentication flow (login, logout, session)
- Patient list & detail pages
- Appointment booking flow
- Basic styling & responsive design

### Phase 3: Medical Records & Medications (3-4 weeks)

- Medical record APIs & frontend
- Medication management APIs & frontend
- Prescription management
- File upload/attachment handling

### Phase 4: Billing & Reports (3-4 weeks)

- Invoice creation & payment processing
- Report generation APIs
- Reporting dashboard frontend
- Data analytics

### Phase 5: Testing & Optimization (2-3 weeks)

- Unit tests, integration tests, E2E tests
- Performance optimization
- Security audit
- Bug fixes

### Phase 6: Deployment & Go-Live (1-2 weeks)

- Production environment setup
- Data migration from legacy systems
- User training & documentation
- UAT (User Acceptance Testing)

---

## 15. TECHNOLOGY STACK SUMMARY

| Layer        | Technology        | Version  | Purpose             |
| ------------ | ----------------- | -------- | ------------------- |
| **Frontend** | React             | 18.x     | UI Framework        |
|              | React Router      | 6.x      | Client-side routing |
|              | Redux/Zustand     | Latest   | State management    |
|              | Axios             | Latest   | HTTP client         |
|              | Tailwind CSS      | 3.x      | Styling             |
|              | Material-UI       | 5.x      | Component library   |
| **Backend**  | Node.js           | 18.x LTS | Runtime             |
|              | Express           | 4.x      | Web framework       |
|              | PostgreSQL        | 13+      | Main database       |
|              | Redis             | 7.x      | Caching & sessions  |
|              | Sequelize/TypeORM | Latest   | ORM                 |
|              | JWT               | -        | Authentication      |
|              | bcryptjs          | Latest   | Password hashing    |
|              | Multer            | Latest   | File upload         |
|              | Winston           | Latest   | Logging             |
| **DevOps**   | PM2               | Latest   | Process manager     |
|              | Nginx             | Latest   | Reverse proxy       |
|              | Docker            | Latest   | Containerization    |
|              | Docker Compose    | Latest   | Multi-container     |
|              | Git               | Latest   | Version control     |
| **Testing**  | Jest              | Latest   | Unit testing        |
|              | Supertest         | Latest   | API testing         |
|              | Cypress           | Latest   | E2E testing         |
|              | SonarQube         | Latest   | Code quality        |

---

## 16. DEPENDENCIES & LIBRARIES CHECKLIST

### Backend (Node.js)

```json
{
  "express": "^4.18.2",
  "pg": "^8.8.0",
  "redis": "^4.6.0",
  "sequelize": "^6.35.0",
  "dotenv": "^16.0.3",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "multer": "^1.4.5",
  "axios": "^1.3.0",
  "joi": "^17.9.0",
  "winston": "^3.8.0",
  "node-cron": "^3.0.2",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "nodemailer": "^6.9.0"
}
```

### Frontend (React)

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.11.0",
  "@reduxjs/toolkit": "^1.9.0",
  "react-redux": "^8.1.0",
  "axios": "^1.3.0",
  "@mui/material": "^5.13.0",
  "tailwindcss": "^3.3.0",
  "react-hot-toast": "^2.4.0",
  "date-fns": "^2.30.0",
  "react-big-calendar": "^1.8.0",
  "recharts": "^2.7.0"
}
```

---

## 17. RISK ASSESSMENT & MITIGATION

| Risk                                   | Probability | Impact   | Mitigation                                 |
| -------------------------------------- | ----------- | -------- | ------------------------------------------ |
| Data loss due to server failure        | Medium      | Critical | Daily backups, redundant storage           |
| Security breach                        | Medium      | Critical | Encryption, RBAC, regular audits           |
| Performance degradation                | Medium      | High     | Caching, indexing, load testing            |
| Scope creep                            | High        | Medium   | Clear requirements, feature prioritization |
| Integration issues with legacy systems | Medium      | High     | Early prototyping, API adapters            |
| Staff training gaps                    | Medium      | Medium   | Comprehensive documentation, workshops     |

---

## 18. SUCCESS METRICS

- ✅ System uptime: > 99%
- ✅ API response time: < 200ms (95th percentile)
- ✅ Page load time: < 3 seconds
- ✅ User adoption: 80% of staff within 3 months
- ✅ Data accuracy: 99.9%+
- ✅ Security: Zero critical vulnerabilities
- ✅ Cost savings: 30%+ reduction in paper records

---

## 19. DOCUMENTS TO CREATE

1. **Technical Specification Document** - Detailed API specs
2. **Database Schema Documentation** - ER diagram + table descriptions
3. **User Manual** - Step-by-step guides for each role
4. **Administrator Guide** - System configuration & maintenance
5. **API Documentation** - Swagger/OpenAPI specs
6. **Security Policy** - Data handling, access control
7. **Disaster Recovery Plan** - Backup & recovery procedures
8. **Testing Plan** - Test cases & scenarios
9. **Deployment Guide** - Installation & configuration steps
10. **Maintenance Schedule** - Regular maintenance tasks

---

## 20. GIT REPOSITORY STRUCTURE

```
hospital-management-system/
├── frontend/                    # React application
├── backend/                     # Node.js + Express API
├── database/                    # SQL migrations & seeds
├── docker/                      # Docker & Docker Compose files
├── docs/                        # Documentation
│  ├── API.md
│  ├── DATABASE.md
│  ├── ARCHITECTURE.md
│  ├── DEPLOYMENT.md
│  └── USER_MANUAL.md
├── .github/
│  └── workflows/               # CI/CD pipelines
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

---

## KẾT LUẬN (Conclusion)

Hệ thống Quản Lý Bệnh Viện được thiết kế để:
✅ Quản lý hiệu quả 5,000-10,000 bệnh nhân
✅ Hỗ trợ 300-500 người dùng đồng thời
✅ Đảm bảo bảo mật dữ liệu y tế (tuân thủ quy định)
✅ Dễ bảo trì, mở rộng trong tương lai
✅ Cung cấp trải nghiệm người dùng tốt
✅ Hỗ trợ quyết định dựa trên dữ liệu

Với kiến trúc này, hệ thống có thể:

- Xử lý 10x tải hiện tại mà không đáng kể
- Dễ dàng tích hợp các module mới trong tương lai
- Phục hồi từ sự cố nhanh chóng
- Duy trì tính toàn vẹn dữ liệu cao

---

_Tài liệu này được tạo vào ngày 26 tháng 4 năm 2026_
