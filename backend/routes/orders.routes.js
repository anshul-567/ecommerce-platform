const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// POST /api/orders - place an order from the current cart
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { shipping_address } = req.body;

    await client.query('BEGIN');

    const cartResult = await client.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       FOR UPDATE OF p`,
      [req.user.id]
    );

    const items = cartResult.rows;
    if (items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    // Validate stock before committing to the order
    for (const item of items) {
      if (item.quantity > item.stock) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Not enough stock for "${item.name}". Only ${item.stock} left.`,
        });
      }
    }

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, status, shipping_address)
       VALUES ($1, $2, 'pending', $3) RETURNING *`,
      [req.user.id, total.toFixed(2), shipping_address || '']
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.name, item.price, item.quantity]
      );

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.quantity,
        item.product_id,
      ]);
    }

    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({ order });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error placing order.' });
  } finally {
    client.release();
  }
});

// GET /api/orders - current user's order history
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

// GET /api/orders/:id - order detail with line items (owner or admin only)
router.get('/:id', async (req, res) => {
  try {
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);

    res.json({ order, items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching order.' });
  }
});

module.exports = router;
