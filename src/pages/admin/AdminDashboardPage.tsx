import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Boxes,
  AlertTriangle,
  ShoppingBag,
  Plus,
  ArrowRight,
  Edit2
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import { api } from '../../services/api';
import type { DashboardStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.inventory.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Error loading dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Area */}
      <div className="admin-main">
        <AdminHeader
          title="DASHBOARD GENERAL"
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        <main className="admin-content">
          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                RESUMEN DE OPERACIONES
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.2rem' }}>
                Monitoreo en tiempo real de catálogo, variantes y niveles de stock.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/productos/nuevo" className="btn btn-primary btn-sm">
                <Plus size={15} /> NUEVO PRODUCTO
              </Link>
              <Link to="/admin/inventario" className="btn btn-outline btn-sm">
                <Boxes size={15} /> VER STOCK
              </Link>
            </div>
          </div>

          {/* KPI Metrics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">PRODUCTOS EN CATÁLOGO</span>
                <div className="stat-icon-wrapper"><Package size={20} /></div>
              </div>
              <div className="stat-value">{loading ? '...' : (stats?.totalProducts ?? 0)}</div>
              <div className="stat-footer">
                {stats?.activeProducts ?? 0} activos visibles en tienda
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">TOTAL UNIDADES STOCK</span>
                <div className="stat-icon-wrapper"><Boxes size={20} /></div>
              </div>
              <div className="stat-value">{loading ? '...' : (stats?.totalStock ?? 0)}</div>
              <div className="stat-footer">
                Suma total de todas las variantes
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">ALERTAS STOCK BAJO</span>
                <div className="stat-icon-wrapper"><AlertTriangle size={20} /></div>
              </div>
              <div className="stat-value">{loading ? '...' : (stats?.lowStockCount ?? 0)}</div>
              <div className="stat-footer">
                Variantes con 5 o menos prendas
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">PEDIDOS REGISTRADOS</span>
                <div className="stat-icon-wrapper"><ShoppingBag size={20} /></div>
              </div>
              <div className="stat-value">{loading ? '...' : (stats?.totalOrders ?? 0)}</div>
              <div className="stat-footer">
                Órdenes generadas
              </div>
            </div>
          </div>

          {/* Low Stock Warning Box */}
          {stats && stats.lowStockVariants && stats.lowStockVariants.length > 0 && (
            <div style={{ backgroundColor: '#181410', border: '1px solid #382A1B', padding: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <AlertTriangle size={18} color="#D4A373" />
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EFE8D6' }}>
                    VARIANTES CON STOCK CRÍTICO (≤ 5 UNIDADES)
                  </h3>
                </div>
                <Link to="/admin/inventario" style={{ fontSize: '0.75rem', color: '#D4A373', textDecoration: 'underline' }}>
                  Ajustar en inventario →
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {stats.lowStockVariants.map((item, idx) => (
                  <div key={idx} style={{ backgroundColor: '#100D0A', padding: '0.75rem', border: '1px solid #2B2117', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#888888' }}>{item.color_name} · Talla {item.size_name}</div>
                    </div>
                    <span className={`status-pill ${item.stock <= 0 ? 'status-out-stock' : 'status-low-stock'}`}>
                      {item.stock} u.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Products Table */}
          <div className="form-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                PRODUCTOS RECIENTES
              </h3>
              <Link to="/admin/productos" style={{ fontSize: '0.75rem', color: '#A3A3A3', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Ver todos <ArrowRight size={13} />
              </Link>
            </div>

            <div className="table-container" style={{ margin: 0, border: 'none' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>IMAGEN</th>
                    <th>PRODUCTO</th>
                    <th>CATEGORÍA</th>
                    <th>PRECIO</th>
                    <th>STOCK TOTAL</th>
                    <th>ESTADO</th>
                    <th style={{ textAlign: 'right' }}>ACCIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentProducts && stats.recentProducts.length > 0 ? (
                    stats.recentProducts.map(p => (
                      <tr key={p.id}>
                        <td style={{ width: '60px' }}>
                          <img
                            src={p.primary_image || '/images/products/polo-black-essential.jpg'}
                            alt={p.name}
                            className="table-img-thumb"
                          />
                        </td>
                        <td style={{ fontWeight: 600, color: '#FFFFFF' }}>
                          {p.name}
                        </td>
                        <td>{p.category_name || '-'}</td>
                        <td style={{ fontWeight: 700 }}>S/ {p.price.toFixed(2)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: (p.total_stock ?? 0) <= 5 ? '#D4A373' : '#FFFFFF' }}>
                            {p.total_stock ?? 0} unidades
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${p.active ? 'status-active' : 'status-inactive'}`}>
                            {p.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link
                            to={`/admin/productos/${p.id}/editar`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem' }}
                          >
                            <Edit2 size={13} /> Editar
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#737373', padding: '2rem' }}>
                        No hay productos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
