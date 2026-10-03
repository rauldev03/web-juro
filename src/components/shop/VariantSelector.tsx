import React, { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingBag, ShieldAlert } from 'lucide-react';
import type { Product, Color, Size, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface VariantSelectorProps {
  product: Product;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const colors = product.colors || [];
  const sizes = product.sizes || [];
  const variants = product.variants || [];

  const [selectedColor, setSelectedColor] = useState<Color | null>(() => colors[0] || null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(() => sizes[0] || null);
  const [quantity, setQuantity] = useState<number>(1);

  // Sync when product changes
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      setSelectedColor(colors[0]);
    }
    if (sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
    setQuantity(1);
  }, [product, colors, sizes]);

  // Find exact variant
  const currentVariant: ProductVariant | undefined = variants.find(
    v => v.color_id === selectedColor?.id && v.size_id === selectedSize?.id
  );

  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isAvailable = currentStock > 0;

  // Helper to check stock for a specific size under current selected color
  const getSizeStock = (sizeId: number): number => {
    if (!selectedColor) return 0;
    const v = variants.find(item => item.color_id === selectedColor.id && item.size_id === sizeId);
    return v ? v.stock : 0;
  };

  const handleAdd = () => {
    if (!selectedColor || !selectedSize || !currentVariant) {
      showToast('Por favor selecciona un color y una talla', 'error');
      return;
    }

    if (currentStock <= 0) {
      showToast('Esta combinación de talla y color está agotada', 'error');
      return;
    }

    const res = addToCart(product, selectedColor, selectedSize, currentVariant, quantity);
    if (res.success) {
      showToast(`Agregado: ${product.name} (${selectedColor.name} / ${selectedSize.name})`, 'success');
    } else {
      showToast(res.message || 'Error al agregar', 'error');
    }
  };

  return (
    <div className="variant-selector-container">
      {/* 1. Color Selection */}
      <div className="variant-block">
        <div className="variant-header">
          <span className="variant-title">COLOR:</span>
          <span className="variant-selected-value">{selectedColor?.name || 'Selecciona'}</span>
        </div>
        <div className="color-options-grid">
          {colors.map(col => (
            <button
              key={col.id}
              className={`color-option-btn ${selectedColor?.id === col.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedColor(col);
                setQuantity(1);
              }}
            >
              <span
                className="color-swatch-circle"
                style={{ backgroundColor: col.hex_code }}
              />
              {col.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Size Selection */}
      <div className="variant-block">
        <div className="variant-header">
          <span className="variant-title">TALLA:</span>
          <span className="variant-selected-value">{selectedSize?.name || 'Selecciona'}</span>
        </div>
        <div className="size-options-grid">
          {sizes.map(sz => {
            const sizeStock = getSizeStock(sz.id);
            const isOutOfStock = sizeStock <= 0;
            return (
              <button
                key={sz.id}
                className={`size-option-btn ${selectedSize?.id === sz.id ? 'active' : ''}`}
                disabled={isOutOfStock}
                onClick={() => {
                  setSelectedSize(sz);
                  setQuantity(1);
                }}
                title={isOutOfStock ? `${sz.name} - Agotado` : `${sz.name} (${sizeStock} disponibles)`}
              >
                {sz.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Live Stock Availability Indicator */}
      <div className="stock-status-box">
        <div
          className={`stock-status-dot ${
            currentStock > 5 ? 'in-stock' : (currentStock > 0 ? 'low-stock' : 'out-stock')
          }`}
        />
        <div>
          {currentStock > 5 && (
            <span>Stock disponible ({currentStock} unidades en almacén)</span>
          )}
          {currentStock > 0 && currentStock <= 5 && (
            <span style={{ color: '#EFE8D6' }}>
              ¡Últimas {currentStock} unidades disponibles en {selectedColor?.name} / {selectedSize?.name}!
            </span>
          )}
          {currentStock <= 0 && (
            <span style={{ color: '#888888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={14} /> Agotado temporalmente en {selectedColor?.name} / {selectedSize?.name}
            </span>
          )}
        </div>
      </div>

      {/* 4. Quantity Stepper & Add to Bag Button */}
      <div className="quantity-add-row">
        <div className="quantity-stepper">
          <button
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={!isAvailable || quantity <= 1}
            aria-label="Disminuir cantidad"
          >
            <Minus size={14} />
          </button>
          <input
            type="text"
            readOnly
            value={isAvailable ? quantity : 0}
            aria-label="Cantidad seleccionada"
          />
          <button
            onClick={() => setQuantity(prev => Math.min(currentStock, prev + 1))}
            disabled={!isAvailable || quantity >= currentStock}
            aria-label="Aumentar cantidad"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          className="btn btn-primary btn-full"
          disabled={!isAvailable}
          onClick={handleAdd}
          style={{ height: '48px' }}
        >
          <ShoppingBag size={18} />
          {isAvailable ? 'AGREGAR AL CARRITO' : 'SIN STOCK DISPONIBLE'}
        </button>
      </div>
    </div>
  );
};

export default VariantSelector;
