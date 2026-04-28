/**
 * ==================================================
 * Authentication Controller
 * ==================================================
 * File: src/controllers/authController.js
 * Description: Xử lý các request liên quan đến auth
 */

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
} = require("../services/authService");
const { getUserById } = require("../models/userModel");
const { registerSchema, loginSchema } = require("../utils/validators");
const { ValidationError, NotFoundError } = require("../utils/errorHandler");

/**
 * Register handler
 */
const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new ValidationError(
        error.details.map((detail) => detail.message).join(", "),
      );
    }

    const user = await registerUser(value);
    res.status(201).json({
      success: true,
      data: user,
      message: "Đăng ký thành công",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login handler
 */
const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new ValidationError(
        error.details.map((detail) => detail.message).join(", "),
      );
    }

    const loginResult = await loginUser(value);
    res.status(200).json({
      success: true,
      data: loginResult,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token handler
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError("Refresh token là bắt buộc");
    }

    const result = await refreshAccessToken(refreshToken);
    res.status(200).json({
      success: true,
      data: result,
      message: "Token đã được làm mới",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout handler
 */
const logoutHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError("Refresh token là bắt buộc");
    }

    await logout(refreshToken);
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Profile handler
 */
const profile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new NotFoundError("User");
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      throw new NotFoundError("User");
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout: logoutHandler,
  profile,
};
