import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    setError('');
    setMessage('');
    try {
      await addToCart(product.id, quantity);
      setMessage('Added to cart!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to cart.');
    }
  }

  if (!product) return <p className="page">Loading...</p>;

  return (
    <div className="page product-detail">
      <img src={product.image_url} alt={product.name} className="product-detail-img" />
      <div className="product-detail-info">
        <h1>{product.name}</h1>
        <p className="product-detail-category">{product.category}</p>
        <p>{product.description}</p>
        <p className="product-detail-price">₹{Number(product.price).toFixed(0)}</p>
        <p className={product.stock === 0 ? 'error-text' : 'muted'}>
          {product.stock === 0 ? 'Out of stock' : `${product.stock} available`}
        </p>

        {product.stock > 0 && (
          <div className="add-to-cart-row">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
            <button onClick={handleAddToCart}>Add to Cart</button>
          </div>
        )}

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
