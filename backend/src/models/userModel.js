/**
 * ==================================================
 * User Model
 * ==================================================
 * File: src/models/userModel.js
 * Description: Các truy vấn SQL liên quan đến users
 */

const { query } = require("../config/database");

/**
 * Tìm user theo email
 * @param {string} email
 * @returns {Promise<Object|null>} user object or null
 */
const getUserByEmail = async (email) => {
  const sql = `
    SELECT id, email, password_hash, full_name, phone, avatar_url, role, is_active, email_verified, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Tìm user theo id
 * @param {string} id
 * @returns {Promise<Object|null>} user object or null
 */
const getUserById = async (id) => {
  const sql = `
    SELECT id, email, full_name, phone, avatar_url, role, is_active, email_verified, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Tạo một user mới
 * @param {Object} userData
 * @param {string} userData.email
 * @param {string} userData.passwordHash
 * @param {string} userData.full_name
 * @param {string} [userData.phone]
 * @param {string} [userData.avatar_url]
 * @param {string} userData.role
 * @returns {Promise<Object>} user object created
 */
const createUser = async ({
  email,
  passwordHash,
  full_name,
  phone,
  avatar_url,
  role,
}) => {
  const sql = `
    INSERT INTO users (email, password_hash, full_name, phone, avatar_url, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, full_name, phone, avatar_url, role, is_active, email_verified, created_at, updated_at
  `;

  const values = [
    email,
    passwordHash,
    full_name,
    phone || null,
    avatar_url || null,
    role,
  ];
  const result = await query(sql, values);
  return result.rows[0];
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
};
