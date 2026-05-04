/**
 * ==================================================
 * Main Express Server
 * ==================================================
 * File: src/server.js
 * Description: Cấu hình Express app, middleware, routes
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const logger = require("./config/logger");
const { connectDB, closeDB } = require("./config/database");
const errorHandlerMiddleware = require("./middleware/errorHandlerMiddleware");
const loggingMiddleware = require("./middleware/loggingMiddleware");

/**
 * Khởi tạo Express app
 */
const app = express();

/**
 * ==================================================
 * MIDDLEWARE SETUP
 * ==================================================
 */

// 1. Security middleware
// Helmet: Thiết lập HTTP headers cho bảo mật
app.use(helmet());

// 2. CORS: Cho phép request từ các domain khác
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: JSON.parse(process.env.CORS_CREDENTIALS || "true"),
  }),
);

// 3. Body parser: Đọc JSON từ request body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 4. Rate limiting: Giới hạn số request từ 1 IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests
  message: "Quá nhiều request, vui lòng thử lại sau",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// 5. Logging middleware: Ghi log tất cả request
app.use(loggingMiddleware);

/**
 * ==================================================
 * ROUTES
 * ==================================================
 */

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use('/api/v1/auth',           require('./routes/authRoutes'));
app.use('/api/v1/patients',       require('./routes/patientRoutes'));
app.use('/api/v1/doctors',        require('./routes/doctorRoutes'));
app.use('/api/v1/appointments',   require('./routes/appointmentRoutes'));
app.use('/api/v1/medical-records',require('./routes/medicalRecordRoutes'));
app.use('/api/v1/medications',    require('./routes/medicationRoutes'));
app.use('/api/v1/prescriptions',  require('./routes/prescriptionRoutes'));
app.use('/api/v1/invoices',       require('./routes/invoiceRoutes'));
app.use('/api/v1/departments',    require('./routes/departmentRoutes'));
app.use('/api/v1/reports',        require('./routes/reportRoutes'));

/**
 * ==================================================
 * 404 HANDLER
 * ==================================================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.originalUrl} không tìm thấy`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * ==================================================
 * ERROR HANDLING MIDDLEWARE
 * ==================================================
 * PHẢI ĐỂ CUỐI CÙNG
 */
app.use(errorHandlerMiddleware);

/**
 * ==================================================
 * SERVER STARTUP
 * ==================================================
 */

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Kết nối database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      throw new Error("Failed to connect database");
    }

    // Khởi động server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server chạy trên port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      const dbInfo = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')
        : `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
      logger.info(`🔗 Database: ${dbInfo}`);
    });

    /**
     * Xử lý graceful shutdown
     * Đóng server khi nhận signal SIGTERM hoặc SIGINT
     */
    const gracefulShutdown = async () => {
      logger.info("Đang tắt server...");

      server.close(async () => {
        logger.info("✅ Server tắt thành công");
        await closeDB();
        process.exit(0);
      });

      // Force shutdown nếu không tắt trong 10s
      setTimeout(() => {
        logger.error("❌ Forced shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error(`❌ Lỗi khởi động server: ${error.message}`);
    process.exit(1);
  }
};

// Chỉ start server nếu file này được chạy trực tiếp (không khi import)
if (require.main === module) {
  startServer();
}

module.exports = app;
