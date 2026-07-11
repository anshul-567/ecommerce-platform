import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
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
        {user && (
          <Link to="/cart" className="navbar-cart">
            Cart{itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        )}
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
