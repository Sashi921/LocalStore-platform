import express from 'express';
import db from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/wishlist - Get all wishlist items for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT 
        w.id as wishlist_id,
        w.created_at as saved_at,
        p.*,
        s.name as shop_name,
        s.slug as shop_slug
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      JOIN shops s ON p.shop_id = s.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `).all(req.user.id);

    const formatted = items.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [item.thumbnail]
    }));

    return res.json({ success: true, count: formatted.length, items: formatted });
  } catch (error) {
    console.error('Wishlist get error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/wishlist/:productId - Toggle wishlist
router.post('/:productId', authenticateToken, (req, res) => {
  try {
    const productId = req.params.productId;
    const existing = db.prepare('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);

    if (existing) {
      db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(existing.id);
      return res.json({ success: true, is_in_wishlist: false, message: 'Removed from wishlist' });
    } else {
      db.prepare('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);
      return res.json({ success: true, is_in_wishlist: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update wishlist' });
  }
});

// DELETE /api/wishlist/:productId - Remove item
router.delete('/:productId', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
    return res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
});

export default router;
