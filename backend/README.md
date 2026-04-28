# Hospital Management System - Backend

## Mô Tả

Backend API cho hệ thống quản lý bệnh viện. Xây dựng bằng Node.js + Express + PostgreSQL.

## 🚀 Bắt Đầu

### Điều Kiện

- Node.js v18.x hoặc cao hơn
- PostgreSQL 13+
- Redis 7.x

### Cài Đặt

```bash
# Cài dependencies
npm install

# Copy .env file từ example
cp .env.example .env

# Cập nhật biến môi trường trong .env

# Chạy migrations (tạo tables)
npm run db:migrate

# (Tùy chọn) Seed sample data
npm run db:seed
```

### Chạy Server

**Development mode (với auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server sẽ chạy trên `http://localhost:3001` (hoặc port được định cấu hình)

## 📁 Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── config/          # Cấu hình (database, logger, JWT)
│   ├── controllers/     # Xử lý business logic
│   ├── routes/          # Định nghĩa routes
│   ├── services/        # Service layer (logic chính)
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── database/
│   ├── migrations/      # SQL migration files
│   └── seeds/           # Sample data
├── scripts/             # Utility scripts
├── tests/               # Test files
├── logs/                # Log files
├── uploads/             # User uploaded files
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🔑 Biến Môi Trường

Xem `.env.example` để biết tất cả biến môi trường cần thiết.

**Biến quan trọng nhất:**

- `NODE_ENV` - development / production
- `PORT` - Port server (mặc định: 3001)
- `DB_*` - PostgreSQL connection
- `REDIS_*` - Redis connection
- `JWT_SECRET` - Secret key cho JWT

## 📡 API Endpoints

Health check:

```bash
GET /api/v1/health
```

### Authentication (To be implemented)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
GET    /api/v1/auth/profile
```

Xem `API_SPECIFICATIONS.md` trong thư mục root để biết tất cả endpoints.

## 🧪 Testing

```bash
# Chạy unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🔍 Linting

```bash
# Check linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

## 📊 Database

### Chạy Migrations

```bash
npm run db:migrate
```

### Seed Sample Data

```bash
npm run db:seed
```

### Reset Database

```bash
npm run db:reset
```

### Kết Nối Direct với PostgreSQL

```bash
psql -U hospital_user -d hospital_db -h localhost
```

## 🐛 Debugging

### VS Code Debug

Tạo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/src/server.js",
      "restart": true,
      "runtimeArgs": ["--inspect"]
    }
  ]
}
```

Sau đó press F5 trong VS Code để start debugging.

### Xem Logs

```bash
tail -f logs/combined.log
tail -f logs/error.log
```

## 📝 Code Standards

- **Naming:** camelCase cho variables, PascalCase cho classes
- **Comments:** Tất cả functions phải có JSDoc comments
- **Error Handling:** Dùng custom error classes từ `utils/errorHandler.js`
- **Database Queries:** Luôn dùng parameterized queries (tránh SQL injection)
- **Validation:** Dùng Joi schemas từ `utils/validators.js`

## 🔒 Security

- Passwords được hash bằng bcryptjs
- Authentication dùng JWT tokens
- Rate limiting trên tất cả API endpoints
- CORS được cấu hình theo `.env`
- Input validation trên tất cả endpoints
- Helmet middleware cho HTTP headers security

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **redis** - Cache & sessions
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **joi** - Data validation
- **winston** - Logging
- **multer** - File uploads
- **cors** - CORS handling
- **helmet** - HTTP security headers

## 🤝 Contributing

1. Tạo feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Tạo Pull Request

## 📄 License

MIT

## 📞 Support

Xem `DOCUMENTATION_INDEX.md` trong thư mục root để tài liệu đầy đủ.

---

**Happy coding! 🚀**
