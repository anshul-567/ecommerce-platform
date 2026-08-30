const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products/categories - list distinct categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`
    );
    res.json({ categories: result.rows.map((r) => r.category) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching categories.' });
  }
});

// GET /api/products - list all products, optional ?category=&search=
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`,
      values
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
});

// POST /api/products - admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, image_url, stock)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description || '', price, category || '', image_url || '', stock || 0]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating product.' });
  }
});

// PUT /api/products/:id - admin only
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock } = req.body;

    const result = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         category = COALESCE($4, category),
         image_url = COALESCE($5, image_url),
         stock = COALESCE($6, stock)
       WHERE id = $7 RETURNING *`,
      [name, description, price, category, image_url, stock, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating product.' });
  }
});

// DELETE /api/products/:id - admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
});

module.exports = router;
