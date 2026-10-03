import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  ExternalLink,
  LogOut,
  X
} from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header">
        <Logo to="/admin/dashboard" showSubtitle />
        <button
          onClick={onClose}
          className="hamburger-btn"
          style={{ color: '#737373', cursor: 'pointer' }}
          aria-label="Cerrar sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="admin-nav">
        <span className="admin-nav-heading">PRINCIPAL</span>

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/productos"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Package size={18} />
          <span>Productos</span>
        </NavLink>

        <NavLink
          to="/admin/inventario"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Boxes size={18} />
          <span>Inventario & Stock</span>
        </NavLink>

        <span className="admin-nav-heading">E-COMMERCE</span>

        <NavLink
          to="/admin/pedidos"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <ShoppingBag size={18} />
          <span>Pedidos</span>
        </NavLink>

        <span className="admin-nav-heading">ACCESOS DIRECTOS</span>

        <Link
          to="/"
          target="_blank"
          className="admin-nav-link"
          style={{ color: '#A3A3A3' }}
        >
          <ExternalLink size={18} />
          <span>Ver Tienda Pública</span>
        </Link>
      </nav>

      <div className="admin-sidebar-footer">
        <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#737373', borderBottom: '1px solid #1A1A1A', marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: 600, color: '#D4D4D4' }}>{user?.name || 'Administrador'}</div>
          <div>{user?.email || 'admin@kkrius.com'}</div>
        </div>

        <button
          onClick={logout}
          className="admin-nav-link"
          style={{ width: '100%', color: '#888888', justifyContent: 'flex-start' }}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
