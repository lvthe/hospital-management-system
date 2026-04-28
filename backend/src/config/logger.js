/**
 * ==================================================
 * Logger Configuration
 * ==================================================
 * File: src/config/logger.js
 * Description: Cấu hình Winston logger để ghi log
 */

const winston = require("winston");
const path = require("path");
require("dotenv").config();

/**
 * Định dạng log khi lưu vào file
 * Format: timestamp | level | message | additional data
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // Bao gồm stack trace nếu có lỗi
  winston.format.json(), // Format JSON để dễ parsing
);

/**
 * Định dạng log khi in ra console
 * Format: [timestamp] [LEVEL] message
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(), // Thêm màu cho console
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = "";
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta);
    }
    return `[${timestamp}] [${level}] ${message} ${metaStr}`;
  }),
);

/**
 * Tạo logger
 * Ghi log vào file và console
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  defaultMeta: { service: "hospital-api" },
  transports: [
    // File cho tất cả log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error", // Chỉ tất cả lỗi
    }),
    // File cho tất cả log (debug, info, warn, error)
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
    }),
    // Console output cho development
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

/**
 * Nếu không phải production, log thêm thông tin debug
 */
if (process.env.NODE_ENV !== "production") {
  logger.debug("Debug logging enabled");
}

module.exports = logger;
