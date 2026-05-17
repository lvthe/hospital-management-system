# Hospital Management System

## Hệ Thống Quản Lý Bệnh Viện

Một nền tảng quản lý bệnh viện toàn diện được xây dựng bằng công nghệ hiện đại, hỗ trợ quản lý bệnh nhân, lịch hẹn, hồ sơ y tế, khuôn khổ y tế và hóa đơn.

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Tính Năng](#tính-năng)
3. [Công Nghệ](#công-nghệ)
4. [Các Tài Liệu](#các-tài-liệu)
5. [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
6. [Chạy Project](#chạy-project)
7. [Cấu Trúc Project](#cấu-trúc-project)
8. [Bản Phân Công](#bản-phân-công)
9. [Contributors](#contributors)
10. [License](#license)

---

## 🎯 Tổng Quan

**Hospital Management System** là một ứng dụng quản lý bệnh viện được thiết kế cho các bệnh viện trung bình (50-200 bác sĩ) với khoảng 5,000-10,000 bệnh nhân.

### Và Mục Tiêu

- ✅ Quản lý hiệu quả hồ sơ bệnh nhân điện tử
- ✅ Tối ưu hóa lịch hẹn và danh sách chờ
- ✅ Quản lý khuôn khổ y tế và thuốc
- ✅ Xử lý hóa đơn và thanh toán tự động
- ✅ Cung cấp báo cáo và thống kê chi tiết
- ✅ Đảm bảo bảo mật dữ liệu y tế cao
- ✅ Dễ dàng mở rộng trong tương lai

### Thông Số Dự Án

| Thông Số                 | Giá Trị                                    |
| ------------------------ | ------------------------------------------ |
| **Quy Mô**               | Bệnh viện trung bình (50-200 bác sĩ)       |
| **Số Bệnh Nhân**         | 5,000-10,000                               |
| **Số Người Dùng**        | 300-500                                    |
| **Technology Stack**     | PERN (PostgreSQL, Express, React, Node.js) |
| **Database**             | PostgreSQL 13+                             |
| **Caching**              | Redis 7.x                                  |
| **Deployment**           | On-premises                                |
| **Thời Gian Phát Triển** | 4-6 tháng                                  |

---

## ✨ Tính Năng

### 1. 👥 Quản Lý Bệnh Nhân

- ✓ Tạo và quản lý hồ sơ bệnh nhân
- ✓ Lưu trữ thông tin cá nhân, y tế, bảo hiểm
- ✓ Theo dõi dị ứng, nhóm máu, liên hệ khẩn cấp
- ✓ Tìm kiếm và lọc bệnh nhân nhanh chóng
- ✓ Xuất dữ liệu bệnh nhân

### 2. 📅 Quản Lý Lịch Hẹn

- ✓ Đặt lịch hẹn trực tuyến
- ✓ Xem tính sẵn có của bác sĩ theo ngày/giờ
- ✓ Quản lý danh sách chờ
- ✓ Nhắc nhở tự động qua email/SMS
- ✓ Hủy hoặc dịch chuyển lịch hẹn
- ✓ Lịch hẹn với ràng buộc phòng/thiết bị

### 3. 📑 Hồ Sơ Y Tế Điện Tử

- ✓ Ghi chép kết quả khám bệnh
- ✓ Lưu chỉ số sinh tồn (huyết áp, nhịp tim, v.v.)
- ✓ Theo dõi chẩn đoán và kế hoạch điều trị
- ✓ Đơn thuốc kỹ thuật số
- ✓ Kết quả xét nghiệm và hình ảnh y tế
- ✓ Quản lý từ lịch sử y tế

### 4. 💊 Quản Lý Thuốc & Khuôn Khổ Y Tế

- ✓ Danh mục thuốc với liều lượng, tác dụng phụ
- ✓ Theo dõi tương tác thuốc
- ✓ Quản lý kho thuốc và thiết bị y tế
- ✓ Cảnh báo hết hạn sử dụng
- ✓ Tự động đặt hàng khi hết tồn kho
- ✓ Bảo tồn kỹ thuật và bảo dưỡng thiết bị

### 5. 💰 Quản Lý Hóa Đơn & Thanh Toán

- ✓ Tạo hóa đơn tự động sau khám
- ✓ Quản lý thanh toán theo đơn
- ✓ Hỗ trợ nhiều phương thức thanh toán
- ✓ Theo dõi nợ bệnh nhân
- ✓ Gợi nhớ thanh toán tự động
- ✓ Bảng điều khiển doanh thu thời gian thực

### 6. 📊 Báo Cáo & Phân Tích

- ✓ Báo cáo thống kê lịch hẹn
- ✓ Báo cáo doanh thu theo khoảng thời gian
- ✓ Hiệu suất bác sĩ (số bệnh nhân, đánh giá)
- ✓ Sử dụng thuốc và thiết bị
- ✓ Biểu đồ và trực quan hóa dữ liệu
- ✓ Xuất báo cáo PDF/Excel

### 7. 🔐 Quản Lý Người Dùng & Quyền

- ✓ Quản lý người dùng có vai trò
- ✓ Vai trò: Admin, Bác sĩ, Y tá, Lễ tân, Bệnh nhân
- ✓ Kiểm soát truy cập theo vai trò (RBAC)
- ✓ Xác thực 2 yếu tố (tùy chọn)
- ✓ Quản lý phiên và timeout
- ✓ Nhật ký kiểm tra hoạt động người dùng

### 8. ⚙️ Quản Lý Hệ Thống

- ✓ Cấu hình cài đặt hệ thống
- ✓ Quản lý phòng ban
- ✓ Quản lý cơ sở vật chất
- ✓ Sao lưu và khôi phục dữ liệu
- ✓ Xem nhật ký hệ thống
- ✓ Cảnh báo sự cố

---

## 🛠 Công Nghệ

### Frontend

- **React 18.x** - Framework UI
- **React Router 6.x** - Định tuyến phía client
- **Redux Toolkit** - Quản lý trạng thái toàn cục
- **Axios** - HTTP client
- **Material-UI 5.x** - Thư viện thành phần UI
- **Tailwind CSS 3.x** - CSS framework
- **React Big Calendar** - Lịch sự kiện
- **Recharts** - Biểu đồ & trực quan

### Backend

- **Node.js 18.x LTS** - Runtime JavaScript
- **Express 4.x** - Web framework
- **PostgreSQL 13+** - Cơ sở dữ liệu chính
- **Redis 7.x** - Cache & session
- **Sequelize** - ORM
- **JWT** - Xác thực
- **bcryptjs** - Mã hóa mật khẩu
- **Multer** - Tải lên tệp
- **Joi** - Xác thực dữ liệu
- **Winston** - Ghi nhật ký

### DevOps & Deployment

- **Docker & Docker Compose** - Containerization
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Git & GitHub** - Version control
- **CI/CD Pipeline** - Kabar tự động

### Testing

- **Jest** - Unit testing
- **Supertest** - API testing
- **Cypress** - E2E testing
- **SonarQube** - Code quality

---

## 📚 Các Tài Liệu

Dự án bao gồm các tài liệu thiết kế toàn diện:

### 1. **[SYSTEM_DESIGN_ANALYSIS.md](./SYSTEM_DESIGN_ANALYSIS.md)**

- Phân tích thiết kế hệ thống chi tiết
- Kiến trúc 3 tầng & microservices
- Thiết kế cơ sở dữ liệu đầy đủ (ER diagrams)
- Danh sách API RESTful
- Cấu trúc Frontend (React)
- Cấu trúc Backend (Node.js)
- Bảo mật & kiểm soát truy cập
- Khả năng mở rộng & hiệu suất
- Chiến lược kiểm tra
- Monitoring & logging
- Kiến trúc triển khai
- Kế hoạch khôi phục thảm họa
- Lộ trình phát triển
- Stack công nghệ tóm tắt
- Đánh giá rủi ro

### 2. **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)**

- Kiến trúc hệ thống toàn bộ
- Sơ đồ lưu lượng dữ liệu
- Ma trận quyền người dùng
- Sơ đồ quan hệ cơ sở dữ liệu
- Kiến trúc triển khai
- Đường ống CI/CD
- Kiến trúc bảo mật

### 3. **[SETUP_AND_DEVELOPMENT_GUIDE.md](./SETUP_AND_DEVELOPMENT_GUIDE.md)**

- Hướng dẫn cài đặt dự án
- Yêu cầu hệ thống
- Thiết lập backend (Node.js)
- Thiết lập frontend (React)
- Thiết lập cơ sở dữ liệu
- Chạy project cục bộ
- Sử dụng Docker Compose
- Quy trình làm việc phát triển
- Hướng dẫn gỡ lỗi
- Tối ưu hóa hiệu suất
- Khắc phục sự cố phổ biến

### 4. **[API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)**

- Tổng quan API đầy đủ
- Định dạng yêu cầu/phản hồi
- Xác thực & cấp phép
- Endpoints bệnh nhân
- Endpoints lịch hẹn
- Endpoints hồ sơ y tế
- Endpoints thuốc
- Endpoints hóa đơn
- Endpoints báo cáo
- Endpoints admin
- Mã lỗi & xử lý

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Tiên Quyết

```bash
# Phiên bản tối thiểu
Node.js: v18.x
npm: v9.x
PostgreSQL: v13
Redis: v7.x
Git: v2.30
RAM: 8GB
Storage: 50GB
```

### 1. Clone Repository

```bash
git clone https://github.com/your-org/hospital-management-system.git
cd hospital-management-system
```

### 2. Cài Đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Cập nhật .env với thông tin cơ sở dữ liệu của bạn
# Chạy migration
npm run db:migrate

# Nhập dữ liệu mẫu (tùy chọn)
npm run db:seed
```

### 3. Cài Đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
```

### 4. Cài Đặt PostgreSQL & Redis

**PostgreSQL:**

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Linux
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Tải từ https://www.postgresql.org/download/windows/
```

**Redis:**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Linux
sudo apt install redis-server
sudo systemctl start redis-server

# Windows - Dùng Windows Subsystem for Linux hoặc Docker
```

---

## 🏃 Chạy Project

### Chế Độ Development (Không Dùng Docker)

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
# Chạy trên http://localhost:3001
```

**Terminal 2 - Frontend Server:**

```bash
cd frontend
npm start
# Chạy trên http://localhost:3000
```

**Terminal 3 - PostgreSQL (tuỳ chọn):**

```bash
psql -U hospital_user -d hospital_db -h localhost
```

### Sử Dụng Docker Compose

```bash
cd docker
docker-compose up -d

# Dừng dịch vụ
docker-compose down

# Xem logs
docker-compose logs -f
```

---

## 📁 Cấu Trúc Project

```
hospital-management-system/
├── frontend/                          # React SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── redux/
│   │   ├── utils/
│   │   └── css/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── backend/                           # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── utils/
│   ├── migrations/
│   ├── seeds/
│   ├── tests/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── database/
│   ├── schemas/
│   ├── migrations/
│   └── seeds/
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/
│
├── SYSTEM_DESIGN_ANALYSIS.md          👈 Phân tích thiết kế
├── ARCHITECTURE_DIAGRAMS.md           👈 Sơ đồ kiến trúc
├── SETUP_AND_DEVELOPMENT_GUIDE.md     👈 Hướng dẫn cài đặt
├── API_SPECIFICATIONS.md              👈 Đặc tả API
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

---

## 🧪 Testing

### Unit Tests

```bash
cd backend
npm test

cd ../frontend
npm test
```

### Integration Tests

```bash
cd backend
npm run test:integration
```

### E2E Tests

```bash
cd frontend
npm run e2e
```

### Coverage Report

```bash
npm run test:coverage
```

---

## 📋 Workflow Phát Triển

### 1. Tạo Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Commit Thường Xuyên

```bash
git add .
git commit -m "feat: description of your changes"
```

### 3. Push & Tạo Pull Request

```bash
git push origin feature/your-feature-name
```

### 4. Code Review

- Yêu cầu 2 người review
- Chạy đầy đủ kiểm tra CI/CD
- Thảo luận các thay đổi

### 5. Merge vào Develop

```bash
git checkout develop
git pull origin feature/your-feature-name
```

---

## 🔐 Bảo Mật

### Các Thực Hành Bảo Mật

- ✅ JWT-based authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ Password hashing với bcryptjs
- ✅ Encryption for sensitive data (AES-256)
- ✅ HTTPS/TLS for all communications
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React escaping)
- ✅ CSRF tokens
- ✅ Rate limiting & DDoS protection
- ✅ Audit logging for all operations
- ✅ Regular security updates

Xem [SYSTEM_DESIGN_ANALYSIS.md](./SYSTEM_DESIGN_ANALYSIS.md) untuk chi tiết bảo mật.

---

## 📊 Monitoring & Logging

### Logging

- Winston logger configuration
- Daily log rotation
- JSON format with timestamps
- Different log levels

### Monitoring

- Application performance monitoring
- Real-time metrics with Prometheus
- Visualization with Grafana
- Error tracking with Sentry
- Uptime monitoring

---

## 🚀 Deployment

### Staging

```bash
git push origin develop
# Auto-deploy to staging
```

### Production

```bash
git push origin production
# Auto-deploy to production
```

Xem [SETUP_AND_DEVELOPMENT_GUIDE.md](./SETUP_AND_DEVELOPMENT_GUIDE.md) cho hướng dẫn deployment chi tiết.

---

## 📞 Hỗ Trợ & Liên Hệ

- **Email**: support@hospital-system.com
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/hospital-management-system/issues)
- **Documentation**: Xem thư mục `docs/`
- **Wiki**: [Project Wiki](https://github.com/your-org/hospital-management-system/wiki)

---

## 👥 Bản Phân Công

> **Nhóm:** 3 thành viên &nbsp;|&nbsp; **Môn học:** Lập Trình Web &nbsp;|&nbsp; **Trường:** PITT

### Thông Tin Thành Viên

| STT | Họ và Tên    | MSSV     | Vai Trò                          |
| :-: | ------------ | -------- | -------------------------------- |
|  1  | Thành Viên A | xxxxxxxx | Nhóm trưởng — Backend & Database |
|  2  | Thành Viên B | xxxxxxxx | Backend & Core Features          |
|  3  | Thành Viên C | xxxxxxxx | Frontend & Tài chính             |

---

### Bảng Phân Công Chi Tiết

#### Thành Viên A — Cơ sở hạ tầng & Xác thực & Quản trị

| #   | Nhiệm vụ                         | Mô tả                                                               | Layer    | Trạng thái    |
| --- | -------------------------------- | ------------------------------------------------------------------- | -------- | ------------- |
| 1   | Thiết kế CSDL                    | Thiết kế 13 bảng, quan hệ FK/PK, indexes                            | Database | ✅ Hoàn thành |
| 2   | Viết schema migration            | File `001_init_schema.sql`                                          | Database | ✅ Hoàn thành |
| 3   | Cấu hình Backend server          | Express app, middleware (CORS, Helmet, rate limit, logger)          | Backend  | ✅ Hoàn thành |
| 4   | Kết nối PostgreSQL & Redis       | `config/database.js`, connection pool                               | Backend  | ✅ Hoàn thành |
| 5   | Module Xác thực — Backend        | API: register, login, refresh token, logout, profile (JWT + bcrypt) | Backend  | ✅ Hoàn thành |
| 6   | Module Xác thực — Frontend       | Trang Login, Register, Redux authSlice, Axios interceptor           | Frontend | ✅ Hoàn thành |
| 7   | Module Quản trị Admin — Backend  | API: danh sách users, đổi role, khoá tài khoản, cài đặt hệ thống    | Backend  | ✅ Hoàn thành |
| 8   | Module Quản trị Admin — Frontend | Trang AdminPage (tab Users + System Settings)                       | Frontend | ✅ Hoàn thành |
| 9   | Viết tài liệu hệ thống           | SYSTEM_DESIGN_ANALYSIS.md, ARCHITECTURE_DIAGRAMS.md                 | Docs     | ✅ Hoàn thành |
| 10  | Viết API Specifications          | API_SPECIFICATIONS.md (100+ endpoints)                              | Docs     | ✅ Hoàn thành |

---

#### Thành Viên B — Quản lý Bệnh nhân & Lịch hẹn & Hồ sơ y tế

| #   | Nhiệm vụ                        | Mô tả                                                                      | Layer    | Trạng thái    |
| --- | ------------------------------- | -------------------------------------------------------------------------- | -------- | ------------- |
| 1   | Module Bệnh nhân — Backend      | API CRUD bệnh nhân, tìm kiếm, lọc, phân trang                              | Backend  | ✅ Hoàn thành |
| 2   | Module Bệnh nhân — Frontend     | Trang PatientsPage (bảng, thêm/sửa/xoá, tìm kiếm)                          | Frontend | ✅ Hoàn thành |
| 3   | Sub-routes Bệnh nhân            | API: lấy lịch hẹn / hồ sơ y tế / hóa đơn theo patient ID                   | Backend  | ✅ Hoàn thành |
| 4   | Module Lịch hẹn — Backend       | API: đặt lịch, kiểm tra availability, cập nhật, hủy, đổi status            | Backend  | ✅ Hoàn thành |
| 5   | Module Lịch hẹn — Frontend      | Trang AppointmentsPage (bảng, đặt lịch mới, cập nhật trạng thái)           | Frontend | ✅ Hoàn thành |
| 6   | Module Hồ sơ y tế — Backend     | API CRUD hồ sơ khám, chỉ số sinh tồn, chẩn đoán, điều trị                  | Backend  | ✅ Hoàn thành |
| 7   | Module Hồ sơ y tế — Frontend    | Trang MedicalRecordsPage (bảng, tạo/sửa/xem chi tiết)                      | Frontend | ✅ Hoàn thành |
| 8   | Module Bác sĩ — Backend         | API CRUD bác sĩ, tìm kiếm theo chuyên khoa, phân trang                     | Backend  | ✅ Hoàn thành |
| 9   | Module Bác sĩ — Frontend        | Trang DoctorsPage                                                          | Frontend | ✅ Hoàn thành |
| 10  | Cổng bệnh nhân (Patient Portal) | Trang PatientPortalPage: profile, lịch hẹn, hồ sơ y tế, đơn thuốc, hóa đơn | Frontend | ✅ Hoàn thành |

---

#### Thành Viên C — Frontend & Thuốc & Tài chính & Báo cáo

| #   | Nhiệm vụ                     | Mô tả                                                                      | Layer    | Trạng thái    |
| --- | ---------------------------- | -------------------------------------------------------------------------- | -------- | ------------- |
| 1   | Cơ sở hạ tầng Frontend       | React Router, Redux store, Layout, Sidebar, Header, RoleRoute, theme MUI   | Frontend | ✅ Hoàn thành |
| 2   | Hệ thống phân quyền Frontend | `usePermissions.js` — RBAC matrix cho 5 roles                              | Frontend | ✅ Hoàn thành |
| 3   | Module Thuốc — Backend       | API CRUD thuốc, tìm kiếm, điều chỉnh tồn kho                               | Backend  | ✅ Hoàn thành |
| 4   | Module Thuốc — Frontend      | Trang MedicationsPage                                                      | Frontend | ✅ Hoàn thành |
| 5   | Module Đơn thuốc — Backend   | API CRUD đơn thuốc, cấp phát, lấy theo bệnh nhân                           | Backend  | ✅ Hoàn thành |
| 6   | Module Đơn thuốc — Frontend  | Trang PrescriptionsPage                                                    | Frontend | ✅ Hoàn thành |
| 7   | Module Hóa đơn — Backend     | API tạo hóa đơn, ghi nhận thanh toán, hủy, lấy theo bệnh nhân              | Backend  | ✅ Hoàn thành |
| 8   | Module Hóa đơn — Frontend    | Trang InvoicesPage (bảng, tạo hóa đơn nhiều mục, thanh toán)               | Frontend | ✅ Hoàn thành |
| 9   | Module Báo cáo — Backend     | API: dashboard stats, thống kê lịch hẹn, doanh thu                         | Backend  | ✅ Hoàn thành |
| 10  | Module Báo cáo — Frontend    | Trang ReportsPage                                                          | Frontend | ✅ Hoàn thành |
| 11  | Module Phòng ban — Backend   | API CRUD phòng ban                                                         | Backend  | ✅ Hoàn thành |
| 12  | Module Phòng ban — Frontend  | Trang DepartmentsPage                                                      | Frontend | ✅ Hoàn thành |
| 13  | Dashboard — Frontend         | Trang DashboardPage (thống kê tổng quan, lịch hẹn gần đây, cảnh báo thuốc) | Frontend | ✅ Hoàn thành |

---

### Tổng Hợp Số Lượng

|  Thành Viên  |  Backend API  |  Frontend Pages  | Database |    Docs    |      Tổng       |
| :----------: | :-----------: | :--------------: | :------: | :--------: | :-------------: |
| Thành Viên A | 10 endpoints  |     2 trang      | 13 bảng  | 2 tài liệu | **10 nhiệm vụ** |
| Thành Viên B | 20+ endpoints | 5 trang + Portal |    —     |     —      | **10 nhiệm vụ** |
| Thành Viên C | 20+ endpoints | 6 trang + infra  |    —     |     —      | **13 nhiệm vụ** |

---

### Lịch Trình Phát Triển

| Giai Đoạn              | Tuần | Nội Dung                                            | Người Phụ Trách  |
| ---------------------- | :--: | --------------------------------------------------- | ---------------- |
| Phase 1 — Khởi tạo     | 1–2  | Thiết kế CSDL, cấu hình server, auth                | Thành Viên A     |
| Phase 2 — Core Backend | 3–5  | APIs: bệnh nhân, lịch hẹn, hồ sơ y tế, bác sĩ       | Thành Viên B     |
| Phase 2 — Core Backend | 3–5  | APIs: thuốc, đơn thuốc, hóa đơn, phòng ban, báo cáo | Thành Viên C     |
| Phase 3 — Frontend     | 6–8  | Tất cả trang, Redux, routing, phân quyền            | Thành Viên A + C |
| Phase 3 — Frontend     | 6–8  | Patient portal, trang bệnh nhân & lịch hẹn & hồ sơ  | Thành Viên B     |
| Phase 4 — Hoàn thiện   | 9–10 | Bug fix, kiểm thử, tối ưu, viết tài liệu            | Cả nhóm          |

---

## 👥 Contributors

| Họ và Tên    | MSSV     | GitHub    |
| ------------ | -------- | --------- |
| Thành Viên A | xxxxxxxx | @member-a |
| Thành Viên B | xxxxxxxx | @member-b |
| Thành Viên C | xxxxxxxx | @member-c |

Xem [CONTRIBUTING.md](./CONTRIBUTING.md) để tìm hiểu cách đóng góp.

---

## 📄 License

Dự án này được cấp phép dưới MIT License - xem [LICENSE](./LICENSE) file để chi tiết.

---

## 🙏 Cảm Ơn

Cảm ơn tất cả những người đã đóng góp cho dự án này!

---

## 📈 Roadmap

### Phase 1 ✅ (Hoàn thành)

- [x] Thiết kế hệ thống
- [x] Thiết kế cơ sở dữ liệu
- [x] Cấu trúc dự án
- [x] API thiết lập cơ bản

### Phase 2 🔄 (Tiến hành)

- [ ] Các tính năng chính
- [ ] Testing toàn diện
- [ ] Tối ưu hóa hiệu suất

### Phase 3 📋 (Lên kế hoạch)

- [ ] Triển khai staging
- [ ] UAT (User Acceptance Testing)
- [ ] Triển khai sản xuất

---

**Cập nhật lần cuối: 26 tháng 4 năm 2026**

---

## 🎓 Tài Nguyên Học Tập

### Tài Liệu Kỹ Thuật

- [React Documentation](https://react.dev)
- [Node.js Guide](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Express.js Guide](https://expressjs.com)
- [Redis Documentation](https://redis.io/docs)

### Khóa Học Liên Quan

- [Full Stack Web Development](https://www.example.com)
- [PostgreSQL Fundamentals](https://www.example.com)
- [React Patterns](https://www.example.com)

---

**Hãy bắt đầu phát triển ngay bây giờ! 🚀**
admin@hospital.vn
dr.nguyenvanan@hospital.vn
dr.tranthib@hospital.vn
dr.levancuong@hospital.vn
dr.phamthidung@hospital.vn
dr.hoangvane@hospital.vn
nurse.lethihoa@hospital.vn
nurse.nguyenvangiang@hospital.vn
nurse.phamthingoc@hospital.vn
recep.tranthilan@hospital.vn
recep.levanminh@hospital.vn
bn.nguyenvananh@gmail.com
bn.tranthiminh@gmail.com
bn.levankhanh@gmail.com
bn.phamthidieu@gmail.com
bn.hoangvanphuc@gmail.com

mk: Hospital@123
