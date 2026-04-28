/**
 * ==================================================
 * Request Logger Middleware
 * ==================================================
 * File: src/middleware/loggingMiddleware.js
 * Description: Log tất cả HTTP requests
 */

const logger = require("../config/logger");

/**
 * Middleware log request
 * Ghi lại method, URL, status code, response time
 */
const loggingMiddleware = (req, res, next) => {
  // Lưu thời gian bắt đầu
  const startTime = Date.now();

  // Lưu hàm send gốc để override
  const originalSend = res.send;

  /**
   * Override res.send để capture response
   */
  res.send = function (data) {
    // Tính thời gian xử lý
    const duration = Date.now() - startTime;

    // Tạo log message
    const logMessage = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      userId: req.user?.id || "anonymous",
      userRole: req.user?.role || "guest",
    };

    // Log theo level khác nhau
    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }

    // Gọi hàm send gốc
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

module.exports = loggingMiddleware;
