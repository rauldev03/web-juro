import React from 'react';
import type { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="product-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#141414', border: '1px solid #1F1F1F' }} />
            <div style={{ width: '60%', height: '14px', backgroundColor: '#1C1C1C' }} />
            <div style={{ width: '40%', height: '14px', backgroundColor: '#1C1C1C' }} />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', border: '1px solid #1A1A1A', backgroundColor: '#121212' }}>
        <h3 style={{ textTransform: 'uppercase', marginBottom: '0.75rem', fontSize: '1.25rem' }}>
          No se encontraron polos con estos filtros
        </h3>
        <p style={{ color: '#737373', fontSize: '0.85rem' }}>
          Prueba a restablecer los filtros para ver todas nuestras prendas disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid animate-fade-in">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
