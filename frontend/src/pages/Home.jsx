import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function fetchCategories() {
    try {
      const res = await api.get('/products/categories');
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch {
      // Fallback
    }
  }

  async function fetchProducts(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await api.get('/products', { params });
      setProducts(res.data.products);

      if (!category) {
        const unique = [...new Set(res.data.products.map((p) => p.category).filter(Boolean))];
        setCategories((prev) => (prev.length > 0 ? prev : unique));
      }
    } catch (err) {
      setError('Could not load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // Filter & sort products locally for instant response
  const displayedProducts = products
    .filter((p) => {
      if (!maxPrice) return true;
      return Number(p.price) <= Number(maxPrice);
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // 'featured' (default DB order)
    });

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('featured');
    setMaxPrice('');
  };

  return (
    <div className="page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-tag">✨ Summer Deals & New Arrivals</span>
          <h1 className="hero-title">Discover Quality Products Crafted for You</h1>
          <p className="hero-subtitle">
            Explore premium electronics, fashion, and home essentials with ultra-fast delivery.
          </p>
          <div className="hero-actions">
            <button
              onClick={() => {
                clearAllFilters();
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-hero-primary"
            >
              Shop All Products
            </button>
          </div>
        </div>
      </section>

      <div id="catalog" className="catalog-header">
        <div>
          <h2>Explore Catalog</h2>
          <p className="muted">Showing {displayedProducts.length} of {products.length} products</p>
        </div>
        
        {/* Sort and Price controls */}
        <div className="catalog-toolbar">
          <div className="filter-group">
            <label>Max Price (₹):</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-filter-input"
              min="0"
            />
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">✨ Featured / Newest</option>
              <option value="price-low">💵 Price: Low to High</option>
              <option value="price-high">💎 Price: High to Low</option>
              <option value="name">🔤 Name (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills" role="tablist">
        <button
          className={`pill-btn ${category === '' ? 'active' : ''}`}
          onClick={() => setCategory('')}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`pill-btn ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c === category ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <form className="filters" onSubmit={fetchProducts}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit">Search</button>
        {(search || category || maxPrice || sortBy !== 'featured') && (
          <button
            type="button"
            className="btn-clear-filter"
            onClick={clearAllFilters}
          >
            Clear Filters
          </button>
        )}
      </form>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <div className="product-grid skeleton-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="product-card skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-line title"></div>
              <div className="skeleton-line subtitle"></div>
              <div className="skeleton-footer">
                <div className="skeleton-line price"></div>
                <div className="skeleton-line btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="product-grid">
          {displayedProducts.length === 0 ? (
            <div className="empty-state">
              <p>No products found matching your search or filters.</p>
              <button className="btn-secondary" onClick={clearAllFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            displayedProducts.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      )}
    </div>
  );
}


