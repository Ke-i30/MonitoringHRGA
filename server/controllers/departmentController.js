const pool = require('../config/db');

// GET /api/departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await pool.query(
      `SELECT d.*, COUNT(u.id) as user_count
       FROM departments d
       LEFT JOIN users u ON d.id = u.department_id
       GROUP BY d.id
       ORDER BY d.id ASC`
    );
    res.json({ success: true, departments });
  } catch (error) {
    console.error('getAllDepartments error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data divisi.' });
  }
};

// POST /api/departments
exports.createDepartment = async (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Nama dan Kode Divisi wajib diisi.' });
  }

  try {
    const formattedCode = code.toUpperCase().trim();
    const [existing] = await pool.query('SELECT id FROM departments WHERE code = ?', [formattedCode]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Kode divisi '${formattedCode}' sudah digunakan.` });
    }

    const [result] = await pool.query(
      'INSERT INTO departments (name, code, is_active) VALUES (?, ?, 1)',
      [name.trim(), formattedCode]
    );

    res.status(201).json({
      success: true,
      message: 'Divisi baru berhasil ditambahkan!',
      departmentId: result.insertId
    });
  } catch (error) {
    console.error('createDepartment error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah divisi.' });
  }
};

// PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;

  try {
    const formattedCode = code.toUpperCase().trim();
    const [existing] = await pool.query('SELECT id FROM departments WHERE code = ? AND id != ?', [formattedCode, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Kode divisi '${formattedCode}' sudah digunakan.` });
    }

    await pool.query(
      'UPDATE departments SET name = ?, code = ? WHERE id = ?',
      [name.trim(), formattedCode, id]
    );

    res.json({ success: true, message: 'Divisi berhasil diperbarui!' });
  } catch (error) {
    console.error('updateDepartment error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui divisi.' });
  }
};

// PUT /api/departments/:id/toggle-status
exports.toggleDepartmentStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const [dept] = await pool.query('SELECT is_active FROM departments WHERE id = ?', [id]);
    if (dept.length === 0) {
      return res.status(404).json({ success: false, message: 'Divisi tidak ditemukan.' });
    }

    const newStatus = dept[0].is_active ? 0 : 1;
    await pool.query('UPDATE departments SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      message: `Status divisi berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Non-Aktif'}.`
    });
  } catch (error) {
    console.error('toggleDepartmentStatus error:', error);
    res.status(500).json({ success: false, message: 'Gagal merubah status divisi.' });
  }
};
