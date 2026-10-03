const pool = require('../config/db');

exports.getPublicDepartments = async () => {
  const [departments] = await pool.query(
    'SELECT id, name, code FROM departments WHERE is_active = 1 ORDER BY name ASC'
  );
  return departments;
};

exports.getAllDepartmentsWithCount = async () => {
  const [departments] = await pool.query(
    `SELECT d.*, COUNT(u.id) as user_count
     FROM departments d
     LEFT JOIN users u ON d.id = u.department_id
     GROUP BY d.id
     ORDER BY d.id ASC`
  );
  return departments;
};

exports.createDepartment = async (name, code) => {
  const formattedCode = code.toUpperCase().trim();
  const [result] = await pool.query(
    'INSERT INTO departments (name, code, is_active) VALUES (?, ?, 1)',
    [name.trim(), formattedCode]
  );
  return result.insertId;
};

exports.updateDepartment = async (id, name, code) => {
  const formattedCode = code.toUpperCase().trim();
  await pool.query(
    'UPDATE departments SET name = ?, code = ? WHERE id = ?',
    [name.trim(), formattedCode, id]
  );
};

exports.toggleDepartmentStatus = async (id) => {
  const [dept] = await pool.query('SELECT is_active FROM departments WHERE id = ?', [id]);
  if (dept.length === 0) throw new Error('Divisi tidak ditemukan.');
  const newStatus = dept[0].is_active ? 0 : 1;
  await pool.query('UPDATE departments SET is_active = ? WHERE id = ?', [newStatus, id]);
  return newStatus;
};
