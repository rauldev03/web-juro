import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Power, Eye } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Product, Category } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.products.getAdminAll({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined
      });
      setProducts(res.data);
    } catch (err: any) {
      showToast(err.message || 'Error cargando productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.categories.getAll();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.active === 1 ? false : true;
    try {
      await api.products.toggleStatus(product.id, newStatus);
      showToast(`Producto ${newStatus ? 'activado' : 'desactivado'} en tienda`, 'success');
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, active: newStatus ? 1 : 0 } : p))
      );
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto y todas sus variantes de forma permanente?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.products.delete(id);
      showToast('Producto eliminado exitosamente', 'success');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar el producto', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <AdminHeader
          title="GESTIÓN DE PRODUCTOS"
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        <main className="admin-content">
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', textTransform: 'uppercase' }}>
                CATÁLOGO DE PRENDAS ({products.length})
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.2rem' }}>
                Crea, edita o desactiva polos y administra fotos y variantes de stock.
              </p>
            </div>

            <Link to="/admin/productos/nuevo" className="btn btn-primary">
              <Plus size={16} /> AGREGAR PRODUCTO
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={16} color="#737373" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre de polo..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '200px' }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Products Table */}
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>IMAGEN</th>
                  <th>PRODUCTO</th>
                  <th>CATEGORÍA</th>
                  <th>PRECIO</th>
                  <th>STOCK TOTAL</th>
                  <th>ESTADO</th>
                  <th style={{ textAlign: 'right' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#737373' }}>
                      Cargando catálogo...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#737373' }}>
                      No se encontraron productos. Crea el primero haciendo clic en "Agregar Producto".
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id}>
                      <td style={{ width: '60px' }}>
                        <img
                          src={product.primary_image || '/images/products/polo-black-essential.jpg'}
                          alt={product.name}
                          className="table-img-thumb"
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#737373', marginTop: '0.2rem' }}>
                          Slug: /{product.slug}
                        </div>
                      </td>
                      <td>{product.category_name || 'Sin categoría'}</td>
                      <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                        S/ {product.price.toFixed(2)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: (product.total_stock ?? 0) <= 5 ? '#D4A373' : '#FFFFFF' }}>
                          {product.total_stock ?? 0} u.
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`status-pill ${product.active ? 'status-active' : 'status-inactive'}`}
                          style={{ cursor: 'pointer', border: '1px solid transparent' }}
                          title="Clic para cambiar estado"
                        >
                          <Power size={11} />
                          {product.active ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          <Link
                            to={`/producto/${product.slug}`}
                            target="_blank"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Ver en tienda pública"
                          >
                            <Eye size={13} />
                          </Link>

                          <Link
                            to={`/admin/productos/${product.id}/editar`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem' }}
                            title="Editar prenda"
                          >
                            <Edit2 size={13} /> Editar
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem', borderColor: '#402020', color: '#E8CECE' }}
                            title="Eliminar producto"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminProductsPage;
