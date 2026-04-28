/**
 * ==================================================
 * Authentication Middleware
 * ==================================================
 * File: src/middleware/authMiddleware.js
 * Description: Xác thực JWT token từ request header
 */

const {
  AuthenticationError,
  AuthorizationError,
} = require("../utils/errorHandler");
const { verifyAccessToken } = require("../utils/auth");
const logger = require("../config/logger");

/**
 * Middleware xác thực token
 * Kiểm tra Authorization header có Bearer token hợp lệ
 */
const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError("Token không được cung cấp");
    }

    // Kiểm tra format "Bearer <token>"
    if (!authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError(
        "Format token không hợp lệ (Bearer scheme required)",
      );
    }

    // Chiết xuất token
    const token = authHeader.substring(7);

    // Xác thực token
    const decoded = verifyAccessToken(token);

    // Lưu thông tin user vào request để dùng ở controller
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    logger.debug(`User ${decoded.userId} authenticated successfully`);
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);

    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_FAILED",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(401).json({
      success: false,
      error: "INVALID_TOKEN",
      message: error.message || "Token không hợp lệ",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware kiểm tra role (quyền)
 * Sử dụng như: checkRole('admin', 'doctor')
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra user đã được authenticate
      if (!req.user) {
        throw new AuthenticationError("User không được xác thực");
      }

      // Kiểm tra role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `User ${req.user.id} unauthorized for ${allowedRoles.join(",")}`,
        );
        throw new AuthorizationError(
          `Vai trò ${req.user.role} không được phép truy cập`,
        );
      }

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(403).json({
          success: false,
          error: "UNAUTHORIZED",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }

      res.status(401).json({
        success: false,
        error: "AUTHENTICATION_REQUIRED",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

module.exports = {
  authMiddleware,
  checkRole,
};
