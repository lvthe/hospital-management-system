# Project Setup & Development Guide

## Getting Started

### Requirements

**System Requirements:**

- Node.js: v18.x LTS or higher
- npm: v9.x or higher
- PostgreSQL: v13 or higher
- Redis: v7.x or higher
- Git: v2.30 or higher
- RAM: 8GB minimum
- Storage: 50GB free space

**Optional Tools:**

- Docker & Docker Compose
- Postman (API testing)
- DBeaver or pgAdmin (Database GUI)
- VSCode Extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Thunder Client or REST Client
  - PostgreSQL extension

---

## 1. PROJECT INITIALIZATION

### 1.1 Repository Setup

```bash
# Clone repository
git clone https://github.com/your-org/hospital-management-system.git
cd hospital-management-system

# Create main branches
git checkout -b develop
git checkout -b production

# Create feature branch template
# git checkout -b feature/feature-name
# git checkout -b bugfix/bug-name
# git checkout -b hotfix/hotfix-name
```

### 1.2 Folder Structure

```bash
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
│   │   ├── css/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── README.md
│
├── backend/                           # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   ├── migrations/
│   ├── seeds/
│   ├── tests/
│   ├── package.json
│   ├── .env.example
│   ├── .eslintrc.json
│   └── README.md
│
├── database/
│   ├── schemas/
│   │   ├── init.sql
│   │   └── tables.sql
│   ├── migrations/
│   │   ├── 001_init_schema.sql
│   │   └── 002_add_indexes.sql
│   ├── seeds/
│   │   ├── users.sql
│   │   └── sample_data.sql
│   └── README.md
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── docs/
│   ├── API.md                        # API documentation
│   ├── DATABASE.md                   # Database schema docs
│   ├── ARCHITECTURE.md               # Architecture docs
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── USER_MANUAL.md                # User guide
│   └── DEVELOPMENT.md                # Dev setup guide
│
├── .github/
│   └── workflows/
│       ├── test.yml                  # CI pipeline
│       └── deploy.yml                # CD pipeline
│
├── .gitignore
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 2. BACKEND SETUP

### 2.1 Initialize Backend Project

```bash
cd backend

# Initialize Node project
npm init -y

# Install core dependencies
npm install express pg redis dotenv jsonwebtoken bcryptjs multer cors helmet

# Install development dependencies
npm install --save-dev nodemon jest supertest eslint prettier

# Create necessary folders
mkdir -p src/{config,controllers,routes,services,models,middleware,utils}
mkdir -p migrations seeds tests/{unit,integration}
mkdir logs uploads
```

### 2.2 Create .env File

**File: backend/.env**

```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email Configuration (SendGrid or SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
MAIL_FROM=noreply@hospital-system.com

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Encryption
ENCRYPT_KEY=your_32_byte_encryption_key_must_be_exactly_32_bytes

# Third-party Services
STRIPE_SECRET_KEY=pk_test_xxxxx
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
```

### 2.3 Create package.json Scripts

**File: backend/package.json**

```json
{
  "name": "hospital-management-backend",
  "version": "1.0.0",
  "description": "Hospital Management System API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "db:migrate": "node -e \"require('./src/config/database').runMigrations()\"",
    "db:seed": "node seeds/seedAll.js",
    "db:reset": "npm run db:migrate && npm run db:seed"
  },
  "keywords": ["hospital", "management", "system"],
  "author": "Your Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.8.0",
    "redis": "^4.6.0",
    "sequelize": "^6.35.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "joi": "^17.9.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "winston": "^3.8.0",
    "nodemailer": "^6.9.0",
    "axios": "^1.3.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "eslint": "^8.40.0",
    "prettier": "^2.8.8"
  }
}
```

### 2.4 Create Database Connection (src/config/database.js)

```javascript
const { Pool } = require("pg");
const Redis = require("redis");
require("dotenv").config();

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  max: parseInt(process.env.DB_POOL_MAX),
  min: parseInt(process.env.DB_POOL_MIN),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis Connection
