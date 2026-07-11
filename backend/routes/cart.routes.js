const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth); // all cart routes require login

// GET /api/cart - get current user's cart with product details
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.*
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at ASC`,
      [req.user.id]
    );
    res.json({ items: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching cart.' });
  }
});

// POST /api/cart - add item to cart (or increment quantity if it exists)
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required.' });
    }

    const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding to cart.' });
  }
});

// PUT /api/cart/:cartItemId - update quantity
router.put('/:cartItemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const result = await pool.query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, req.params.cartItemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    res.json({ item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating cart item.' });
  }
});

// DELETE /api/cart/:cartItemId - remove item from cart
router.delete('/:cartItemId', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.cartItemId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error removing cart item.' });
  }
});

// DELETE /api/cart - clear entire cart (used after placing an order)
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error clearing cart.' });
  }
});

module.exports = router;
