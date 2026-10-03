const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, 
              u.department_id, d.name as department_name, d.code as department_code,
              u.is_active, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN departments d ON u.department_id = d.id
       ORDER BY u.created_at DESC`
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna.' });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  const { name, email, password, role_id, department_id } = req.body;

  if (!name || !email || !password || !role_id || !department_id) {
    return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
  }

  try {
    // Check email unique
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar dalam sistem.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id, department_id, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [name, email, hashedPassword, role_id, department_id]
    );

    res.status(201).json({
      success: true,
      message: 'Akun baru berhasil dibuat!',
      userId: result.insertId
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat pengguna baru.' });
  }
};

// PUT /api/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const [users] = await pool.query('SELECT is_active FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const newStatus = users[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `Status pengguna berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Non-Aktif'}.`
    });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Gagal merubah status pengguna.' });
  }
};

// GET /api/users/roles-departments
exports.getRolesAndDepartments = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    const [departments] = await pool.query('SELECT * FROM departments WHERE is_active = 1 ORDER BY name ASC');
    res.json({ success: true, roles, departments });
  } catch (error) {
    console.error('getRolesAndDepartments error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data opsi role/divisi.' });
  }
};
