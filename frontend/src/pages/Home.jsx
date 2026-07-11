import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

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
    } catch (err) {
      setError('Could not load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div className="page">
      <h1>Our Products</h1>

      <form className="filters" onSubmit={fetchProducts}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit">Search</button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      )}
    </div>
  );
}
