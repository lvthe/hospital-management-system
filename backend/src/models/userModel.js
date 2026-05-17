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

const getUsers = async ({ page = 1, limit = 20, role = '', search = '' }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (role) { conditions.push(`role = $${idx}`); values.push(role); idx++; }
  if (search) { conditions.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`); values.push(`%${search}%`); idx++; }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const total = parseInt((await query(`SELECT COUNT(*) FROM users ${where}`, values)).rows[0].count, 10);

  const sql = `
    SELECT id, email, full_name, phone, role, is_active, created_at
    FROM users ${where}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  const result = await query(sql, [...values, limit, offset]);
  return { data: result.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const updateUserRole = async (id, role) => {
  const sql = `
    UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, email, full_name, role, is_active, updated_at
  `;
  const result = await query(sql, [role, id]);
  return result.rows[0] || null;
};

const toggleUserActive = async (id, is_active) => {
  const sql = `
    UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, email, full_name, role, is_active, updated_at
  `;
  const result = await query(sql, [is_active, id]);
  return result.rows[0] || null;
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  getUsers,
  updateUserRole,
  toggleUserActive,
};
