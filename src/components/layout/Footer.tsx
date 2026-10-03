import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo showSubtitle />
            <p className="footer-brand-desc">
              Marca contemporánea de polos y camisetas estructuradas. Siluetas oversize, arquitectura textil limpia y acabados premium en algodón peruano de alto gramaje.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">COLECCIONES</h4>
            <ul className="footer-links">
              <li><Link to="/productos" className="footer-link">Todos los Polos</Link></li>
              <li><Link to="/productos?category=oversize" className="footer-link">Línea Oversize</Link></li>
              <li><Link to="/productos?category=heavyweight" className="footer-link">Línea Heavyweight</Link></li>
              <li><Link to="/productos?category=boxy-fit" className="footer-link">Boxy Fit</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">SERVICIO</h4>
            <ul className="footer-links">
              <li><a href="#guia-tallas" className="footer-link">Guía de Tallas</a></li>
              <li><a href="#envios" className="footer-link">Envíos a Todo el Perú</a></li>
              <li><a href="#cuidado" className="footer-link">Cuidado de Prendas</a></li>
              <li><a href="#faq" className="footer-link">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">ADMINISTRACIÓN</h4>
            <ul className="footer-links">
              <li><Link to="/admin/login" className="footer-link">Acceso Administrador</Link></li>
              <li><Link to="/admin/dashboard" className="footer-link">Panel de Control</Link></li>
              <li><Link to="/admin/inventario" className="footer-link">Gestión de Inventario</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} JURO STUDIO. TODOS LOS DERECHOS RESERVADOS.</div>
          <div>ESTÉTICA MONOCROMÁTICA · STREETWEAR DE LUJO</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
