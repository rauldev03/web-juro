import React from 'react';
import type { Category, Color, Size } from '../../types';

interface ProductFiltersProps {
  categories: Category[];
  colors: Color[];
  sizes: Size[];
  selectedCategory: string;
  selectedColor: string;
  selectedSize: string;
  onSelectCategory: (catSlug: string) => void;
  onSelectColor: (colSlug: string) => void;
  onSelectSize: (sizeName: string) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  colors,
  sizes,
  selectedCategory,
  selectedColor,
  selectedSize,
  onSelectCategory,
  onSelectColor,
  onSelectSize,
  onReset
}) => {
  const hasActiveFilters =
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedColor && selectedColor !== 'all') ||
    (selectedSize && selectedSize !== 'all');

  return (
    <div className="filters-container">
      {/* Category Pills */}
      <div className="filter-row">
        <div className="filter-group">
          <span className="filter-label">CATEGORÍA:</span>
          <button
            className={`filter-pill ${selectedCategory === 'all' || !selectedCategory ? 'active' : ''}`}
            onClick={() => onSelectCategory('all')}
          >
            TODOS
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.slug)}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="filter-reset-btn" onClick={onReset}>
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Colors & Sizes Row */}
      <div className="filter-row">
        {/* Colors Filter */}
        <div className="filter-group">
          <span className="filter-label">COLOR:</span>
          <button
            className={`filter-color-btn ${selectedColor === 'all' || !selectedColor ? 'active' : ''}`}
            onClick={() => onSelectColor('all')}
          >
            Todos
          </button>
          {colors.map(col => (
            <button
              key={col.id}
              className={`filter-color-btn ${selectedColor === col.slug ? 'active' : ''}`}
              onClick={() => onSelectColor(col.slug)}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: col.hex_code,
                  border: '1px solid #444444'
                }}
              />
              {col.name}
            </button>
          ))}
        </div>

        {/* Sizes Filter */}
        <div className="filter-group">
          <span className="filter-label">TALLA:</span>
          <button
            className={`filter-pill ${selectedSize === 'all' || !selectedSize ? 'active' : ''}`}
            onClick={() => onSelectSize('all')}
          >
            Todas
          </button>
          {sizes.map(sz => (
            <button
              key={sz.id}
              className={`filter-pill ${selectedSize === sz.name ? 'active' : ''}`}
              onClick={() => onSelectSize(sz.name)}
            >
              {sz.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
