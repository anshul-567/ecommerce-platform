import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const res = await api.post('/orders', { shipping_address: address });
      await clearCart();
      navigate(`/orders/${res.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return <div className="page"><p>Your cart is empty.</p></div>;
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="checkout-summary">
        {items.map((item) => (
          <div key={item.cart_item_id} className="checkout-line">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{(Number(item.price) * item.quantity).toFixed(0)}</span>
          </div>
        ))}
        <div className="checkout-line checkout-total">
          <span>Total</span>
          <span>₹{total.toFixed(0)}</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="auth-form">
        <label>Shipping Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          required
          placeholder="123 Main St, Springfield, USA"
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={placing}>{placing ? 'Placing order...' : 'Place Order'}</button>
      </form>
    </div>
  );
}
