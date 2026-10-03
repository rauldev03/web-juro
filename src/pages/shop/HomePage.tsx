import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, RefreshCw } from 'lucide-react';
import Hero from '../../components/shop/Hero';
import ProductGrid from '../../components/shop/ProductGrid';
import ProductFilters from '../../components/shop/ProductFilters';
import { api } from '../../services/api';
import type { Product, Category, Color, Size } from '../../types';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catsRes, colsRes, sizesRes] = await Promise.all([
          api.categories.getAll(),
          api.colors.getAll(),
          api.sizes.getAll()
        ]);

        setCategories(catsRes.data);
        setColors(colsRes.data);
        setSizes(sizesRes.data);
      } catch (err) {
        console.error('Error loading taxonomy', err);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.products.getAll({
          category: selectedCategory,
          color: selectedColor,
          size: selectedSize
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedColor, selectedSize]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedSize('all');
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Brand Value Proposition Banner */}
      <section style={{ backgroundColor: '#0D0D0D', borderBottom: '1px solid #1C1C1C', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#171717', border: '1px solid #262626' }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ALGODÓN 280-320 GSM</h4>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
                Tejido denso de alta durabilidad y caída perfecta. No se deforma con el uso continuo.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#171717', border: '1px solid #262626' }}>
              <Shield size={20} color="#FFFFFF" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PATRONAJE EXCLUSIVO</h4>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
                Hombros caídos estructurados y cuello polo abierto sin ribetes plásticos.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#171717', border: '1px solid #262626' }}>
              <RefreshCw size={20} color="#FFFFFF" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>STOCK EN TIEMPO REAL</h4>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
                Disponibilidad exacta por talla y color con despacho prioritario en todo el país.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog & Interactive Filter Section */}
      <section className="catalog-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-subtitle">CATÁLOGO COMPLETO</span>
              <h2 className="section-title">COLECCIÓN DE POLOS</h2>
            </div>

            <Link
              to="/productos"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              VER TODOS LOS POLOS
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Dynamic Filters */}
          <ProductFilters
            categories={categories}
            colors={colors}
            sizes={sizes}
            selectedCategory={selectedCategory}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectCategory={setSelectedCategory}
            onSelectColor={setSelectedColor}
            onSelectSize={setSelectedSize}
            onReset={handleResetFilters}
          />

          {/* Product Grid */}
          <ProductGrid products={products} isLoading={loading} />
        </div>
      </section>

      {/* 4. Editorial Streetwear Statement */}
      <section style={{ backgroundColor: '#070707', borderTop: '1px solid #1F1F1F', borderBottom: '1px solid #1F1F1F', padding: '6rem 0' }}>
        <div className="container-narrow" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.25em', color: '#737373', textTransform: 'uppercase' }}>
            MANIFIESTO JURO
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', margin: '1.25rem 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            "MENOS ELEMENTOS, MAYOR IMPACTO. ROPA DISEÑADA PARA HABLAR SIN RUIDO."
          </h2>
          <p style={{ maxWidth: '650px', margin: '0 auto 2.5rem auto', color: '#A3A3A3', fontSize: '1rem', lineHeight: 1.7 }}>
            Nuestras prendas prescinden de estampados estridentes para dar paso a la pureza geométrica, gramajes pesados y una paleta neutra atemporal.
          </p>
          <Link to="/productos" className="btn btn-primary btn-lg">
            DESCUBRIR PIEZAS
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
