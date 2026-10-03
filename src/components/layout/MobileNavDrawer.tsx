import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, ShoppingBag, ShieldCheck } from 'lucide-react';
import Logo from '../common/Logo';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  cartCount,
  onOpenCart
}) => {
  return (
    <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo to="/" onClick={onClose} />
        <button
          onClick={onClose}
          style={{ padding: '0.5rem', color: '#FFFFFF', cursor: 'pointer' }}
          aria-label="Cerrar menú"
        >
          <X size={24} />
        </button>
      </div>

      <ul className="mobile-nav-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            INICIO
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/productos"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            TIENDA
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/productos?category=oversize"
            className="mobile-nav-link"
            onClick={onClose}
          >
            OVERSIZE
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/productos?category=heavyweight"
            className="mobile-nav-link"
            onClick={onClose}
          >
            HEAVYWEIGHT
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/dashboard"
            className="mobile-nav-link"
            onClick={onClose}
            style={{ fontSize: '1.1rem', color: '#888888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShieldCheck size={18} /> PANEL ADMIN
          </NavLink>
        </li>
      </ul>

      <div style={{ borderTop: '1px solid #222222', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={() => {
            onClose();
            onOpenCart();
          }}
          className="btn btn-primary btn-full"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
        >
          <ShoppingBag size={18} />
          VER CARRITO ({cartCount})
        </button>
      </div>
    </div>
  );
};
