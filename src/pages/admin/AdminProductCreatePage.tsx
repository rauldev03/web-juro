import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import AdminHeader from '../../components/layout/AdminHeader';
import ImageUploader from '../../components/admin/ImageUploader';
import StockMatrixInput from '../../components/admin/StockMatrixInput';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Category, Color, Size, ProductImage, ProductVariant } from '../../types';

export const AdminProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([
    { image_url: '/images/products/polo-black-essential.jpg', is_primary: 1, sort_order: 0 }
  ]);

  // Taxonomies
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);

  // Selected Color and Size IDs for Matrix
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [selectedSizeIds, setSelectedSizeIds] = useState<number[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [catsRes, colsRes, sizesRes] = await Promise.all([
          api.categories.getAll(),
          api.colors.getAll(),
          api.sizes.getAll()
        ]);

        setCategories(catsRes.data);
        setAvailableColors(colsRes.data);
        setAvailableSizes(sizesRes.data);

        // Preselect first category and first 2 colors / sizes by default for convenience
        if (catsRes.data.length > 0) setCategoryId(catsRes.data[0].id.toString());
        if (colsRes.data.length >= 2) {
          setSelectedColorIds([colsRes.data[0].id, colsRes.data[1].id]);
        }
        if (sizesRes.data.length >= 4) {
          setSelectedSizeIds([sizesRes.data[1].id, sizesRes.data[2].id, sizesRes.data[3].id]); // S, M, L
        }
      } catch (e) {
        console.error('Error loading metadata', e);
      }
    };

    loadTaxonomies();
  }, []);

  // Sync variants when selected colors or sizes change
  const handleToggleColor = (colorId: number) => {
    setSelectedColorIds(prev => {
      const exists = prev.includes(colorId);
      const updated = exists ? prev.filter(id => id !== colorId) : [...prev, colorId];
      syncVariants(updated, selectedSizeIds);
      return updated;
    });
  };

  const handleToggleSize = (sizeId: number) => {
    setSelectedSizeIds(prev => {
      const exists = prev.includes(sizeId);
      const updated = exists ? prev.filter(id => id !== sizeId) : [...prev, sizeId];
      syncVariants(selectedColorIds, updated);
      return updated;
    });
  };

  const syncVariants = (colorIds: number[], sizeIds: number[]) => {
    setVariants(prev => {
      const newVariants: ProductVariant[] = [];
      for (const cId of colorIds) {
        for (const sId of sizeIds) {
          const existing = prev.find(v => v.color_id === cId && v.size_id === sId);
          newVariants.push({
            color_id: cId,
            size_id: sId,
            stock: existing ? existing.stock : 10
          });
        }
      }
      return newVariants;
    });
  };

  const handleChangeVariantStock = (colorId: number, sizeId: number, stock: number) => {
    setVariants(prev => {
      const idx = prev.findIndex(v => v.color_id === colorId && v.size_id === sizeId);
      const cleanStock = Math.max(0, stock);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], stock: cleanStock };
        return updated;
      } else {
        return [...prev, { color_id: colorId, size_id: sizeId, stock: cleanStock }];
      }
    });
  };

  const handleBulkSetStock = (amount: number) => {
    setVariants(prev => prev.map(v => ({ ...v, stock: amount })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Ingresa el nombre del producto', 'error');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      showToast('Ingresa un precio válido mayor a 0', 'error');
      return;
    }

    if (variants.length === 0) {
      showToast('Selecciona al menos 1 color y 1 talla para generar variantes de stock', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category_id: categoryId ? parseInt(categoryId) : null,
        active: active ? 1 : 0,
        featured: featured ? 1 : 0,
        images: images.map((img, idx) => ({
          image_url: img.image_url,
          is_primary: img.is_primary ? 1 : (idx === 0 ? 1 : 0),
          sort_order: idx
        })),
        variants: variants.map(v => ({
          color_id: v.color_id,
          size_id: v.size_id,
          stock: parseInt(v.stock as any) || 0
        }))
      };

      const res = await api.products.create(payload);
      if (res.success) {
        showToast('¡Producto creado exitosamente y disponible en tienda!', 'success');
        navigate('/admin/productos');
      }
    } catch (err: any) {
      showToast(err.message || 'Error al guardar producto', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        <AdminHeader
          title="AGREGAR NUEVO POLO"
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        <main className="admin-content">
          <div style={{ marginBottom: '1.5rem' }}>
            <Link
              to="/admin/productos"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              <ArrowLeft size={14} /> Volver a Lista de Productos
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 1. Basic Information */}
            <div className="form-card">
              <h3 className="form-card-title">1. INFORMACIÓN PRINCIPAL DE LA PRENDA</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Polo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Polo Oversize Raw Black"
                    className="form-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Precio de Venta (S/) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    placeholder="Ej: 59.90"
                    className="form-input"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría / Corte *</label>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Descripción & Detalles del Tejido</label>
                <textarea
                  className="form-textarea"
                  placeholder="Detalles sobre gramaje (GSM), tipo de algodón, corte y acabados..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#FFFFFF' }}
                  />
                  <span>Producto Activo (Visible en tienda)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#FFFFFF' }}
                  />
                  <span>Prenda Destacada en Portada</span>
                </label>
              </div>
            </div>

            {/* 2. Image Gallery Manager */}
            <div className="form-card">
              <h3 className="form-card-title">2. FOTOGRAFÍAS DE LA PRENDA ({images.length})</h3>
              <ImageUploader images={images} onChange={setImages} />
            </div>

            {/* 3. Interactive Color x Size Stock Matrix */}
            <div className="form-card">
              <h3 className="form-card-title">3. COLORES, TALLAS Y MATRIZ DE STOCK</h3>
              <StockMatrixInput
                availableColors={availableColors}
                availableSizes={availableSizes}
                selectedColorIds={selectedColorIds}
                selectedSizeIds={selectedSizeIds}
                onToggleColor={handleToggleColor}
                onToggleSize={handleToggleSize}
                variants={variants}
                onChangeVariantStock={handleChangeVariantStock}
                onBulkSetStock={handleBulkSetStock}
              />
            </div>

            {/* Submit Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Link to="/admin/productos" className="btn btn-outline">
                CANCELAR
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={18} />
                {submitting ? 'GUARDANDO POLO...' : 'GUARDAR Y PUBLICAR PRODUCTO'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AdminProductCreatePage;
