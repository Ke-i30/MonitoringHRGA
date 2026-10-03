const pool = require('../config/db');

// GET /api/assets
exports.getAllAssets = async (req, res) => {
  try {
    const [assets] = await pool.query(
      `SELECT a.*, c.name as category_name
       FROM assets a
       JOIN asset_categories c ON a.category_id = c.id
       ORDER BY a.name ASC`
    );
    res.json({ success: true, assets });
  } catch (error) {
    console.error('getAllAssets error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data inventaris barang.' });
  }
};

// GET /api/assets/categories
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM asset_categories ORDER BY name ASC');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori barang.' });
  }
};

// POST /api/assets
exports.createAsset = async (req, res) => {
  const { category_id, name, specification, stock_quantity, unit } = req.body;

  if (!category_id || !name || !unit) {
    return res.status(400).json({ success: false, message: 'Kategori, Nama Barang, dan Satuan wajib diisi.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO assets (category_id, name, specification, stock_quantity, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [category_id, name.trim(), specification || '', stock_quantity || 0, unit.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Barang inventaris berhasil ditambahkan!',
      assetId: result.insertId
    });
  } catch (error) {
    console.error('createAsset error:', error);
    res.status(500).json({ success: false, message: 'Gagal menambah barang inventaris.' });
  }
};

// PUT /api/assets/:id
exports.updateAsset = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, specification, stock_quantity, unit } = req.body;

  try {
    await pool.query(
      `UPDATE assets 
       SET category_id = ?, name = ?, specification = ?, stock_quantity = ?, unit = ?
       WHERE id = ?`,
      [category_id, name.trim(), specification || '', stock_quantity || 0, unit.trim(), id]
    );

    res.json({ success: true, message: 'Data stok/barang berhasil diperbarui!' });
  } catch (error) {
    console.error('updateAsset error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data barang.' });
  }
};

// DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    res.json({ success: true, message: 'Barang inventaris berhasil dihapus!' });
  } catch (error) {
    console.error('deleteAsset error:', error);
    res.status(500).json({ success: false, message: 'Barang tidak dapat dihapus karena masih terkait dengan riwayat transaksi.' });
  }
};
