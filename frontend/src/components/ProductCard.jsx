import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const isFavorite = isInWishlist(product.id);

  // Generate deterministic mock rating for products
  const ratingScore = (4.2 + ((product.id * 7) % 8) / 10).toFixed(1);
  const reviewCount = 15 + ((product.id * 29) % 180);

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addToast('Please login to add items to your cart', 'info');
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      addToast('Sorry, this product is currently out of stock', 'error');
      return;
    }

    setAdding(true);
    try {
      await addToCart(product.id, 1);
      addToast(`Added 1x ${product.name} to cart!`, 'success');
    } catch {
      addToast('Failed to add item to cart', 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="product-card">
      <div className="product-card-img-wrapper">
        <Link to={`/products/${product.id}`}>
          <img src={product.image_url} alt={product.name} className="product-card-img" />
        </Link>
        <span className={`stock-badge floating-badge ${product.stock === 0 ? 'out' : ''}`}>
          {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
        </span>
        <button
          onClick={() => toggleWishlist(product)}
          className={`wishlist-heart-btn floating-wishlist ${isFavorite ? 'in-wishlist' : ''}`}
          aria-label="Toggle Wishlist"
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <Link to={`/products/${product.id}`} className="product-card-link">
        <h3>{product.name}</h3>
      </Link>
      
      <div className="product-card-meta">
        <span className="product-card-category">{product.category}</span>
        <span className="product-card-rating">
          ★ <span className="rating-num">{ratingScore}</span> <span className="review-num">({reviewCount})</span>
        </span>
      </div>

      <div className="product-card-footer">
        <span className="product-card-price">₹{Number(product.price).toFixed(0)}</span>
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="btn-quick-add"
          title="Add to Cart"
        >
          {adding ? 'Adding...' : '+ Add'}
        </button>
      </div>
    </div>
  );
}


