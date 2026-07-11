import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data.items);
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function addToCart(productId, quantity = 1) {
    await api.post('/cart', { product_id: productId, quantity });
    await refreshCart();
  }

  async function updateQuantity(cartItemId, quantity) {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await refreshCart();
  }

  async function removeFromCart(cartItemId) {
    await api.delete(`/cart/${cartItemId}`);
    await refreshCart();
  }

  async function clearCart() {
    await api.delete('/cart');
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, total, itemCount, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
