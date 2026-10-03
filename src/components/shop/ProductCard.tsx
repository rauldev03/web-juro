import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImg = product.primary_image || (product.images && product.images[0]?.image_url) || '/images/products/polo-black-essential.jpg';
  const secondaryImg = (product.images && product.images.length > 1) ? product.images[1].image_url : primaryImg;

  const isOutOfStock = product.total_stock !== undefined && product.total_stock <= 0;

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-img-wrapper">
        <img
          src={isHovered ? secondaryImg : primaryImg}
          alt={product.name}
          className="product-img-main"
          loading="lazy"
        />

        {product.featured === 1 && (
          <span className="product-card-badge">DESTACADO</span>
        )}

        {isOutOfStock && (
          <div className="product-card-out-badge">
            AGOTADO
          </div>
        )}
      </div>

      <div className="product-card-info">
        {product.category_name && (
          <span className="product-card-category">{product.category_name}</span>
        )}
        <h3 className="product-card-title">{product.name}</h3>
        <div className="product-card-price">S/ {product.price.toFixed(2)}</div>

        <div className="product-card-meta">
          <div className="product-card-colors">
            {product.colors && product.colors.map(col => (
              <span
                key={col.id}
                className="color-dot-mini"
                style={{ backgroundColor: col.hex_code }}
                title={col.name}
              />
            ))}
          </div>
          <span className="product-card-btn">VER PRENDA</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
