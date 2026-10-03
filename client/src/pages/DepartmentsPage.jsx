import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import { Edit2, Power } from 'lucide-react';

export const DepartmentsPage = ({ onOpenDeptModal }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/departments');
      setDepartments(res.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await fetchApi(`/departments/${id}/toggle-status`, { method: 'PUT' });
      loadDepartments();
    } catch (err) {
      alert(err.message || 'Gagal merubah status divisi.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Master Klasifikasi Divisi</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
          Gunakan tombol melayang <b>(+)</b> di sudut kanan bawah untuk menambah divisi baru.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat daftar divisi...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {departments.map((dept) => (
            <div key={dept.id} className="table-card" style={{ padding: '20px', opacity: dept.is_active ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ background: '#e2e4e8', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.82rem' }}>
                  {dept.code}
                </span>
                <span className={`status-tag ${dept.is_active ? 'status-completed' : 'status-rejected'}`}>
                  {dept.is_active ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>{dept.name}</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                Total Pengguna: <b>{dept.user_count || 0} Akun</b>
              </p>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button onClick={() => onOpenDeptModal(dept)} className="btn-lavanila btn-lavanila-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleToggleStatus(dept.id)} className="btn-lavanila btn-lavanila-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>
                  <Power size={14} /> {dept.is_active ? 'Nonaktif' : 'Aktifkan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
