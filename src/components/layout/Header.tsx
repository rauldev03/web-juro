import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, Shield } from 'lucide-react';
import Logo from '../common/Logo';
import { useCart } from '../../context/CartContext';
import { MobileNavDrawer } from './MobileNavDrawer';
import { SearchBarModal } from '../shop/SearchBarModal';

export const Header: React.FC = () => {
  const { totalCount, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          {/* Mobile Hamburger */}
          <button
            className="header-btn hamburger-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo */}
          <Logo showSubtitle />

          {/* Desktop Navigation Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  end
                >
                  INICIO
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/productos"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  TIENDA
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/productos?category=oversize"
                  className="nav-link"
                >
                  OVERSIZE
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/productos?category=heavyweight"
                  className="nav-link"
                >
                  HEAVYWEIGHT
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Actions: Search, Admin Icon, Cart */}
          <div className="header-actions">
            <button
              className="header-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar productos"
              title="Buscar polo"
            >
              <Search size={20} />
            </button>

            <Link
              to="/admin/dashboard"
              className="header-btn"
              title="Panel Administrativo"
              style={{ color: '#888888' }}
            >
              <Shield size={19} />
            </Link>

            <button
              className="header-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Ver carrito"
              title="Bolsa de compras"
            >
              <ShoppingBag size={20} />
              {totalCount > 0 && <span className="cart-badge">{totalCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        cartCount={totalCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Search Modal */}
      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Header;
