/**
 * ==================================================
 * Error Handler Middleware
 * ==================================================
 * File: src/middleware/errorHandlerMiddleware.js
 * Description: Middleware xử lý lỗi toàn cục
 */

const logger = require("../config/logger");
const { AppError } = require("../utils/errorHandler");

/**
 * Middleware xử lý lỗi
 * Phải được ghi đăng ký cuối cùng trong app.use()
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  // Log chi tiết lỗi
  logger.error({
    message: err.message,
    statusCode: err.statusCode || 500,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || "anonymous",
    stack: err.stack,
  });

  // Nếu là lỗi tùy chỉnh (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.constructor.name,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Xử lý lỗi database
  if (err.code === "23505") {
    // Unique violation
    return res.status(409).json({
      success: false,
      error: "DUPLICATE_ENTRY",
      message: "Dữ liệu đã tồn tại trong hệ thống",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.code === "23503") {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      error: "INVALID_REFERENCE",
      message: "Tham chiếu không hợp lệ",
      timestamp: new Date().toISOString(),
    });
  }

  // Lỗi validation (từ Joi)
  if (err.isJoi || err.details) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "Dữ liệu đầu vào không hợp lệ",
      details: err.details || err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Lỗi không xác định - Internal Server Error
  res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Lỗi máy chủ nội bộ, vui lòng thử lại sau",
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandlerMiddleware;
