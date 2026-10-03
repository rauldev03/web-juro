import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Shield, RefreshCw } from 'lucide-react';
import ProductGallery from '../../components/shop/ProductGallery';
import VariantSelector from '../../components/shop/VariantSelector';
import { api } from '../../services/api';
import type { Product } from '../../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.products.getBySlugOrId(slug);
        setProduct(res.data);
      } catch (err: any) {
        setError(err.message || 'Producto no encontrado');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: '#737373' }}>
        <p>Cargando detalles de la prenda...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ textTransform: 'uppercase', marginBottom: '1rem' }}>Prenda no encontrada</h2>
        <p style={{ color: '#737373', marginBottom: '2rem' }}>El producto que buscas no existe o ha sido descontinuado.</p>
        <Link to="/productos" className="btn btn-primary">VOLVER A LA TIENDA</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb Back */}
        <div style={{ padding: '1.5rem 0 0.5rem 0' }}>
          <Link
            to="/productos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#737373' }}
          >
            <ArrowLeft size={14} /> VOLVER AL CATÁLOGO
          </Link>
        </div>

        {/* 2-Column Split Layout */}
        <div className="product-detail-layout">
          {/* Left: Photos & Gallery */}
          <div className="product-gallery-col">
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right: Info & Variant Selection */}
          <div className="product-info-panel">
            {product.category_name && (
              <span className="product-detail-category">
                LÍNEA {product.category_name}
              </span>
            )}
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-detail-price">S/ {product.price.toFixed(2)}</div>

            <p className="product-detail-desc">
              {product.description || 'Polo de silueta contemporánea confeccionado en algodón peruano de alto gramaje con acabados de confección reforzados.'}
            </p>

            {/* Interactive Color + Size + Real Stock Matrix Component */}
            <VariantSelector product={product} />

            {/* Product Specifications & Shipping info */}
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #222222', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Truck size={18} color="#737373" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>ENVÍOS A NIVEL NACIONAL</h4>
                  <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.15rem' }}>
                    Entregas en Lima en 24-48 horas. Envíos a provincias vía Olva Courier o Shalom con número de seguimiento.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <Shield size={18} color="#737373" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>COMPOSICIÓN & CUIDADO</h4>
                  <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.15rem' }}>
                    100% Algodón Peinado de 280 GSM. Lavar con agua fría y secar a la sombra para preservar el tono monocromático.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <RefreshCw size={18} color="#737373" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>CAMBIOS DE TALLA</h4>
                  <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.15rem' }}>
                    Aceptamos cambios de talla hasta 7 días posteriores a la recepción de la prenda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
