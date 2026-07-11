import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const emptyForm = { name: '', description: '', price: '', category: '', image_url: '', stock: '' };
const LOW_STOCK_THRESHOLD = 5;

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  // Inventory tab state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortKey, setSortKey] = useState('stock');
  const [sortDir, setSortDir] = useState('asc');
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  // Orders tab: track which order row is expanded and its fetched line items
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItemsById, setOrderItemsById] = useState({});
  const [loadingItemsFor, setLoadingItemsFor] = useState(null);

  useEffect(() => {
    if (tab === 'stats') loadStats();
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'inventory') loadProducts();
  }, [tab]);

  async function loadStats() {
    const res = await api.get('/admin/stats');
    setStats(res.data);
  }
  async function loadProducts() {
    const res = await api.get('/products');
    setProducts(res.data.products);
  }
  async function loadOrders() {
    const res = await api.get('/admin/orders');
    setOrders(res.data.orders);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      image_url: product.image_url || '',
      stock: product.stock,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  async function handleStatusChange(orderId, status) {
    await api.put(`/admin/orders/${orderId}/status`, { status });
    loadOrders();
  }

  async function toggleOrderItems(orderId) {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderItemsById[orderId]) {
      setLoadingItemsFor(orderId);
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrderItemsById((prev) => ({ ...prev, [orderId]: res.data.items }));
      } finally {
        setLoadingItemsFor(null);
      }
    }
  }

  // ---- Inventory helpers ----

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === 'name' || sortKey === 'category') {
      av = (av || '').toLowerCase();
      bv = (bv || '').toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    av = Number(av);
    bv = Number(bv);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === sortedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProducts.map((p) => p.id)));
    }
  }

  async function saveStock(id, currentStock, newValue) {
    const stock = Math.max(0, Math.floor(Number(newValue)));
    if (Number.isNaN(stock) || stock === currentStock) return;
    await api.put(`/products/${id}`, { stock });
    loadProducts();
  }

  async function applyBulkAdjustment(direction) {
    const amount = Number(bulkAmount);
    if (!amount || selectedIds.size === 0) return;
    const targets = products.filter((p) => selectedIds.has(p.id));
    await Promise.all(
      targets.map((p) => {
        const newStock = Math.max(0, p.stock + direction * amount);
        return api.put(`/products/${p.id}`, { stock: newStock });
      })
    );
    setBulkMessage(`${direction > 0 ? 'Added' : 'Removed'} ${amount} stock for ${targets.length} product(s).`);
    setBulkAmount('');
    setSelectedIds(new Set());
    loadProducts();
  }

  async function applyBulkSet() {
    const value = Number(bulkAmount);
    if (bulkAmount === '' || Number.isNaN(value) || value < 0 || selectedIds.size === 0) return;
    const targets = products.filter((p) => selectedIds.has(p.id));
    await Promise.all(targets.map((p) => api.put(`/products/${p.id}`, { stock: value })));
    setBulkMessage(`Set stock to ${value} for ${targets.length} product(s).`);
    setBulkAmount('');
    setSelectedIds(new Set());
    loadProducts();
  }

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>Stats</button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
        <button className={tab === 'inventory' ? 'active' : ''} onClick={() => setTab('inventory')}>Inventory</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
      </div>

      {tab === 'stats' && stats && (
        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.totalProducts}</h3><p>Products</p></div>
          <div className="stat-card"><h3>{stats.totalOrders}</h3><p>Orders</p></div>
          <div className="stat-card"><h3>₹{stats.totalRevenue.toFixed(0)}</h3><p>Revenue</p></div>
          <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Users</p></div>
        </div>
      )}

      {tab === 'products' && (
        <>
          <form onSubmit={handleSubmit} className="admin-product-form">
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <div className="form-row">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="form-row">
              <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            {error && <p className="error-text">{error}</p>}
            <div className="form-row">
              <button type="submit">{editingId ? 'Update' : 'Create'}</button>
              {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <div className="table-scroll">
          <table className="cart-table">
            <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>₹{Number(p.price).toFixed(0)}</td>
                  <td>{p.stock}</td>
                  <td>{p.category}</td>
                  <td>
                    <button className="btn-link" onClick={() => startEdit(p)}>Edit</button>{' '}
                    <button className="btn-link" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {tab === 'inventory' && (
        <>
          <div className="inventory-toolbar">
            <div className="bulk-actions">
              <span>{selectedIds.size} selected</span>
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
              />
              <button type="button" onClick={() => applyBulkAdjustment(1)} disabled={!selectedIds.size || !bulkAmount}>
                + Add
              </button>
              <button type="button" onClick={() => applyBulkAdjustment(-1)} disabled={!selectedIds.size || !bulkAmount}>
                − Subtract
              </button>
              <button type="button" onClick={applyBulkSet} disabled={!selectedIds.size || bulkAmount === ''}>
                Set to
              </button>
              {selectedIds.size > 0 && (
                <button type="button" className="btn-link" onClick={() => setSelectedIds(new Set())}>
                  Clear selection
                </button>
              )}
            </div>
          </div>
          {bulkMessage && <p className="success-text">{bulkMessage}</p>}
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Select products with the checkboxes, then add/subtract/set stock for all of them at once.
            Rows highlighted amber are below {LOW_STOCK_THRESHOLD} units; red rows are out of stock.
            Click a column header to sort. You can also edit a single product's stock directly in the table.
          </p>

          <div className="table-scroll">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === sortedProducts.length && sortedProducts.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="sortable" onClick={() => toggleSort('name')}>
                    Name {sortKey === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Category</th>
                  <th className="sortable" onClick={() => toggleSort('price')}>
                    Price {sortKey === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => toggleSort('stock')}>
                    Stock {sortKey === 'stock' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => {
                  const isOut = p.stock === 0;
                  const isLow = !isOut && p.stock < LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={p.id} className={isOut ? 'row-out' : isLow ? 'row-low' : ''}>
                      <td>
                        <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                      </td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>₹{Number(p.price).toFixed(0)}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className="stock-input"
                          defaultValue={p.stock}
                          key={`${p.id}-${p.stock}`}
                          onBlur={(e) => saveStock(p.id, p.stock, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.target.blur();
                          }}
                        />
                      </td>
                      <td>
                        {isOut ? (
                          <span className="status-badge status-cancelled">Out of stock</span>
                        ) : isLow ? (
                          <span className="status-badge status-pending">Low stock</span>
                        ) : (
                          <span className="status-badge status-delivered">In stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="table-scroll">
        <table className="cart-table">
          <thead><tr><th></th><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td>
                    <button type="button" className="btn-link" onClick={() => toggleOrderItems(o.id)}>
                      {expandedOrderId === o.id ? '▾ Hide' : '▸ View items'}
                    </button>
                  </td>
                  <td>#{o.id}</td>
                  <td>{o.customer_name} ({o.customer_email})</td>
                  <td>₹{Number(o.total).toFixed(0)}</td>
                  <td>
                    <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
                {expandedOrderId === o.id && (
                  <tr key={`${o.id}-items`} className="order-items-row">
                    <td colSpan={5}>
                      {loadingItemsFor === o.id ? (
                        <p className="muted">Loading items...</p>
                      ) : (
                        <table className="cart-table order-items-subtable">
                          <thead>
                            <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
                          </thead>
                          <tbody>
                            {(orderItemsById[o.id] || []).map((item) => (
                              <tr key={item.id}>
                                <td>{item.product_name}</td>
                                <td>₹{Number(item.price).toFixed(0)}</td>
                                <td>{item.quantity}</td>
                                <td>₹{(Number(item.price) * item.quantity).toFixed(0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <p className="muted" style={{ marginTop: '0.5rem' }}>
                        <Link to={`/orders/${o.id}`}>Open full order page →</Link>
                      </p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
