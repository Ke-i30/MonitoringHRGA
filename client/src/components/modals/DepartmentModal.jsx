import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { X } from 'lucide-react';

export const DepartmentModal = ({ isOpen, departmentData, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (departmentData) {
      setName(departmentData.name);
      setCode(departmentData.code);
    } else {
      setName('');
      setCode('');
    }
  }, [departmentData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !code.trim()) {
      setError('Nama Divisi dan Kode wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (departmentData) {
        await fetchApi(`/departments/${departmentData.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, code })
        });
      } else {
        await fetchApi('/departments', {
          method: 'POST',
          body: JSON.stringify({ name, code })
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan divisi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card" style={{ maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{departmentData ? 'Edit Divisi' : 'Tambah Divisi Baru'}</h3>
          <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">NAMA DIVISI</span>
            <input type="text" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">KODE KELOMPOK DIVISI</span>
            <input type="text" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn-lavanila btn-lavanila-secondary">Batal</button>
            <button type="submit" className="btn-lavanila btn-lavanila-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Divisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
