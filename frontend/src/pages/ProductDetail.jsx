import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data.product);
      // Fetch related products from same category
      if (res.data.product?.category) {
        api.get(`/products?category=${encodeURIComponent(res.data.product.category)}`).then((catRes) => {
          const others = catRes.data.products.filter((p) => p.id !== Number(id)).slice(0, 4);
          setRelatedProducts(others);
        });
      }
    });
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      addToast('Please login to add items to your cart', 'info');
      navigate('/login');
      return;
    }
    if (product.stock <= 0) {
      addToast('This product is out of stock', 'error');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      addToast(`Added ${quantity}x ${product.name} to cart! 🛍️`, 'success');
    } catch {
      addToast('Could not add to cart.', 'error');
    } finally {
      setAdding(false);
    }
  }

  if (!product) return <p className="page">Loading product details...</p>;

  const isFavorite = isInWishlist(product.id);
  const ratingScore = (4.3 + ((product.id * 7) % 7) / 10).toFixed(1);
  const reviewCount = 20 + ((product.id * 31) % 190);

  return (
    <div className="page product-detail-page">
      <Link to="/" className="btn-link" style={{ marginBottom: '1.25rem', display: 'inline-block' }}>
        ← Back to Catalog
      </Link>

      <div className="product-detail">
        <div className="product-detail-media">
          <img src={product.image_url} alt={product.name} className="product-detail-img" />
          <button
            onClick={() => toggleWishlist(product)}
            className={`wishlist-heart-btn detail-wishlist-btn ${isFavorite ? 'in-wishlist' : ''}`}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="product-detail-info">
          <span className="hero-tag" style={{ margin: 0, fontSize: '0.74rem' }}>{product.category}</span>
          <h1 style={{ marginTop: '0.5rem' }}>{product.name}</h1>
          
          <div className="detail-rating-row">
            <span className="product-card-rating">
              ★ {ratingScore}
            </span>
            <span className="muted">({reviewCount} customer reviews)</span>
            <span className="verified-badge">✓ Verified Quality</span>
          </div>

          <p className="product-detail-price">₹{Number(product.price).toFixed(0)}</p>

          <p className="product-detail-desc">{product.description}</p>

          {/* Stock Meter */}
          <div className="stock-status-box">
            {product.stock > 0 ? (
              <>
                <span className="stock-badge">In Stock ({product.stock} units)</span>
                {product.stock < 10 && (
                  <span className="low-stock-warning">⚡ Hurry, only {product.stock} left!</span>
                )}
              </>
            ) : (
              <span className="stock-badge out">Currently Sold Out</span>
            )}
          </div>

          {/* Quantity selector & Add to cart */}
          {product.stock > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-counter">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-hero-primary btn-add-large"
              >
                {adding ? 'Adding...' : `Add to Cart • ₹${(Number(product.price) * quantity).toFixed(0)}`}
              </button>
            </div>
          )}

          {/* Value Perks */}
          <div className="product-perks-grid">
            <div className="perk-item">
              <span className="perk-icon">🚚</span>
              <div>
                <strong>Free Express Delivery</strong>
                <p className="muted">Dispatched within 24 hours</p>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon">🔄</span>
              <div>
                <strong>7 Days Replacement</strong>
                <p className="muted">Hassle-free guarantee</p>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon">🔒</span>
              <div>
                <strong>Secure Payment</strong>
                <p className="muted">256-bit encrypted checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for specs & reviews */}
      <div className="product-extra-tabs">
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Specifications
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Customer Reviews ({reviewCount})
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="tab-panel">
            <p>{product.description}</p>
            <ul className="spec-list">
              <li><strong>Category:</strong> {product.category}</li>
              <li><strong>Model:</strong> 2026 Edition Genuine Stock</li>
              <li><strong>Condition:</strong> 100% Brand New</li>
              <li><strong>Warranty:</strong> 1 Year Official Manufacturer Warranty</li>
            </ul>
          </div>
        ) : (
          <div className="tab-panel reviews-panel">
            <div className="review-card">
              <div className="review-header">
                <strong>Rahul S.</strong> <span className="verified-buyer">✓ Verified Buyer</span>
                <span className="rating-stars">★★★★★</span>
              </div>
              <p>Exceptional quality and arrived faster than expected. Completely satisfied with this purchase!</p>
            </div>
            <div className="review-card">
              <div className="review-header">
                <strong>Sneha M.</strong> <span className="verified-buyer">✓ Verified Buyer</span>
                <span className="rating-stars">★★★★★</span>
              </div>
              <p>Top notch packaging and product feels very premium. Will definitely buy again from ShopEasy.</p>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="catalog-header">
            <h2>You Might Also Like</h2>
            <span className="muted">More in {product.category}</span>
          </div>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

