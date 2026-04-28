/**
 * ==================================================
 * Authentication Utilities
 * ==================================================
 * File: src/utils/auth.js
 * Description: Hàm hỗ trợ xác thực (JWT, password)
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/**
 * Hash mật khẩu bằng bcryptjs
 * @param {string} password - Mật khẩu rõ
 * @returns {Promise<string>} Mật khẩu đã hash
 */
const hashPassword = async (password) => {
  try {
    // Salt rounds = 10 (càng cao càng an toàn nhưng càng chậm)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Lỗi khi hash mật khẩu: " + error.message);
  }
};

/**
 * So sánh mật khẩu rõ với mật khẩu đã hash
 * @param {string} password - Mật khẩu rõ
 * @param {string} passwordHash - Mật khẩu đã hash
 * @returns {Promise<boolean>} True nếu khớp, false nếu không
 */
const comparePassword = async (password, passwordHash) => {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    throw new Error("Lỗi khi so sánh mật khẩu: " + error.message);
  }
};

/**
 * Tạo JWT Access Token
 * @param {string} userId - ID của user
 * @param {string} role - Vai trò của user
 * @returns {string} JWT token
 */
const generateAccessToken = (userId, role) => {
  try {
    const token = jwt.sign(
      {
        userId,
        role,
        type: "access", // Để phân biệt với refresh token
      },
      process.env.JWT_SECRET || "development_secret_key",
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
        issuer: process.env.JWT_ISSUER || "hospital-system",
        audience: process.env.JWT_AUDIENCE || "web-app",
      },
    );
    return token;
  } catch (error) {
    throw new Error("Lỗi tạo access token: " + error.message);
  }
};

/**
 * Tạo JWT Refresh Token
 * @param {string} userId - ID của user
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  try {
    const token = jwt.sign(
      {
        userId,
        type: "refresh",
      },
      process.env.JWT_SECRET || "development_secret_key",
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
        issuer: process.env.JWT_ISSUER || "hospital-system",
        audience: process.env.JWT_AUDIENCE || "web-app",
      },
    );
    return token;
  } catch (error) {
    throw new Error("Lỗi tạo refresh token: " + error.message);
  }
};

/**
 * Tạo cả access và refresh token
 * @param {string} userId - ID của user
 * @param {string} role - Vai trò của user
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
const generateTokenPair = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
};

/**
 * Xác thực JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} Nếu token không hợp lệ
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "development_secret_key",
      {
        issuer: process.env.JWT_ISSUER || "hospital-system",
      },
    );

    // Kiểm tra loại token
    if (decoded.type !== "access") {
      throw new Error("Token không phải access token");
    }

    return decoded;
  } catch (error) {
    // Phân biệt các loại lỗi JWT
    if (error.name === "TokenExpiredError") {
      throw new Error("Token đã hết hạn");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Token không hợp lệ");
    } else {
      throw error;
    }
  }
};

/**
 * Xác thực Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "development_secret_key",
      {
        issuer: process.env.JWT_ISSUER || "hospital-system",
      },
    );

    // Kiểm tra loại token
    if (decoded.type !== "refresh") {
      throw new Error("Token không phải refresh token");
    }

    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token đã hết hạn, vui lòng đăng nhập lại");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Refresh token không hợp lệ");
    } else {
      throw error;
    }
  }
};

/**
 * Giải mã token mà không xác thực (chỉ đọc payload)
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error("Lỗi giải mã token: " + error.message);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
