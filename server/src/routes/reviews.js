import express from 'express';
import db from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/reviews - Create review
router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id, shop_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    if (!product_id && !shop_id) {
      return res.status(400).json({ success: false, message: 'Either product_id or shop_id is required' });
    }

    let resolvedShopId = shop_id;
    if (product_id && !resolvedShopId) {
      const prod = db.prepare('SELECT shop_id FROM products WHERE id = ?').get(product_id);
      if (prod) resolvedShopId = prod.shop_id;
    }

    const insert = db.prepare(`
      INSERT INTO reviews (user_id, product_id, shop_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(req.user.id, product_id || null, resolvedShopId || null, Math.round(rating), comment || '');

    // Recompute product rating if review was for a product
    if (product_id) {
      const stats = db.prepare(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as count 
        FROM reviews 
        WHERE product_id = ?
      `).get(product_id);

      db.prepare(`
        UPDATE products 
        SET rating = ?, rating_count = ? 
        WHERE id = ?
      `).run(Math.round((stats.avg_rating || 5) * 10) / 10, stats.count, product_id);
    }

    // Recompute shop rating
    if (resolvedShopId) {
      const shopStats = db.prepare(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as count 
        FROM reviews 
        WHERE shop_id = ?
      `).get(resolvedShopId);

      db.prepare(`
        UPDATE shops 
        SET rating = ?, rating_count = ? 
        WHERE id = ?
      `).run(Math.round((shopStats.avg_rating || 5) * 10) / 10, shopStats.count, resolvedShopId);
    }

    return res.status(201).json({ success: true, message: 'Thank you for your review!' });
  } catch (error) {
    console.error('Review creation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.productId);

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reviews/shop/:shopId
router.get('/shop/:shopId', (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar, p.name as product_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.shop_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.shopId);

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
