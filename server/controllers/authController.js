const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/emailService');

// Helper to generate 6-digit OTP code
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// GET /api/auth/departments (Public)
exports.getPublicDepartments = async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT id, name, code FROM departments WHERE is_active = 1 ORDER BY name ASC');
    res.json({ success: true, departments });
  } catch (error) {
    console.error('getPublicDepartments error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data divisi.' });
  }
};

// POST /api/auth/register (Public registration defaults to Supervisor role_id = 2)
exports.registerPublic = async (req, res) => {
  const { name, email, password, department_id } = req.body;

  if (!name || !email || !password || !department_id) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const [existing] = await pool.query('SELECT id, is_active FROM users WHERE LOWER(TRIM(email)) = ?', [cleanEmail]);
    if (existing.length > 0) {
      if (!existing[0].is_active) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email ini sudah mendaftar dan masih menunggu approval/ACC dari Master Admin.' 
        });
      }
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar dalam sistem.' });
    }

    const role_id = 2; // Default Supervisor
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id, department_id, is_active)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [name.trim(), cleanEmail, hashedPassword, role_id, parseInt(department_id)]
    );

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari Master Admin HRGA sebelum dapat digunakan untuk login.'
    });
  } catch (error) {
    console.error('registerPublic error:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan pendaftaran akun.' });
  }
};

// POST /api/auth/login (Step 1: Validate Password & Trigger OTP)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const [rows] = await pool.query(
      `SELECT u.*, r.name as role_name, d.name as department_name, d.code as department_code
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE LOWER(TRIM(u.email)) = ?`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const user = rows[0];

    // Check if account is active / approved by Master Admin
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda belum disetujui (ACC) oleh Master Admin HRGA. Silakan tunggu konfirmasi dari HRGA.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    // Generate 6-Digit OTP Code
    const otpCode = generateOtpCode();
    // OTP Valid for 5 Minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update user record with OTP
    await pool.query(
      `UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?`,
      [otpCode, expiresAt, user.id]
    );

    // Send OTP via Email
    sendOtpEmail(user.email, otpCode, user.name);

    res.json({
      success: true,
      requireOtp: true,
      email: user.email,
      message: `Kode OTP 6 digit telah dikirimkan ke email ${user.email}. Silakan masukkan kode OTP untuk melanjutkan login.`
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};

// POST /api/auth/verify-otp (Step 2: Verify OTP & Issue Token)
exports.verifyOtp = async (req, res) => {
  const { email, otp_code } = req.body;

  if (!email || !otp_code) {
    return res.status(400).json({ success: false, message: 'Email dan Kode OTP wajib diisi.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.*, r.name as role_name, d.name as department_name, d.code as department_code
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN departments d ON u.department_id = d.id
       WHERE u.email = ? AND u.is_active = 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const user = rows[0];

    // Check if OTP matches
    if (!user.otp_code || user.otp_code !== otp_code.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Kode OTP yang Anda masukkan salah.' });
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(user.otp_expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ success: false, message: 'Kode OTP telah kadaluwarsa (lebih dari 5 menit). Silakan minta kode baru.' });
    }

    // Clear OTP after successful verification
    await pool.query(
      `UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?`,
      [user.id]
    );

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      department_id: user.department_id,
      department_name: user.department_name
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'hrga_super_secret_jwt_key_2026_x89a',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Verifikasi OTP berhasil! Anda telah resmi masuk.',
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ success: false, message: 'Gagal memverifikasi OTP.' });
  }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
  }

  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users WHERE email = ? AND is_active = 1', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
    }

    const user = rows[0];
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?`,
      [otpCode, expiresAt, user.id]
    );

    sendOtpEmail(user.email, otpCode, user.name);

    res.json({
      success: true,
      message: `Kode OTP baru telah berhasil dikirim ke ${user.email}.`
    });
  } catch (error) {
    console.error('resendOtp error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim ulang OTP.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.department_id, d.name as department_name, d.code as department_code
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN departments d ON u.department_id = d.id
       WHERE u.id = ? AND u.is_active = 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};
