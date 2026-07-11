import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={product.image_url} alt={product.name} className="product-card-img" />
        <h3>{product.name}</h3>
      </Link>
      <p className="product-card-category">{product.category}</p>
      <div className="product-card-footer">
        <span className="product-card-price">₹{Number(product.price).toFixed(0)}</span>
        <span className={`stock-badge ${product.stock === 0 ? 'out' : ''}`}>
          {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
        </span>
      </div>
    </div>
  );
}
