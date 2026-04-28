# Quick Start Guide

## Hướng Dẫn Bắt Đầu Nhanh - Hospital Management System

Hướng dẫn này giúp bạn chạy dự án trong 10 phút.

---

## ⏱️ 5 Bước Cài Đặt Nhanh

### Bước 1: Clone & Chuẩn Bị (2 phút)

```bash
# Clone repository
git clone https://github.com/your-org/hospital-management-system.git
cd hospital-management-system

# Kiểm tra Node.js & npm
node --version  # Phải là v18.x hoặc cao hơn
npm --version   # Phải là v9.x hoặc cao hơn
```

### Bước 2: Khởi Động Database (2 phút)

**PostgreSQL & Redis phải chạy trước!**

```bash
# Tạo database & user
psql -U postgres

# Trong PostgreSQL interactive terminal:
CREATE DATABASE hospital_db;
CREATE USER hospital_user WITH PASSWORD 'password123';
ALTER ROLE hospital_user SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE hospital_db TO hospital_user;
\q
```

### Bước 3: Cài Backend (2 phút)

```bash
cd backend

# Cài dependencies
npm install

# Tạo .env file
echo "NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=hospital_user
DB_PASSWORD=password123
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_jwt_key_here" > .env

# Chạy migration
npm run db:migrate

# Khởi động server
npm run dev
# ✅ Backend chạy trên http://localhost:3001
```

### Bước 4: Cài Frontend (2 phút)

```bash
# Mở tab terminal mới
cd frontend

# Cài dependencies
npm install

# Tạo .env file
echo "REACT_APP_API_URL=http://localhost:3001/api/v1" > .env

# Khởi động server
npm start
# ✅ Frontend chạy trên http://localhost:3000
```

### Bước 5: Đăng Nhập & Khám Phá (2 phút)

```bash
# Mở trình duyệt
# Truy cập: http://localhost:3000

# Tài khoản demo:
Email: admin@hospital.com
Password: Admin@123456

# Hoặc tạo tài khoản mới
```

---

## 🐳 Alternative: Dùng Docker (Nhanh Hơn!)

```bash
# Đảm bảo Docker & Docker Compose được cài đặt
docker --version
docker-compose --version

# Chạy toàn bộ stack
cd docker
docker-compose up -d

# Chờ ~2 phút cho tất cả services khởi động
docker-compose ps

# Truy cập ứng dụng
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001

# Dừng services
docker-compose down
```

---

## ✅ Kiểm Tra Cài Đặt

### Frontend Health Check

```bash
curl http://localhost:3000
# Phải nhận về HTML
```

### Backend Health Check

```bash
curl http://localhost:3001/api/v1/health
# Phải nhận về: { "status": "ok" }
```

### Database Connection

```bash
psql -U hospital_user -d hospital_db -c "SELECT 1;"
# Phải nhận về: 1
```

### Redis Connection

```bash
redis-cli ping
# Phải nhận về: PONG
```

---

## 🔧 Lệnh Useful

### Backend

```bash
cd backend

# Khởi động chế độ dev (với auto-reload)
npm run dev

# Khởi động chế độ production
npm start

# Chạy tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Database migration
npm run db:migrate

# Seed sample data
npm run db:seed

# Reset database
npm run db:reset
```

### Frontend

```bash
cd frontend

# Khởi động dev server
npm start

# Build cho production
npm run build

# Chạy tests
npm test

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting Nhanh

### ❌ "Port 3001 already in use"

```bash
# Tìm process sử dụng port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### ❌ "Cannot connect to PostgreSQL"

1. Kiểm tra PostgreSQL đã chạy: `brew services list` (macOS) hoặc `sudo systemctl status postgresql` (Linux)
2. Kiểm tra credentials trong `.env`
3. Kiểm tra database tồn tại: `psql -U postgres -l`

### ❌ "Cannot connect to Redis"

1. Kiểm tra Redis chạy: `redis-cli ping`
2. Nếu không chạy: `brew services start redis` (macOS) hoặc `sudo systemctl start redis-server` (Linux)

### ❌ "Module not found"

```bash
# Xóa node_modules & package-lock.json
rm -rf node_modules package-lock.json

# Cài lại
npm install
```

### ❌ Có lỗi khi chạy npm run dev

```bash
# Cập nhật npm
npm install -g npm@latest

# Cài lại dependencies
npm install --legacy-peer-deps
```

---

## 📚 Các File Tài Liệu

Sau khi cài xong, đọc các tài liệu này:

1. **[README.md](./README.md)** - Tổng quan dự án
2. **[SYSTEM_DESIGN_ANALYSIS.md](./SYSTEM_DESIGN_ANALYSIS.md)** - Phân tích thiết kế chi tiết ⭐
3. **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** - Sơ đồ kiến trúc
4. **[API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)** - Endpoint API
5. **[SETUP_AND_DEVELOPMENT_GUIDE.md](./SETUP_AND_DEVELOPMENT_GUIDE.md)** - Hướng dẫn phát triển

---

## 🎯 Các Bước Tiếp Theo

### Để hiểu rõ hơn hệ thống:

1. **Đọc SYSTEM_DESIGN_ANALYSIS.md**
   - Hiểu kiến trúc toàn bộ
   - Tìm hiểu thiết kế database
   - Biết thêm về API

2. **Khám phá folder structures**
   - Hiểu cách các file được tổ chức
   - Tìm components bạn sẽ làm việc

3. **Tạo API endpoint đầu tiên**
   - Backend: Tạo controller, service, route
   - Frontend: Tạo component, hook, service

4. **Viết test case**
   - Unit tests cho utilities
   - Integration tests cho API

---

## 💡 Gợi Ý

- **Dùng Postman hoặc Thunder Client** để test API
- **Dùng Chrome DevTools** để debug frontend
- **Dùng VS Code Debugger** để debug backend
- **Xem logs** để hiểu flow của ứng dụng

---

## 🆘 Cần Giúp Đỡ?

- 📖 Đọc docs trong thư mục `/docs`
- 🐛 Kiểm tra [GitHub Issues](https://github.com/your-org/hospital-management-system/issues)
- 💬 Hỏi trên team chat/Discord

---

**Chúc bạn phát triển vui vẻ! 🚀**
