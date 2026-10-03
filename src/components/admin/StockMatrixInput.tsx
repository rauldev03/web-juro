import React from 'react';
import type { Color, Size, ProductVariant } from '../../types';

interface StockMatrixInputProps {
  availableColors: Color[];
  availableSizes: Size[];
  selectedColorIds: number[];
  selectedSizeIds: number[];
  onToggleColor: (colorId: number) => void;
  onToggleSize: (sizeId: number) => void;
  variants: ProductVariant[];
  onChangeVariantStock: (colorId: number, sizeId: number, stock: number) => void;
  onBulkSetStock: (amount: number) => void;
}

export const StockMatrixInput: React.FC<StockMatrixInputProps> = ({
  availableColors,
  availableSizes,
  selectedColorIds,
  selectedSizeIds,
  onToggleColor,
  onToggleSize,
  variants,
  onChangeVariantStock,
  onBulkSetStock
}) => {
  // Filter selected color and size objects
  const activeColors = availableColors.filter(c => selectedColorIds.includes(c.id));
  const activeSizes = availableSizes
    .filter(s => selectedSizeIds.includes(s.id))
    .sort((a, b) => a.sort_order - b.sort_order);

  // Helper to get stock for a given (colorId, sizeId)
  const getStock = (colorId: number, sizeId: number): number => {
    const found = variants.find(v => v.color_id === colorId && v.size_id === sizeId);
    return found ? found.stock : 0;
  };

  const totalCalculatedStock = variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);

  return (
    <div className="stock-matrix-section">
      {/* 1. Select Colors */}
      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">1. SELECCIONA LOS COLORES DISPONIBLES</label>
        <div className="checkbox-options-grid">
          {availableColors.map(color => {
            const isSelected = selectedColorIds.includes(color.id);
            return (
              <div
                key={color.id}
                className={`checkbox-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => onToggleColor(color.id)}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color.hex_code,
                    border: '1px solid #444'
                  }}
                />
                <span>{color.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Select Sizes */}
      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label className="form-label">2. SELECCIONA LAS TALLAS DISPONIBLES</label>
        <div className="checkbox-options-grid">
          {availableSizes.map(size => {
            const isSelected = selectedSizeIds.includes(size.id);
            return (
              <div
                key={size.id}
                className={`checkbox-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => onToggleSize(size.id)}
              >
                <span>{size.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Generated Stock Matrix */}
      {activeColors.length > 0 && activeSizes.length > 0 ? (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #222222', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                MATRIZ DE STOCK POR VARIANTE (COLOR × TALLA)
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.2rem' }}>
                Ingresa la cantidad exacta de inventario disponible por cada variante.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onBulkSetStock(10)}
                style={{ fontSize: '0.7rem' }}
              >
                Poner 10 a todas
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onBulkSetStock(0)}
                style={{ fontSize: '0.7rem' }}
              >
                Poner 0 a todas
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="stock-matrix-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '160px' }}>COLOR</th>
                  {activeSizes.map(size => (
                    <th key={size.id}>{size.name}</th>
                  ))}
                  <th>TOTAL COLOR</th>
                </tr>
              </thead>
              <tbody>
                {activeColors.map(color => {
                  let colorTotal = 0;
                  return (
                    <tr key={color.id}>
                      <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: color.hex_code,
                            border: '1px solid #444'
                          }}
                        />
                        {color.name}
                      </td>

                      {activeSizes.map(size => {
                        const stockVal = getStock(color.id, size.id);
                        colorTotal += stockVal;
                        return (
                          <td key={size.id}>
                            <input
                              type="number"
                              min="0"
                              className="stock-matrix-input"
                              value={stockVal}
                              onChange={e => onChangeVariantStock(color.id, size.id, parseInt(e.target.value) || 0)}
                            />
                          </td>
                        );
                      })}

                      <td style={{ fontWeight: 700, color: '#FFFFFF', backgroundColor: '#161616' }}>
                        {colorTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#181818' }}>
                  <td style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    TOTAL GENERAL:
                  </td>
                  {activeSizes.map(size => {
                    const sizeTotal = activeColors.reduce((acc, c) => acc + getStock(c.id, size.id), 0);
                    return (
                      <td key={size.id} style={{ fontWeight: 700, color: '#A3A3A3' }}>
                        {sizeTotal}
                      </td>
                    );
                  })}
                  <td style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem', backgroundColor: '#222222' }}>
                    {totalCalculatedStock} u.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.5rem', backgroundColor: '#161616', border: '1px dashed #333333', textAlign: 'center', color: '#737373', fontSize: '0.85rem' }}>
          Selecciona al menos 1 color y 1 talla arriba para generar la matriz de inventario.
        </div>
      )}
    </div>
  );
};

export default StockMatrixInput;
