import React, { useState, useEffect } from 'react';
import { Search, Save, Check } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { InventoryItem } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Track modified stocks: { [variantId]: newStock }
  const [editedStocks, setEditedStocks] = useState<Record<number, number>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<number | null>(null);

  const { showToast } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.inventory.getAll({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setItems(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error cargando inventario', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [searchTerm, statusFilter]);

  const handleStockInputChange = (variantId: number, value: number) => {
    setEditedStocks(prev => ({
      ...prev,
      [variantId]: Math.max(0, value)
    }));
  };

  const handleSaveStock = async (variantId: number) => {
    const newStock = editedStocks[variantId];
    if (newStock === undefined) return;

    setSavingId(variantId);
    try {
      await api.inventory.updateStock(variantId, newStock);
      setSavedSuccessId(variantId);
      showToast('Stock actualizado correctamente', 'success');

      // Update local items state
      setItems(prev =>
        prev.map(item =>
          item.variant_id === variantId
            ? {
                ...item,
                stock: newStock,
                status: newStock <= 0 ? 'out_of_stock' : (newStock <= 5 ? 'low_stock' : 'in_stock')
              }
            : item
        )
      );

      // Clear from edited dictionary
      setEditedStocks(prev => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });

      setTimeout(() => setSavedSuccessId(null), 2000);
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar stock', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const totalStockUnits = items.reduce((acc, curr) => acc + curr.stock, 0);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <AdminHeader
          title="CONTROL DE INVENTARIO Y STOCK"
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        <main className="admin-content">
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', textTransform: 'uppercase' }}>
                MATRIZ DE VARIANTES ({items.length} combinaciones)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.2rem' }}>
                Ajuste granular de stock por prenda, color y talla en tiempo real.
              </p>
            </div>

            <div style={{ padding: '0.5rem 1rem', backgroundColor: '#141414', border: '1px solid #262626', fontSize: '0.82rem', fontWeight: 700 }}>
              TOTAL EN ALMACÉN: <span style={{ color: '#FFFFFF', fontSize: '1.1rem', marginLeft: '0.5rem' }}>{totalStockUnits} u.</span>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={16} color="#737373" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar por prenda, color o talla..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                TODOS
              </button>
              <button
                className={`filter-pill ${statusFilter === 'in_stock' ? 'active' : ''}`}
                onClick={() => setStatusFilter('in_stock')}
              >
                DISPONIBLE (&gt; 5)
              </button>
              <button
                className={`filter-pill ${statusFilter === 'low_stock' ? 'active' : ''}`}
                onClick={() => setStatusFilter('low_stock')}
              >
                STOCK BAJO (1-5)
              </button>
              <button
                className={`filter-pill ${statusFilter === 'out_of_stock' ? 'active' : ''}`}
                onClick={() => setStatusFilter('out_of_stock')}
              >
                SIN STOCK (0)
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>FOTO</th>
                  <th>PRODUCTO</th>
                  <th>COLOR</th>
                  <th>TALLA</th>
                  <th>STOCK ACTUAL</th>
                  <th>ESTADO</th>
                  <th style={{ textAlign: 'right' }}>AJUSTE RÁPIDO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#737373' }}>
                      Cargando inventario de variantes...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#737373' }}>
                      No se encontraron variantes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  items.map(item => {
                    const currentStock = editedStocks[item.variant_id] !== undefined
                      ? editedStocks[item.variant_id]
                      : item.stock;

                    const isModified = editedStocks[item.variant_id] !== undefined && editedStocks[item.variant_id] !== item.stock;

                    return (
                      <tr key={item.variant_id}>
                        <td style={{ width: '50px' }}>
                          <img
                            src={item.primary_image || '/images/products/polo-black-essential.jpg'}
                            alt={item.product_name}
                            className="table-img-thumb"
                            style={{ width: '40px', height: '50px' }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#737373' }}>S/ {item.product_price.toFixed(2)}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: item.color_hex,
                                border: '1px solid #444'
                              }}
                            />
                            <span>{item.color_name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, padding: '0.2rem 0.5rem', backgroundColor: '#181818', border: '1px solid #282828' }}>
                            {item.size_name}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: currentStock <= 0 ? '#888888' : '#FFFFFF' }}>
                            {item.stock} unidades
                          </span>
                        </td>
                        <td>
                          {item.status === 'in_stock' && (
                            <span className="status-pill status-active">
                              Disponible
                            </span>
                          )}
                          {item.status === 'low_stock' && (
                            <span className="status-pill status-low-stock">
                              Stock Bajo
                            </span>
                          )}
                          {item.status === 'out_of_stock' && (
                            <span className="status-pill status-out-stock">
                              Agotado
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="number"
                              min="0"
                              className="stock-matrix-input"
                              style={{ width: '65px', padding: '0.35rem 0.3rem' }}
                              value={currentStock}
                              onChange={e => handleStockInputChange(item.variant_id, parseInt(e.target.value) || 0)}
                            />

                            <button
                              onClick={() => handleSaveStock(item.variant_id)}
                              disabled={!isModified || savingId === item.variant_id}
                              className={`btn ${isModified ? 'btn-primary' : 'btn-outline'} btn-sm`}
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem' }}
                              title="Guardar nuevo stock"
                            >
                              {savingId === item.variant_id ? (
                                '...'
                              ) : savedSuccessId === item.variant_id ? (
                                <Check size={13} />
                              ) : (
                                <Save size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminInventoryPage;
