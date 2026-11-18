import express from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply admin guard to all routes
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /api/admin/stats - High-level platform KPIs
router.get('/stats', (req, res) => {
  try {
    const customerCount = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`).get().count;
    const shopkeeperCount = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'shopkeeper'`).get().count;
    const shopCount = db.prepare(`SELECT COUNT(*) as count FROM shops`).get().count;
    const pendingShops = db.prepare(`SELECT COUNT(*) as count FROM shops WHERE status = 'pending'`).get().count;
    const productCount = db.prepare(`SELECT COUNT(*) as count FROM products`).get().count;
    
    const orderStats = db.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(SUM(delivery_fee), 0) as total_delivery_fees
      FROM orders
      WHERE status != 'cancelled'
    `).get();

    const openTickets = db.prepare(`SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('open', 'in_progress')`).get().count;

    return res.json({
      success: true,
      stats: {
        customers: customerCount,
        shopkeepers: shopkeeperCount,
        total_shops: shopCount,
        pending_shops: pendingShops,
        products: productCount,
        orders: orderStats.total_orders,
        platform_sales: orderStats.total_sales,
        delivery_fees: orderStats.total_delivery_fees,
        open_tickets: openTickets
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users - User management
router.get('/users', (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `SELECT id, name, email, role, phone, city, pincode, status, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role && role !== 'all') {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;
    const users = db.prepare(query).all(...params);

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/status - Toggle user active/blocked
router.put('/users/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Protect master admin from being blocked
    const user = db.prepare('SELECT email, role FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin' && user.email === 'admin@localstore.com') {
      return res.status(400).json({ success: false, message: 'Cannot block primary administrator' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ success: true, message: `User status changed to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/shops - Shop management
router.get('/shops', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT s.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM shops s
      JOIN users u ON s.owner_id = u.id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;
    const shops = db.prepare(query).all(...params);

    return res.json({ success: true, count: shops.length, shops });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/shops/:id/status - Approve, reject or suspend shop
router.put('/shops/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid shop status' });
    }

    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    db.prepare('UPDATE shops SET status = ? WHERE id = ?').run(status, req.params.id);

    // Notify shop owner
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, 'alert', ?)
    `).run(
      shop.owner_id,
      `Store Registration ${status.toUpperCase()}`,
      `Your store "${shop.name}" status has been set to "${status}" by platform administration.`,
      '/shopkeeper'
    );

    return res.json({ success: true, message: `Shop status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/orders - All platform orders
router.get('/orders', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let query = `
      SELECT o.*, s.name as shop_name, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN shops s ON o.shop_id = s.id
      JOIN users u ON o.user_id = u.id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE o.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const orders = db.prepare(query).all(...params);

    const enriched = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return {
        ...order,
        items
      };
    });

    return res.json({ success: true, count: enriched.length, orders: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/tickets - Support tickets & complaints
router.get('/tickets', (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email, s.name as shop_name
      FROM support_tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN shops s ON t.shop_id = s.id
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY CASE t.status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END, t.created_at DESC`;
    const tickets = db.prepare(query).all(...params);

    return res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/tickets/:id - Resolve or update ticket
router.put('/tickets/:id', (req, res) => {
  try {
    const { status, admin_response, priority } = req.body;

    const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    db.prepare(`
      UPDATE support_tickets
      SET status = COALESCE(?, status),
          admin_response = COALESCE(?, admin_response),
          priority = COALESCE(?, priority),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, admin_response, priority, req.params.id);

    // Notify customer
    if (admin_response) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'info', ?)
      `).run(
        ticket.user_id,
        'Support Ticket Update',
        `Admin responded to your ticket "${ticket.subject}": ${admin_response}`,
        '/support'
      );
    }

    return res.json({ success: true, message: 'Support ticket updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/analytics - Platform analytics charts
router.get('/analytics', (req, res) => {
  try {
    // 7 day platform revenue
    const dailyData = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status != 'cancelled' AND created_at >= date('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `).all();

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyData.find(r => r.date === dateStr);
      last7Days.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.orders : 0
      });
    }

    // Revenue by category
    const categorySales = db.prepare(`
      SELECT 
        p.category_name,
        SUM(oi.total_price) as total_sales,
        SUM(oi.quantity) as units_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.category_name
      ORDER BY total_sales DESC
    `).all();

    // Top performing shops
    const topShops = db.prepare(`
      SELECT 
        s.id,
        s.name,
        s.category,
        s.rating,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total), 0) as total_volume
      FROM shops s
      LEFT JOIN orders o ON s.id = o.shop_id AND o.status != 'cancelled'
      GROUP BY s.id
      ORDER BY total_volume DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      charts: {
        daily: last7Days,
        categories: categorySales,
        top_shops: topShops
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Category Management
router.post('/categories', (req, res) => {
  try {
    const { name, icon = 'ShoppingBag', image, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const insert = db.prepare(`
      INSERT INTO categories (name, slug, icon, image, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(name, slug, icon, image || null, description || '');
    return res.status(201).json({ success: true, id: result.lastInsertRowid, message: 'Category added' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    return res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
