import React from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, onToggleSidebar }) => {
  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="header-btn hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          style={{ display: 'inline-flex' }}
        >
          <Menu size={20} />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-actions">
        <Link
          to="/"
          target="_blank"
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}
        >
          <ExternalLink size={14} />
          VER TIENDA
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
