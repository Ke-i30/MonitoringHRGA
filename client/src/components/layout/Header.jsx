import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, LogOut } from 'lucide-react';

export const Header = ({ search, setSearch }) => {
  const { user, logout } = useAuth();
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="app-header">
      <div className="header-search">
        <Search size={18} className="header-search-icon" />
        <input
          type="text"
          placeholder="Cari laporan, nomor tiket, atau divisi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="header-user-profile">
        <button
          title="Notifikasi"
          style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '8px' }}
        >
          <Bell size={22} />
        </button>

        <div className="user-badge">
          <div className="user-avatar">{avatarLetter}</div>
          <div className="user-details">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '8px', marginLeft: '8px' }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
