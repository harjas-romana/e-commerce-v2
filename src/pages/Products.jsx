// src/pages/Products.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/api/products${selectedCategory ? `?category=${selectedCategory}` : ''}`),
          api.get('/api/categories'),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleCategoryChange = (cat) =>
    cat ? setSearchParams({ category: cat }) : setSearchParams({});

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="products-header-inner">
          <h1 className="products-title">
            {selectedCategory
              ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
              : 'All products'}
          </h1>
          {!loading && (
            <span className="products-subtitle">
              {products.length} item{products.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
      <div className="products-filters">
        <div className="filter-scroll">
          <button onClick={() => handleCategoryChange('')} className={`filter-pill ${!selectedCategory ? 'filter-pill--active' : ''}`}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => handleCategoryChange(cat)} className={`filter-pill ${selectedCategory === cat ? 'filter-pill--active' : ''}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="products-content">
        {loading ? (
          <div className="products-loading"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <p className="products-empty-text">No products found.</p>
            <button onClick={() => handleCategoryChange('')} className="products-empty-reset">Clear filter</button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        .products-page{max-width:1280px;margin-inline:auto;padding-inline:clamp(1rem,5vw,2.5rem)}
        .products-header{padding-block:clamp(2rem,5vw,3.5rem) 0;border-bottom:1px solid var(--color-border);margin-bottom:0}
        .products-header-inner{display:flex;align-items:baseline;gap:1rem;padding-bottom:1.25rem}
        .products-title{font-size:clamp(1.75rem,4vw,2.75rem);font-weight:700;letter-spacing:-.03em;color:var(--color-fg)}
        .products-subtitle{font-size:.85rem;color:var(--color-muted);font-weight:500}
        .products-filters{padding-block:1.25rem;border-bottom:1px solid var(--color-border);margin-bottom:2rem}
        .filter-scroll{display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
        .filter-scroll::-webkit-scrollbar{display:none}
        .filter-pill{font-family:var(--font-sans);font-size:.825rem;font-weight:500;color:var(--color-muted);background:transparent;border:1.5px solid var(--color-border);border-radius:99px;padding:.375rem 1rem;cursor:pointer;white-space:nowrap;transition:color var(--transition),background var(--transition),border-color var(--transition)}
        .filter-pill:hover{color:var(--color-fg);border-color:#b0afa9}
        .filter-pill--active{background:var(--color-fg);color:#fafaf9;border-color:var(--color-fg)}
        .products-content{padding-bottom:clamp(3rem,8vw,6rem)}
        .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem}
        .products-loading{display:flex;justify-content:center;align-items:center;min-height:320px}
        .spinner{width:36px;height:36px;border:2.5px solid var(--color-border);border-top-color:var(--color-fg);border-radius:50%;animation:spin 600ms linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .products-empty{min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem}
        .products-empty-text{font-size:1rem;color:var(--color-muted)}
        .products-empty-reset{font-family:var(--font-sans);font-size:.85rem;font-weight:600;color:var(--color-fg);background:none;border:1.5px solid var(--color-fg);border-radius:99px;padding:.4rem 1.1rem;cursor:pointer;transition:background var(--transition),color var(--transition)}
        .products-empty-reset:hover{background:var(--color-fg);color:#fafaf9}
      `}</style>
    </div>
  );
};

export default Products;