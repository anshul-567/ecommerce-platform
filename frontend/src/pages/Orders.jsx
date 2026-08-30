import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="page">Loading orders...</p>;
  if (orders.length === 0) return <div className="page"><h1>My Orders</h1><p>You have no orders yet.</p></div>;

  return (
    <div className="page">
      <h1>My Orders</h1>
      <div className="table-scroll">
      <table className="cart-table">
        <thead>
          <tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>₹{Number(o.total).toFixed(0)}</td>
              <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
              <td><Link to={`/orders/${o.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  function fetchOrder() {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data.order);
      setItems(res.data.items);
    });
  }

  async function handleCancelOrder() {
    if (!window.confirm('Are you sure you want to cancel this order? This will restock the items.')) {
      return;
    }
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      setCancelMsg('Order has been cancelled.');
      fetchOrder();
    } catch (err) {
      setCancelMsg(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  }

  if (!order) return <p className="page">Loading order...</p>;

  // Status timeline steps
  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIdx = statusSteps.indexOf(order.status.toLowerCase());
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <div className="page order-page-printable">
      <div className="order-detail-header">
        <div>
          <h1>Order #{order.id}</h1>
          <p className="muted">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => window.print()} className="btn-secondary no-print" title="Print Receipt / Invoice">
            🖨️ Print Invoice
          </button>
          <span className={`status-badge status-${order.status}`}>{order.status}</span>
        </div>
      </div>

      {cancelMsg && <p className="error-text">{cancelMsg}</p>}

      {/* Visual Tracking Progress Timeline */}
      {!isCancelled ? (
        <div className="order-tracking-card no-print">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>📦 Order Status Tracking</h3>
            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="btn-cancel-order"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
          <div className="tracking-timeline">
            {statusSteps.map((step, idx) => {
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                  <div className="timeline-marker">
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className="timeline-label">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="order-tracking-card cancelled-tracking">
          <p>⚠️ This order has been cancelled and refunded.</p>
        </div>
      )}

      <div className="order-info-card">
        <p><strong>📍 Shipping Address & Details:</strong></p>
        <p className="muted">{order.shipping_address}</p>
      </div>

      <div className="table-scroll">
        <table className="cart-table">
          <thead>
            <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.product_name}</strong></td>
                <td>₹{Number(item.price).toFixed(0)}</td>
                <td>{item.quantity}</td>
                <td>₹{(Number(item.price) * item.quantity).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-detail-footer">
        <Link to="/orders" className="btn-link no-print">← Back to My Orders</Link>
        <h2>Total Paid: ₹{Number(order.total).toFixed(0)}</h2>
      </div>
    </div>
  );
}



export { OrderList, OrderDetail };
