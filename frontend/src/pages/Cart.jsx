import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useEffect } from 'react';

export default function Cart() {
  const { items, total, loading, refreshCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="page">Loading cart...</p>;

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <p>Your cart is empty. <Link to="/">Browse products</Link></p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <div className="table-scroll">
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.cart_item_id}>
              <td className="cart-product-cell">
                <img src={item.image_url} alt={item.name} />
                {item.name}
              </td>
              <td>₹{Number(item.price).toFixed(0)}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.cart_item_id, Math.max(1, Number(e.target.value)))}
                />
              </td>
              <td>₹{(Number(item.price) * item.quantity).toFixed(0)}</td>
              <td>
                <button className="btn-link" onClick={() => removeFromCart(item.cart_item_id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="cart-summary">
        <h2>Total: ₹{total.toFixed(0)}</h2>
        <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </div>
  );
}
