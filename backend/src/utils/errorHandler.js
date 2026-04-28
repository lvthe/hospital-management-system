/**
 * ==================================================
 * Error Handler Utility
 * ==================================================
 * File: src/utils/errorHandler.js
 * Description: Tạo các loại lỗi tùy chỉnh
 */

/**
 * Custom Error Class
 * Kế thừa từ Error để tạo lỗi tùy chỉnh với status code
 */
class AppError extends Error {
  /**
   * Constructor
   * @param {string} message - Thông báo lỗi
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();

    // Duy trì proper prototype chain cho instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error (400 Bad Request)
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error (401 Unauthorized)
 */
class AuthenticationError extends AppError {
  constructor(message = "Xác thực thất bại") {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error (403 Forbidden)
 */
class AuthorizationError extends AppError {
  constructor(message = "Bạn không có quyền truy cập") {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error (404 Not Found)
 */
class NotFoundError extends AppError {
  constructor(resource = "Tài nguyên") {
    super(`${resource} không tìm thấy`, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error (409 Conflict)
 */
class ConflictError extends AppError {
  constructor(message = "Tài nguyên đã tồn tại") {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Database Error (500 Internal Server Error)
 */
class DatabaseError extends AppError {
  constructor(message = "Lỗi cơ sở dữ liệu") {
    super(message, 500);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
};
