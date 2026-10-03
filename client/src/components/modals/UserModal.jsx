import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { X } from 'lucide-react';

export const UserModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMeta();
    }
  }, [isOpen]);

  const loadMeta = async () => {
    try {
      const data = await fetchApi('/users/meta');
      setRoles(data.roles || []);
      setDepartments(data.departments || []);
      if (data.roles.length > 0) setRoleId(data.roles[0].id);
      if (data.departments.length > 0) setDepartmentId(data.departments[0].id);
    } catch (err) {
      console.error('Failed to load user metadata:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !roleId || !departmentId) {
      setError('Semua field wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          role_id: parseInt(roleId),
          department_id: parseInt(departmentId)
        })
      });

      onSuccess();
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Gagal membuat pengguna baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-card" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Registrasi Akun Manual</h3>
          <button onClick={onClose} className="modal-close-btn"><X size={24} /></button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">NAMA LENGKAP</span>
            <input type="text" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">EMAIL PERUSAHAAN</span>
            <input type="email" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="detail-field-group" style={{ marginBottom: '12px' }}>
            <span className="detail-field-label">PASSWORD</span>
            <input type="password" className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="detail-field-group">
              <span className="detail-field-label">ROLE</span>
              <select className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="detail-field-group">
              <span className="detail-field-label">DIVISI</span>
              <select className="detail-field-value" style={{ border: '1px solid #cbd5e1', width: '100%' }} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn-lavanila btn-lavanila-secondary">Batal</button>
            <button type="submit" className="btn-lavanila btn-lavanila-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
