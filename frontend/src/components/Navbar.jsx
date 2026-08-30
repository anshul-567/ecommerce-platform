import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">ShopEasy</Link>
      <div className="navbar-links">
        <Link to="/">Products</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        
        <Link to="/wishlist" className="navbar-cart" title="Wishlist">
          🤍 Wishlist{wishlistCount > 0 && <span className="cart-badge wishlist-badge">{wishlistCount}</span>}
        </Link>

        {user && (
          <Link to="/cart" className="navbar-cart">
            Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        )}
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-link">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}


