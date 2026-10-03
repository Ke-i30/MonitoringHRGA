import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Trash2 } from 'lucide-react';

export const CreateRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const isMasterAdmin = user?.role_name === 'Master Admin';

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('Medium');
  const [items, setItems] = useState([
    { is_custom: false, asset_id: '', item_name: '', specification: '', quantity: 1, urgency_reason: '' }
  ]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAssets();
      loadDepartments();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    try {
      const data = await fetchApi('/assets');
      setAssets(data.assets || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await fetchApi('/auth/departments');
      const list = data.departments || [];
      setDepartments(list);
      if (user?.department_id) {
        setSelectedDepartmentId(String(user.department_id));
      } else if (list.length > 0) {
        setSelectedDepartmentId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      { is_custom: false, asset_id: '', item_name: '', specification: '', quantity: 1, urgency_reason: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'asset_id' && value) {
      const selectedAsset = assets.find(a => a.id === parseInt(value));
      if (selectedAsset) {
        updated[index].item_name = selectedAsset.name;
        updated[index].specification = selectedAsset.specification || '';
      }
    }

    if (field === 'is_custom' && value === true) {
      updated[index].asset_id = '';
      updated[index].item_name = '';
      updated[index].specification = '';
    }

    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (let i = 0; i < items.length; i++) {
      if (!items[i].item_name.trim()) {
        setError(`Silakan isi nama barang pada item ke-${i + 1}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('priority_level', priorityLevel);
      formData.append('items', JSON.stringify(items));
      if (selectedDepartmentId) {
        formData.append('department_id', selectedDepartmentId);
      }

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      await fetchApi('/requisitions', {
        method: 'POST',
        body: formData
      });

      onSuccess();
      onClose();
      setPriorityLevel('Medium');
      setItems([{ is_custom: false, asset_id: '', item_name: '', specification: '', quantity: 1, urgency_reason: '' }]);
      setFiles([]);
    } catch (err) {
      setError(err.message || 'Gagal membuat laporan perbaikan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card" style={{ maxWidth: '750px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Buat Laporan Perbaikan Baru</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Pengajuan perbaikan barang/fasilitas ke Tim HRGA</p>
          </div>
          <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isMasterAdmin && (
            <div className="detail-field-group" style={{ marginBottom: '16px' }}>
              <span className="detail-field-label">DIVISI PEMINTA / ASAL LAPORAN</span>
              <select
                className="detail-field-value"
                style={{ width: '100%', border: '1px solid #cbd5e1', marginTop: '6px' }}
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
              >
                <option value="">-- Pilih Divisi --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                ))}
              </select>
            </div>
          )}

          <div className="detail-field-group" style={{ marginBottom: '16px' }}>
            <span className="detail-field-label">SKALA PRIORITY</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '6px' }}>
              {['Low', 'Medium', 'High', 'Urgent'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPriorityLevel(lvl)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: priorityLevel === lvl ? '2px solid #222226' : '1px solid #cbd5e1',
                    background: priorityLevel === lvl ? '#222226' : '#ffffff',
                    color: priorityLevel === lvl ? '#ffffff' : '#1e1e24',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lvl === 'Urgent' ? 'CRITICAL' : lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '12px' }}>
            <span className="detail-field-label">DAFTAR ITEM / BARANG YANG DILAPORKAN</span>
            <button type="button" onClick={handleAddItem} className="btn-lavanila btn-lavanila-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Plus size={16} /> Tambah Item Lain
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Item #{idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(idx)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '0.85rem' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" checked={!item.is_custom} onChange={() => handleItemChange(idx, 'is_custom', false)} /> Stok Inventaris Terdaftar
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" checked={item.is_custom} onChange={() => handleItemChange(idx, 'is_custom', true)} /> Pengajuan Perbaikan (Input Teks)
                </label>
              </div>

              {!item.is_custom ? (
                <div style={{ marginBottom: '10px' }}>
                  <select
                    className="detail-field-value"
                    style={{ width: '100%', border: '1px solid #cbd5e1' }}
                    value={item.asset_id}
                    onChange={(e) => handleItemChange(idx, 'asset_id', e.target.value)}
                  >
                    <option value="">-- Pilih dari Master Stok --</option>
                    {assets.map((ast) => (
                      <option key={ast.id} value={ast.id}>{ast.name} (Stok: {ast.stock_quantity} {ast.unit})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="detail-field-value"
                    style={{ width: '100%', border: '1px solid #cbd5e1' }}
                    placeholder="Nama Barang / Fasilitas yang Perlu Diperbaiki"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <div>
                  <input
                    type="number"
                    min="1"
                    className="detail-field-value"
                    style={{ width: '100%', border: '1px solid #cbd5e1' }}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="detail-field-value"
                    style={{ width: '100%', border: '1px solid #cbd5e1' }}
                    placeholder="Deskripsi Kerusakan / Detail Perbaikan"
                    value={item.specification}
                    onChange={(e) => handleItemChange(idx, 'specification', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="detail-field-group" style={{ marginTop: '16px' }}>
            <span className="detail-field-label">LAMPIRAN FOTO PENDUKUNG</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              style={{ marginTop: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn-lavanila btn-lavanila-secondary">Batal</button>
            <button type="submit" className="btn-lavanila btn-lavanila-primary" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

