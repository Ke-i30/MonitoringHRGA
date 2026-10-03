const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT u.*, r.name as role_name, d.name as department_name, d.code as department_code
     FROM users u
     JOIN roles r ON u.role_id = r.id
     JOIN departments d ON u.department_id = d.id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0] || null;
};

exports.updateUserOtp = async (userId, otpCode, expiresAt) => {
  await pool.query(
    `UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?`,
    [otpCode, expiresAt, userId]
  );
};

exports.clearUserOtp = async (userId) => {
  await pool.query(
    `UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?`,
    [userId]
  );
};

exports.createUserRegistration = async ({ name, email, password, departmentId, roleId = 2 }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id, department_id, is_active)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [name.trim(), email.trim(), hashedPassword, roleId, parseInt(departmentId)]
  );
  return result.insertId;
};

exports.generateJwtToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role_id: user.role_id,
    role_name: user.role_name,
    department_id: user.department_id,
    department_name: user.department_name
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'hrga_super_secret_jwt_key_2026_x89a',
    { expiresIn: '24h' }
  );
};
