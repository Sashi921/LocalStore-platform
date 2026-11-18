import express from 'express';
import db from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/support/tickets - Submit support ticket / complaint
router.post('/tickets', authenticateToken, (req, res) => {
  try {
    const { shop_id, order_id, subject, category, description, priority = 'medium' } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({ success: false, message: 'Subject, category, and description are required' });
    }

    const insert = db.prepare(`
      INSERT INTO support_tickets (user_id, shop_id, order_id, subject, category, description, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      req.user.id,
      shop_id ? Number(shop_id) : null,
      order_id ? Number(order_id) : null,
      subject.trim(),
      category,
      description.trim(),
      priority
    );

    // Notify admins
    const admins = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).all();
    for (const a of admins) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'alert', ?)
      `).run(
        a.id,
        'New Customer Support Ticket',
        `Ticket #${result.lastInsertRowid} created: "${subject.slice(0, 40)}"`,
        '/admin/support'
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Support ticket submitted. Our customer care team will respond shortly.',
      ticket_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit ticket' });
  }
});

// GET /api/support/tickets - Get user's submitted tickets
router.get('/tickets', authenticateToken, (req, res) => {
  try {
    const tickets = db.prepare(`
      SELECT t.*, s.name as shop_name, o.order_number
      FROM support_tickets t
      LEFT JOIN shops s ON t.shop_id = s.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `).all(req.user.id);

    return res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/support/notifications - Get notifications for user
router.get('/notifications', authenticateToken, (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(req.user.id);

    const unreadCount = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(req.user.id).count;

    return res.json({ success: true, unread_count: unreadCount, notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/support/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/support/notifications/read-all - Mark all read
router.put('/notifications/read-all', authenticateToken, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/search/suggestions - Smart quick-search autocomplete
router.get('/search/suggestions', (req, res) => {
  try {
    const q = req.query.q || '';
    if (q.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const term = `%${q.trim()}%`;

    const products = db.prepare(`
      SELECT id, name, price, thumbnail, 'product' as type 
      FROM products 
      WHERE name LIKE ? AND is_available = 1 
      LIMIT 5
    `).all(term);

    const shops = db.prepare(`
      SELECT id, name, category, logo as thumbnail, 'shop' as type 
      FROM shops 
      WHERE name LIKE ? AND status = 'approved' 
      LIMIT 3
    `).all(term);

    const categories = db.prepare(`
      SELECT id, name, slug, 'category' as type 
      FROM categories 
      WHERE name LIKE ? 
      LIMIT 3
    `).all(term);

    return res.json({
      success: true,
      suggestions: [...products, ...shops, ...categories]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