const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

module.exports = {
  pool,
  redisClient,
  query: (text, params) => pool.query(text, params),
};
```

### 2.5 Create Entry Point (src/server.js)

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: process.env.CORS_CREDENTIALS === "true",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/patients", require("./routes/patientRoutes"));
// ... other routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 3. FRONTEND SETUP

### 3.1 Create React Project

```bash
cd frontend

# Using Create React App
npx create-react-app .

# Or using Vite (faster alternative)
npm create vite@latest . -- --template react
```

### 3.2 Install Dependencies

```bash
npm install react-router-dom axios @reduxjs/toolkit react-redux
npm install @mui/material @emotion/react @emotion/styled
npm install tailwindcss postcss autoprefixer
npm install date-fns react-big-calendar recharts
npm install react-hot-toast js-cookie

# Development dependencies
npm install --save-dev eslint prettier eslint-plugin-react
```

### 3.3 Create .env File

**File: frontend/.env**

```env
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0
```

### 3.4 Project Structure

```
frontend/src/
├── components/
│   ├── Common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── Patient/
│   │   ├── PatientList.jsx
│   │   └── PatientForm.jsx
│   └── Appointment/
│       ├── AppointmentList.jsx
│       └── AppointmentForm.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   └── NotFound.jsx
│
├── services/
│   ├── api.js                    # Axios instance
│   ├── authService.js
│   ├── patientService.js
│   └── appointmentService.js
│
├── hooks/
│   ├── useAuth.js
│   ├── usePatient.js
│   └── useLocalStorage.js
│
├── redux/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── patientSlice.js
│   │   └── appointmentSlice.js
│   └── store.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── apiErrorHandler.js
│
├── css/
│   ├── App.css
│   └── index.css
│
├── App.jsx
└── index.js
```

---

## 4. DATABASE SETUP

### 4.1 PostgreSQL Installation

**Windows (PowerShell):**

```powershell
# Using Chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 4.2 Create Database & User

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE hospital_db;

-- Create user
CREATE USER hospital_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
ALTER ROLE hospital_user SET client_encoding TO 'utf8';
ALTER ROLE hospital_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE hospital_user SET default_transaction_deferrable TO on;
ALTER ROLE hospital_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE hospital_db TO hospital_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO hospital_user;
```

### 4.3 Run Initial Schema

```bash
# Connect to database
psql -U hospital_user -d hospital_db -h localhost

# Import schema
\i database/schemas/init.sql
\i database/migrations/001_init_schema.sql
\i database/migrations/002_add_indexes.sql

# Verify tables
\dt
```

### 4.4 Install Redis

**Windows:**

```powershell
# Using Chocolate
choco install redis
redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu):**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

---

## 5. RUNNING THE PROJECT

### 5.1 Development Mode (Without Docker)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Output: Server running on port 3001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
# Output: http://localhost:3000
```

**Terminal 3 - Optional: PostgreSQL CLI**

```bash
psql -U hospital_user -d hospital_db -h localhost
```

### 5.2 Using Docker Compose

**File: docker/docker-compose.yml**

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:15-alpine
    container_name: hospital_postgres
    environment:
      POSTGRES_DB: hospital_db
      POSTGRES_USER: hospital_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schemas:/docker-entrypoint-initdb.d
    networks:
      - hospital_network

  redis:
    image: redis:7-alpine
    container_name: hospital_redis
    ports:
      - "6379:6379"
    networks:
      - hospital_network

  backend:
    build:
      context: ../
      dockerfile: ./docker/Dockerfile.backend
    container_name: hospital_backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    volumes:
      - ../backend:/app
    networks:
      - hospital_network

  frontend:
    build:
      context: ../
      dockerfile: ./docker/Dockerfile.frontend
    container_name: hospital_frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - hospital_network

volumes:
  postgres_data:

networks:
  hospital_network:
    driver: bridge
```

**Run with Docker:**

