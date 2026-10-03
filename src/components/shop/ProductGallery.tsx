import React, { useState } from 'react';
import type { ProductImage } from '../../types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 
    ? images 
    : [{ image_url: '/images/products/polo-black-essential.jpg', is_primary: 1 }];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="gallery-container">
      {/* Main Large Image */}
      <div className="gallery-main">
        <img
          src={currentImage.image_url}
          alt={`${productName} - Vista ${selectedIndex + 1}`}
        />
      </div>

      {/* Thumbnails if multiple images exist */}
      {displayImages.length > 1 && (
        <div className="gallery-thumbnails">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              className={`gallery-thumb-btn ${selectedIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Ver foto ${idx + 1}`}
            >
              <img
                src={img.image_url}
                alt={`${productName} miniatura ${idx + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
