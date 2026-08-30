import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Multi-step: 1 = Shipping, 2 = Payment & Review
  const [step, setStep] = useState(1);

  // Shipping Form State
  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  // Payment & Promo state
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const discountAmount = (total * discountPercent) / 100;
  const finalTotal = Math.max(0, total - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE10') {
      setDiscountPercent(10);
      setCouponApplied(true);
      addToast('🎉 Coupon SAVE10 applied! 10% OFF', 'success');
    } else if (code === 'DEAL20') {
      setDiscountPercent(20);
      setCouponApplied(true);
      addToast('🔥 Promo DEAL20 applied! 20% OFF', 'success');
    } else {
      addToast('Invalid coupon code. Try SAVE10 or DEAL20', 'error');
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.postalCode) {
      setError('Please fill in all required shipping fields');
      return;
    }
    setError('');
    setStep(2);
  };

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError('');
    setPlacing(true);

    const fullShippingAddress = `${shipping.fullName}, ${shipping.address}, ${shipping.city} - ${shipping.postalCode} (Ph: ${shipping.phone || 'N/A'}) [Payment: ${paymentMethod.toUpperCase()}]`;

    try {
      const res = await api.post('/orders', { shipping_address: fullShippingAddress });
      await clearCart();
      addToast('Order placed successfully! 🎉', 'success');
      navigate(`/orders/${res.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page checkout-page">
      <h1>Secure Checkout</h1>

      {/* Checkout Progress Stepper */}
      <div className="checkout-stepper">
        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle">1</div>
          <span>Shipping Details</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle">2</div>
          <span>Payment & Review</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Left Column: Forms */}
        <div className="checkout-main">
          {step === 1 ? (
            <form onSubmit={handleShippingSubmit} className="checkout-form-box">
              <h2>1. Delivery Address</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat / House No., Landmark, Area"
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai / New York"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Postal / PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="400001"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  />
                </div>
              </div>

              {error && <p className="error-text">{error}</p>}
              <button type="submit" className="btn-hero-primary" style={{ marginTop: '1rem', width: '100%' }}>
                Continue to Payment →
              </button>
            </form>
          ) : (
            <div className="checkout-form-box">
              <div className="step-header-row">
                <h2>2. Payment Method</h2>
                <button type="button" onClick={() => setStep(1)} className="btn-link">
                  Edit Shipping ✏️
                </button>
              </div>

              <div className="delivery-summary-pill">
                <strong>Ship to:</strong> {shipping.fullName}, {shipping.address}, {shipping.city} ({shipping.postalCode})
              </div>

              <div className="payment-options">
                <label className={`payment-card-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-label-info">
                    <strong>💵 Cash on Delivery (COD)</strong>
                    <p className="muted">Pay in cash or UPI upon delivery at your doorstep.</p>
                  </div>
                </label>

                <label className={`payment-card-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-label-info">
                    <strong>💳 Credit / Debit Card</strong>
                    <p className="muted">Visa, MasterCard, RuPay & Amex supported.</p>
                  </div>
                </label>

                <label className={`payment-card-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-label-info">
                    <strong>📱 UPI / QR Code</strong>
                    <p className="muted">Google Pay, PhonePe, Paytm or UPI ID.</p>
                  </div>
                </label>
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="btn-hero-primary"
                style={{ marginTop: '1.5rem', width: '100%' }}
              >
                {placing ? 'Placing Order...' : `Pay & Place Order • ₹${finalTotal.toFixed(0)}`}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="checkout-sidebar">
          <div className="checkout-summary-box">
            <h3>Order Summary</h3>
            <div className="checkout-items-list">
              {items.map((item) => (
                <div key={item.cart_item_id} className="checkout-item-row">
                  <div className="checkout-item-title">
                    <span>{item.name}</span>
                    <span className="muted">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">
                    ₹{(Number(item.price) * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="coupon-box">
              <input
                type="text"
                placeholder="Coupon (e.g. SAVE10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
              />
              <button type="submit" disabled={couponApplied} className="btn-secondary">
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </form>
            <span className="coupon-hint muted">💡 Hint: Try <strong>SAVE10</strong> (10% off) or <strong>DEAL20</strong> (20% off)</span>

            <div className="checkout-totals-breakdown">
              <div className="checkout-line">
                <span>Subtotal</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="checkout-line discount-line">
                  <span>Discount ({discountPercent}%)</span>
                  <span>- ₹{discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="checkout-line">
                <span>Estimated Delivery</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="checkout-line checkout-total">
                <span>Total Amount</span>
                <span>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

