/**
 * ==================================================
 * Authentication Service
 * ==================================================
 * File: src/services/authService.js
 * Description: Business logic cho đăng ký, đăng nhập, refresh token
 */

const {
  getUserByEmail,
  createUser,
  getUserById,
} = require("../models/userModel");
const {
  hashPassword,
  comparePassword,
  generateTokenPair,
  verifyRefreshToken,
} = require("../utils/auth");
const { redisClient } = require("../config/database");
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} = require("../utils/errorHandler");

const REFRESH_TOKEN_TTL_SECONDS = parseInt(
  process.env.JWT_REFRESH_TOKEN_TTL_SECONDS || "604800",
  10,
);

/**
 * Đăng ký user mới
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
const registerUser = async ({ email, password, full_name, phone, role }) => {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email đã được đăng ký");
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    email,
    passwordHash,
    full_name,
    phone,
    avatar_url: null,
    role: role || "patient",
  });

  return user;
};

/**
 * Đăng nhập user
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
const loginUser = async ({ email, password }) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AuthenticationError("Email hoặc mật khẩu không đúng");
  }

  if (!user.is_active) {
    throw new AuthenticationError("Tài khoản đã bị khóa");
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError("Email hoặc mật khẩu không đúng");
  }

  const tokenPair = generateTokenPair(user.id, user.role);
  await redisClient.set(`refreshToken:${tokenPair.refreshToken}`, user.id, {
    EX: REFRESH_TOKEN_TTL_SECONDS,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    ...tokenPair,
  };
};

/**
 * Refresh access token từ refresh token
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const storedUserId = await redisClient.get(`refreshToken:${refreshToken}`);

  if (!storedUserId || storedUserId !== decoded.userId) {
    throw new AuthenticationError("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  const user = await getUserById(decoded.userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  const newTokenPair = generateTokenPair(user.id, user.role);
  await redisClient.del(`refreshToken:${refreshToken}`);
  await redisClient.set(`refreshToken:${newTokenPair.refreshToken}`, user.id, {
    EX: REFRESH_TOKEN_TTL_SECONDS,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
      is_active: user.is_active,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    ...newTokenPair,
  };
};

/**
 * Logout user và thu hồi refresh token
 * @param {string} refreshToken
 */
const logout = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const storedUserId = await redisClient.get(`refreshToken:${refreshToken}`);

  if (!storedUserId || storedUserId !== decoded.userId) {
    throw new AuthenticationError("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  await redisClient.del(`refreshToken:${refreshToken}`);
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
};
