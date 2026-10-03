import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api';
import { CheckCircle2, Clock } from 'lucide-react';

export const UsersPage = ({ onOpenUserModal }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/users');
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const actionText = !currentStatus ? 'MENYETUJUI (ACC)' : 'MENGNONAKTIFKAN';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} akun ini?`)) return;

    try {
      await fetchApi(`/users/${id}/toggle-status`, { method: 'PUT' });
      loadUsers();
    } catch (err) {
      alert(err.message || 'Gagal merubah status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'PENDING') return !u.is_active;
    if (statusFilter === 'ACTIVE') return u.is_active;
    return true;
  });

  const pendingCount = users.filter(u => !u.is_active).length;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Manajemen Pengguna</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
          Kelola persetujuan akun dan daftar pengguna.
        </p>
      </div>

      {pendingCount > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d97706', fontWeight: 700 }}>
            <Clock size={18} />
            <span>Ada {pendingCount} pendaftaran akun baru yang membutuhkan ACC!</span>
          </div>
          <button onClick={() => setStatusFilter('PENDING')} className="btn-lavanila btn-lavanila-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Tampilkan Perlu ACC
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setStatusFilter('ALL')} className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}>Semua ({users.length})</button>
        <button onClick={() => setStatusFilter('PENDING')} className={`filter-pill ${statusFilter === 'PENDING' ? 'active' : ''}`}>Menunggu ACC ({pendingCount})</button>
        <button onClick={() => setStatusFilter('ACTIVE')} className={`filter-pill ${statusFilter === 'ACTIVE' ? 'active' : ''}`}>Disetujui ({users.filter(u => u.is_active).length})</button>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data akun...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>NAMA PENGGUNA</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>DIVISI</th>
                <th>STATUS ACC</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((usr) => (
                <tr key={usr.id}>
                  <td style={{ fontWeight: 800 }}>{usr.name}</td>
                  <td>{usr.email}</td>
                  <td style={{ fontWeight: 700, color: usr.role_name === 'Master Admin' ? '#dc2626' : '#2563eb' }}>{usr.role_name}</td>
                  <td style={{ fontWeight: 700 }}>{usr.department_name} ({usr.department_code})</td>
                  <td>
                    <span className={`status-tag ${usr.is_active ? 'status-completed' : 'status-waiting'}`}>
                      {usr.is_active ? 'DISETUJUI (AKTIF)' : 'BUTUH ACC'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!usr.is_active ? (
                      <button onClick={() => handleToggleStatus(usr.id, usr.is_active)} className="btn-lavanila btn-lavanila-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        <CheckCircle2 size={14} /> ACC Akun
                      </button>
                    ) : (
                      <button onClick={() => handleToggleStatus(usr.id, usr.is_active)} className="btn-lavanila btn-lavanila-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Nonaktifkan
                      </button>
                    )}
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
