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

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data.order);
      setItems(res.data.items);
    });
  }, [id]);

  if (!order) return <p className="page">Loading order...</p>;

  return (
    <div className="page">
      <h1>Order #{order.id}</h1>
      <p><span className={`status-badge status-${order.status}`}>{order.status}</span></p>
      <p className="muted">Placed on {new Date(order.created_at).toLocaleString()}</p>
      <p><strong>Shipping to:</strong> {order.shipping_address}</p>

      <div className="table-scroll">
      <table className="cart-table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product_name}</td>
              <td>₹{Number(item.price).toFixed(0)}</td>
              <td>{item.quantity}</td>
              <td>₹{(Number(item.price) * item.quantity).toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <h2>Total: ₹{Number(order.total).toFixed(0)}</h2>
      <Link to="/orders">← Back to orders</Link>
    </div>
  );
}

export { OrderList, OrderDetail };
