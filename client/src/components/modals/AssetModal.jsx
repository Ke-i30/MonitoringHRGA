import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { X } from 'lucide-react';

export const AssetModal = ({ isOpen, assetData, onClose, onSuccess }) => {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [specification, setSpecification] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [unit, setUnit] = useState('Pcs');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (assetData) {
      setCategoryId(assetData.category_id);
      setName(assetData.name);
      setSpecification(assetData.specification || '');
      setStockQuantity(assetData.stock_quantity || 0);
      setUnit(assetData.unit || 'Pcs');
    } else {
      setName('');
      setSpecification('');
      setStockQuantity(0);
      setUnit('Pcs');
    }
  }, [assetData, isOpen]);

  const loadCategories = async () => {
    try {
      const res = await fetchApi('/assets/categories');
      setCategories(res.categories || []);
      if (res.categories.length > 0 && !categoryId) {
        setCategoryId(res.categories[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryId || !name.trim() || !unit.trim()) {
      setError('Kategori, Nama Barang, dan Satuan wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category_id: parseInt(categoryId),
        name,
        specification,
        stock_quantity: parseInt(stockQuantity),
        unit
      };

      if (assetData) {
        await fetchApi(`/assets/${assetData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/assets', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan barang.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{assetData ? 'Edit Barang Inventaris' : 'Tambah Barang Inventaris'}</h3>
          <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">KATEGORI BARANG</span>
            <select className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">NAMA BARANG</span>
            <input type="text" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">SPESIFIKASI</span>
            <input type="text" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={specification} onChange={(e) => setSpecification(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="detail-field-group">
              <span className="detail-field-label">STOK</span>
              <input type="number" min="0" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
            </div>
            <div className="detail-field-group">
              <span className="detail-field-label">SATUAN</span>
              <input type="text" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={unit} onChange={(e) => setUnit(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn-lavanila btn-lavanila-secondary">Batal</button>
            <button type="submit" className="btn-lavanila btn-lavanila-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Barang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
