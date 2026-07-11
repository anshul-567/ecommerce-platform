const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin); // every route below is admin-only

// GET /api/admin/orders - view all orders across all users
router.get('/orders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
});

// PUT /api/admin/orders/:id/status - update an order's status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({ order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating order status.' });
  }
});

// GET /api/admin/users - list all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// GET /api/admin/stats - quick dashboard summary numbers
router.get('/stats', async (req, res) => {
  try {
    const [{ rows: productCount }, { rows: orderCount }, { rows: revenue }, { rows: userCount }] =
      await Promise.all([
        pool.query('SELECT COUNT(*) FROM products'),
        pool.query('SELECT COUNT(*) FROM orders'),
        pool.query(`SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status != 'cancelled'`),
        pool.query('SELECT COUNT(*) FROM users'),
      ]);

    res.json({
      totalProducts: Number(productCount[0].count),
      totalOrders: Number(orderCount[0].count),
      totalRevenue: Number(revenue[0].total),
      totalUsers: Number(userCount[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

module.exports = router;
