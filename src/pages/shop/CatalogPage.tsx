import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/shop/ProductGrid';
import ProductFilters from '../../components/shop/ProductFilters';
import { api } from '../../services/api';
import type { Product, Category, Color, Size } from '../../types';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const [catsRes, colsRes, sizesRes] = await Promise.all([
          api.categories.getAll(),
          api.colors.getAll(),
          api.sizes.getAll()
        ]);
        setCategories(catsRes.data);
        setColors(colsRes.data);
        setSizes(sizesRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadTaxonomy();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.products.getAll({
          category: selectedCategory,
          color: selectedColor,
          size: selectedSize,
          search: searchTerm
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedColor, selectedSize, searchTerm]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: slug });
    }
  };

  const handleReset = () => {
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="catalog-page" style={{ padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#737373' }}>
            COLECCIÓN DISPONIBLE
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.25rem', textTransform: 'uppercase' }}>
            TODOS LOS POLOS
          </h1>
          <p style={{ color: '#737373', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Explora nuestra gama de polos con cortes oversize, boxy fit y acabados vintage wash.
          </p>
        </div>

        {/* Filters */}
        <ProductFilters
          categories={categories}
          colors={colors}
          sizes={sizes}
          selectedCategory={selectedCategory}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          onSelectCategory={handleCategoryChange}
          onSelectColor={setSelectedColor}
          onSelectSize={setSelectedSize}
          onReset={handleReset}
        />

        {/* Results Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#737373' }}>
          <span>MOSTRANDO {products.length} MODELOS ENCONTRADOS</span>
        </div>

        {/* Grid */}
        <ProductGrid products={products} isLoading={loading} />
      </div>
    </div>
  );
};

export default CatalogPage;
