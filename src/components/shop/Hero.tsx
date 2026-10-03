import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-bg">
        <img
          src="/images/hero/hero-streetwear.jpg"
          alt="KKRIUS Nueva Colección Streetwear Polos"
        />
      </div>

      <div className="hero-overlay" />

      <div className="container" style={{ position: 'relative', zIndex: 5, width: '100%' }}>
        <div className="hero-content">
          <span className="hero-tag">COLECCIÓN ARCHIVE / EDICIÓN 01</span>
          <h1 className="hero-title">
            DISEÑO QUE HABLA POR SÍ MISMO.
          </h1>
          <p className="hero-desc">
            Polos contemporáneos estructurados en algodón peruano pesado de 280 GSM. Siluetas oversize, hombros caídos y corte impecable en tonos monocromáticos.
          </p>
          <div className="hero-actions">
            <Link to="/productos" className="btn btn-primary btn-lg">
              EXPLORAR COLECCIÓN
              <ArrowUpRight size={18} />
            </Link>
            <Link to="/productos?category=oversize" className="btn btn-outline btn-lg">
              LÍNEA OVERSIZE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