```bash
cd docker
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 6. COMMON DEVELOPMENT WORKFLOWS

### 6.1 Adding a New Feature

```bash
# Create feature branch
git checkout -b feature/patient-search

# Make changes
# ... edit files ...

# Run tests
npm test

# Lint code
npm run lint:fix

# Commit changes
git add .
git commit -m "feat: add patient search functionality"

# Push to remote
git push origin feature/patient-search

# Create Pull Request on GitHub
# ... review & merge ...

# Update local develop
git checkout develop
git pull origin develop
```

### 6.2 Database Migration

```bash
# Create new migration file
# File name: database/migrations/003_add_new_table.sql

# Run migration
psql -U hospital_user -d hospital_db -f database/migrations/003_add_new_table.sql

# Or use Node script in backend
npm run db:migrate
```

### 6.3 Adding API Endpoint

```bash
# 1. Create controller method (backend/src/controllers/patientController.js)
# 2. Create route (backend/src/routes/patientRoutes.js)
# 3. Create service function (backend/src/services/patientService.js)
# 4. Test with Postman or Thunder Client
# 5. Create frontend hook (frontend/src/hooks/usePatient.js)
# 6. Create React component (frontend/src/components/Patient/PatientList.jsx)
# 7. Write unit tests
# 8. Commit and push
```

---

## 7. DEBUGGING

### 7.1 Backend Debugging

```bash
# Run with Node debugger
node --inspect src/server.js

# Or use VS Code debugger
# Create .vscode/launch.json
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

### 7.2 Frontend Debugging

- Use Chrome DevTools (F12)
- React Developer Tools extension
- Redux DevTools for state debugging

###7.3 Database Debugging

```bash
# Using psql interactive terminal
psql -U hospital_user -d hospital_db

# View database
SELECT version();

# List tables
\dt

# View table structure
\d patients

# Run queries
SELECT * FROM patients LIMIT 10;

# Check indexes
\di

# View execution plan
EXPLAIN SELECT * FROM patients WHERE id = 'xxx';
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Backend Optimization

```javascript
// 1. Connection pooling (already configured)
// 2. Query optimization
const query = `
  SELECT p.id, p.full_name, a.appointment_date 
  FROM patients p
  JOIN appointments a ON p.id = a.patient_id
  WHERE p.id = $1
`;

// 3. Caching
const cacheKey = `patient:${id}`;
const cached = await redisClient.get(cacheKey);
if (cached) return JSON.parse(cached);

// 4. Pagination
const limit = 10;
const offset = (page - 1) * limit;
const query = `SELECT * FROM patients LIMIT $1 OFFSET $2`;
```

### 8.2 Frontend Optimization

```jsx
// 1. Code splitting
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

// 2. Memoization
const PatientList = React.memo(({ patients }) => {
  return patients.map((p) => <PatientCard key={p.id} patient={p} />);
});

// 3. UseCallback for event handlers
const handleFilter = useCallback((filters) => {
  // ... filter logic
}, []);

// 4. Image optimization
<img src={image} alt="desc" loading="lazy" />;
```

---

## 9. TROUBLESHOOTING

### Common Issues

| Issue                    | Solution                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| Port already in use      | `lsof -i :3001` then `kill -9 <PID>`                               |
| PostgreSQL won't connect | Check PG is running, verify credentials in .env                    |
| Redis connection error   | Ensure Redis server is started                                     |
| npm install fails        | Delete node_modules and package-lock.json, run `npm install` again |
| CORS errors              | Check `CORS_ORIGIN` in backend .env                                |
| JWT token expired        | Refresh token mechanism should handle this                         |
| File upload fails        | Check `UPLOAD_DIR` permissions, `MAX_FILE_SIZE` setting            |

---

## 10. PRODUCTION DEPLOYMENT CHECKLIST

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring & alerting
- [ ] Run security audit
- [ ] Load test the system
- [ ] Document deployment process
- [ ] Create runbooks for common issues
- [ ] Train operations team
- [ ] Have rollback plan ready

---

_Last Updated: 2026-04-26_
