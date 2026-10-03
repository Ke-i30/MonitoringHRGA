import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Package, Building2, Users, Mail } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const isMasterAdmin = user?.role_name === 'Master Admin';

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <h1>Lavanila</h1>
        <span>Repair & Maintenance</span>
      </div>

      <nav className="sidebar-nav">
        <button
          onClick={() => setActiveTab('requisitions')}
          className={`nav-item ${activeTab === 'requisitions' ? 'active' : ''}`}
        >
          <ClipboardList size={20} />
          <span>Laporan Perbaikan</span>
        </button>

        {isMasterAdmin && (
          <>
            <button
              onClick={() => setActiveTab('assets')}
              className={`nav-item ${activeTab === 'assets' ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Stok Inventaris</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`nav-item ${activeTab === 'departments' ? 'active' : ''}`}
            >
              <Building2 size={20} />
              <span>Kelola Divisi</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Manajemen Akun</span>
            </button>

            <button
              onClick={() => setActiveTab('email-logs')}
              className={`nav-item ${activeTab === 'email-logs' ? 'active' : ''}`}
            >
              <Mail size={20} />
              <span>Log Mutasi Email</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
};
