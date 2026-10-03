import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import { Edit2, Trash2 } from 'lucide-react';

export const AssetsPage = ({ search, onOpenAssetModal }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/assets');
      setAssets(res.assets || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus barang '${name}'?`)) return;
    try {
      await fetchApi(`/assets/${id}`, { method: 'DELETE' });
      loadAssets();
    } catch (err) {
      alert(err.message || 'Gagal menghapus barang.');
    }
  };

  const filteredAssets = assets.filter(a =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Katalog Stok & Inventaris Barang</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
          Gunakan tombol melayang <b>(+)</b> di sudut kanan bawah untuk menambah barang inventaris baru.
        </p>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data barang...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>NAMA BARANG</th>
                <th>KATEGORI</th>
                <th>STOK TERSEDIA</th>
                <th>SPESIFIKASI</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((ast) => (
                <tr key={ast.id}>
                  <td style={{ fontWeight: 800 }}>{ast.name}</td>
                  <td><span className="detail-field-value" style={{ fontSize: '0.78rem' }}>{ast.category_name}</span></td>
                  <td style={{ fontWeight: 800, color: ast.stock_quantity < 5 ? '#dc2626' : '#059669' }}>
                    {ast.stock_quantity} {ast.unit}
                  </td>
                  <td>{ast.specification || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button onClick={() => onOpenAssetModal(ast)} className="btn-lavanila btn-lavanila-secondary" style={{ padding: '6px' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(ast.id, ast.name)} className="btn-lavanila btn-lavanila-danger" style={{ padding: '6px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
