import express from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware: ensure user has a shop
function getShopkeeperShop(req, res, next) {
  const shop = db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(req.user.id);
  if (!shop) {
    return res.status(404).json({ success: false, message: 'No registered shop found for this account' });
  }
  req.shop = shop;
  next();
}

// GET /api/shopkeeper/stats - Overview metrics
router.get('/stats', authenticateToken, requireRole('shopkeeper', 'admin'), getShopkeeperShop, (req, res) => {
  try {
    const shopId = req.shop.id;

    // Total sales & completed orders
    const salesStats = db.prepare(`
      SELECT 
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM orders
      WHERE shop_id = ? AND status != 'cancelled'
    `).get(shopId);

    // Today's revenue
    const todayStats = db.prepare(`
      SELECT COALESCE(SUM(total), 0) as today_revenue, COUNT(*) as today_orders
      FROM orders
      WHERE shop_id = ? AND DATE(created_at) = DATE('now') AND status != 'cancelled'
    `).get(shopId);

    // Pending orders
    const pendingCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE shop_id = ? AND status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery')
    `).get(shopId);

    // Low stock items count
    const lowStockCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM products
      WHERE shop_id = ? AND stock <= low_stock_threshold
    `).get(shopId);

    // Total products
    const totalProducts = db.prepare(`
      SELECT COUNT(*) as count
      FROM products
      WHERE shop_id = ?
    `).get(shopId);

    return res.json({
      success: true,
      shop: req.shop,
      stats: {
        total_revenue: salesStats.total_revenue,
        total_orders: salesStats.total_orders,
        today_revenue: todayStats.today_revenue,
        today_orders: todayStats.today_orders,
        pending_orders: pendingCount.count,
        low_stock_count: lowStockCount.count,
        total_products: totalProducts.count,
        rating: req.shop.rating,
        rating_count: req.shop.rating_count
      }
    });
  } catch (error) {
    console.error('Shopkeeper stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/shopkeeper/orders - Orders list
router.get('/orders', authenticateToken, requireRole('shopkeeper', 'admin'), getShopkeeperShop, (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.shop_id = ?
    `;
    const params = [req.shop.id];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

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
    console.error('Shopkeeper orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/shopkeeper/orders/:id/status - Update order status
router.put('/orders/:id/status', authenticateToken, requireRole('shopkeeper', 'admin'), getShopkeeperShop, (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, shopkeeper_notes } = req.body;

    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${validStatuses.join(', ')}` });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND shop_id = ?').get(orderId, req.shop.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for your shop' });
    }

    // If changing to delivered, mark payment_status = paid if COD
    let paymentStatusUpdate = order.payment_status;
    if (status === 'delivered' && order.payment_method === 'cod') {
      paymentStatusUpdate = 'paid';
    }

    db.prepare(`
      UPDATE orders
      SET status = ?,
          payment_status = ?,
          shopkeeper_notes = COALESCE(?, shopkeeper_notes),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, paymentStatusUpdate, shopkeeper_notes || null, orderId);

    // Notify customer
    const statusLabels = {
      confirmed: 'Order Confirmed! 👍',
      preparing: 'Order Being Prepared 🍳',
      out_for_delivery: 'Out for Delivery! 🛵',
      delivered: 'Order Delivered! 🎉',
      cancelled: 'Order Cancelled ❌'
    };

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, 'order', ?)
    `).run(
      order.user_id,
      statusLabels[status] || 'Order Status Updated',
      `Your order ${order.order_number} has been updated to "${status.replace(/_/g, ' ')}". ${shopkeeper_notes ? `Note: ${shopkeeper_notes}` : ''}`,
      `/orders/track/${order.order_number}`
    );

    return res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// GET /api/shopkeeper/products - Products with low-stock flags
router.get('/products', authenticateToken, requireRole('shopkeeper', 'admin'), getShopkeeperShop, (req, res) => {
  try {
    const products = db.prepare(`
      SELECT * FROM products 
      WHERE shop_id = ? 
      ORDER BY stock <= low_stock_threshold DESC, created_at DESC
    `).all(req.shop.id);

    const formatted = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [p.thumbnail],
      is_low_stock: p.stock <= p.low_stock_threshold
    }));

    return res.json({ success: true, count: formatted.length, products: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/shopkeeper/analytics - Charts data
router.get('/analytics', authenticateToken, requireRole('shopkeeper', 'admin'), getShopkeeperShop, (req, res) => {
  try {
    const shopId = req.shop.id;

    // Daily revenue for last 7 days
    const dailyRevenue = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE shop_id = ? AND status != 'cancelled' AND created_at >= date('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `).all(shopId);

    // Fill in last 7 days even if 0 sales
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = dailyRevenue.find(r => r.date === dateStr);
      last7Days.push({
        date: dateStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: match ? match.revenue : 0,
        orders: match ? match.order_count : 0
      });
    }

    // Best-selling products
    const topProducts = db.prepare(`
      SELECT 
        oi.product_name,
        SUM(oi.quantity) as total_units_sold,
        SUM(oi.total_price) as total_earned
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.shop_id = ? AND o.status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY total_units_sold DESC
      LIMIT 5
    `).all(shopId);

    // Low stock items
    const lowStockAlerts = db.prepare(`
      SELECT id, name, stock, low_stock_threshold, thumbnail, unit, price
      FROM products
      WHERE shop_id = ? AND stock <= low_stock_threshold
      ORDER BY stock ASC
    `).all(shopId);

    return res.json({
      success: true,
      charts: {
        daily: last7Days,
        top_products: topProducts
      },
      low_stock_alerts: lowStockAlerts
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
