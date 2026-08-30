import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const handleMoveAllToCart = async () => {
    if (!user) {
      addToast('Please login to add items to cart', 'info');
      return;
    }
    let addedCount = 0;
    for (const product of wishlist) {
      if (product.stock > 0) {
        await addToCart(product.id, 1);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      addToast(`Moved ${addedCount} items to your cart! 🛒`, 'success');
      clearWishlist();
    } else {
      addToast('All wishlist items are currently out of stock', 'error');
    }
  };

  const handleAddSingleToCart = async (product) => {
    if (!user) {
      addToast('Please login to add items to cart', 'info');
      return;
    }
    if (product.stock <= 0) {
      addToast('This item is out of stock', 'error');
      return;
    }
    await addToCart(product.id, 1);
    addToast(`Added ${product.name} to cart!`, 'success');
    toggleWishlist(product);
  };

  if (wishlist.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🤍</span>
          <h2>Your Wishlist is Empty</h2>
          <p className="muted">Explore our catalog and click the heart icon to save products you love.</p>
          <Link to="/" className="btn-hero-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p className="muted">{wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved</p>
        </div>
        <div className="wishlist-actions">
          <button onClick={handleMoveAllToCart} className="btn-hero-primary">
            Move All to Cart
          </button>
          <button onClick={clearWishlist} className="btn-clear-filter">
            Clear Wishlist
          </button>
        </div>
      </div>

      <div className="product-grid">
        {wishlist.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-img-wrapper">
              <Link to={`/products/${product.id}`}>
                <img src={product.image_url} alt={product.name} className="product-card-img" />
              </Link>
              <button
                onClick={() => toggleWishlist(product)}
                className="wishlist-heart-btn in-wishlist floating-wishlist"
                aria-label="Remove from wishlist"
                title="Remove from wishlist"
              >
                ❤️
              </button>
            </div>
            <Link to={`/products/${product.id}`} className="product-card-link">
              <h3>{product.name}</h3>
            </Link>
            <p className="product-card-category">{product.category}</p>
            <div className="product-card-footer">
              <span className="product-card-price">₹{Number(product.price).toFixed(0)}</span>
              <button
                onClick={() => handleAddSingleToCart(product)}
                disabled={product.stock === 0}
                className="btn-quick-add"
              >
                {product.stock === 0 ? 'Out of stock' : 'Move to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
