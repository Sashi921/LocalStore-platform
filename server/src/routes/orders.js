import express from 'express';
import db from '../db/connection.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate unique order number
function generateOrderNumber() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `LOC-${year}-${randomDigits}`;
}

// POST /api/orders - Place a new order with complete server-side stock & price verification
router.post('/', authenticateToken, (req, res) => {
  try {
    const {
      delivery_address,
      delivery_city,
      delivery_pincode,
      delivery_phone,
      payment_method = 'cod',
      coupon_code,
      customer_notes,
      items: customItems
    } = req.body;

    if (!delivery_address || !delivery_phone || !delivery_pincode) {
      return res.status(400).json({ success: false, message: 'Delivery address, phone and PIN code are required' });
    }

    // Retrieve items from user's active cart unless custom items passed (e.g. direct Buy Now)
    let cartRows;
    if (customItems && Array.isArray(customItems) && customItems.length > 0) {
      cartRows = customItems.map(item => {
        const prod = db.prepare('SELECT p.*, s.delivery_fee, s.id as shop_id FROM products p JOIN shops s ON p.shop_id = s.id WHERE p.id = ?').get(item.product_id);
        if (!prod) throw new Error(`Product ${item.product_id} not found`);
        return {
          product_id: prod.id,
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
          unit: prod.unit,
          thumbnail: prod.thumbnail,
          is_available: prod.is_available,
          shop_id: prod.shop_id,
          delivery_fee: prod.delivery_fee,
          quantity: item.quantity
        };
      });
    } else {
      cartRows = db.prepare(`
        SELECT 
          ci.quantity,
          p.id as product_id,
          p.name,
          p.price,
          p.stock,
          p.unit,
          p.thumbnail,
          p.is_available,
          s.id as shop_id,
          s.delivery_fee
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN shops s ON p.shop_id = s.id
        WHERE ci.user_id = ?
      `).all(req.user.id);
    }

    if (!cartRows || cartRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping cart is empty' });
    }

    // Validate that all items belong to a single shop (or we process the current shop's items)
    const primaryShopId = cartRows[0].shop_id;
    const shopItems = cartRows.filter(i => i.shop_id === primaryShopId);

    // Validate stock and compute server subtotal
    let subtotal = 0;
    for (const item of shopItems) {
      const liveProduct = db.prepare('SELECT stock, is_available, name FROM products WHERE id = ?').get(item.product_id);
      if (!liveProduct || !liveProduct.is_available) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available` });
      }
      if (liveProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.name}". Only ${liveProduct.stock} left in stock.`
        });
      }
      subtotal += item.price * item.quantity;
    }

    // Get shop delivery fee
    const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(primaryShopId);
    const deliveryFee = shop ? (shop.delivery_fee || 25) : 25;

    // Validate Coupon if provided
    let discount = 0;
    let validatedCouponCode = null;
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1').get(coupon_code.trim());
      if (coupon && (!coupon.valid_until || new Date(coupon.valid_until) >= new Date()) && subtotal >= (coupon.min_order_amount || 0)) {
        discount = (subtotal * coupon.discount_percent) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
        discount = Math.round(discount);
        validatedCouponCode = coupon.code;
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const orderNumber = generateOrderNumber();
    const paymentStatus = payment_method === 'online' ? 'paid' : 'pending';
    const paymentId = payment_method === 'online' ? `pay_demo_${Date.now().toString().slice(-8)}` : null;

    // Begin database transaction using synchronous statements
    db.exec('BEGIN TRANSACTION;');

    try {
      const insertOrder = db.prepare(`
        INSERT INTO orders (
          order_number, user_id, shop_id, subtotal, delivery_fee, discount, coupon_code,
          total, status, payment_method, payment_status, payment_id, delivery_address,
          delivery_city, delivery_pincode, delivery_phone, customer_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      const orderResult = insertOrder.run(
        orderNumber,
        req.user.id,
        primaryShopId,
        subtotal,
        deliveryFee,
        discount,
        validatedCouponCode,
        total,
        'placed',
        payment_method,
        paymentStatus,
        paymentId,
        delivery_address,
        delivery_city || 'New Delhi',
        delivery_pincode,
        delivery_phone,
        customer_notes || null
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert order items and deduct stock
      const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products
        SET stock = stock - ?,
            sales_count = sales_count + ?
        WHERE id = ?
      `);

      for (const item of shopItems) {
        insertItem.run(
          orderId,
          item.product_id,
          item.name,
          item.thumbnail,
          item.price,
          item.quantity,
          item.price * item.quantity
        );

        updateStock.run(item.quantity, item.quantity, item.product_id);
      }

      // Remove purchased items from user's cart
      const deleteCart = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?');
      for (const item of shopItems) {
        deleteCart.run(req.user.id, item.product_id);
      }

      // Create notification for customer
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, 'order', ?)
      `).run(
        req.user.id,
        `Order ${orderNumber} Placed Successfully! 🎉`,
        `Your order of ₹${total} at ${shop ? shop.name : 'LocalStore'} has been placed.`,
        `/orders/track/${orderNumber}`
      );

      // Create notification for shopkeeper
      if (shop && shop.owner_id) {
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, 'order', ?)
        `).run(
          shop.owner_id,
          `New Order Received: ${orderNumber} 📦`,
          `Customer ${req.user.name} placed an order for ₹${total}.`,
          `/shopkeeper/orders`
        );
      }

      db.exec('COMMIT;');

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        order: {
          id: orderId,
          order_number: orderNumber,
          total,
          subtotal,
          delivery_fee: deliveryFee,
          discount,
          payment_method,
          payment_status: paymentStatus,
          status: 'placed'
        }
      });
    } catch (txError) {
      db.exec('ROLLBACK;');
      throw txError;
    }
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error placing order' });
  }
});

// GET /api/orders - Get user's order history
router.get('/', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, s.name as shop_name, s.logo as shop_logo, s.phone as shop_phone
      FROM orders o
      JOIN shops s ON o.shop_id = s.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    const enriched = orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return {
        ...order,
        items
      };
    });

    return res.json({ success: true, count: enriched.length, orders: enriched });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/track/:orderNumber - Order tracking details (supports public & authenticated lookup)
router.get('/track/:orderNumber', optionalAuth, (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    const order = db.prepare(`
      SELECT o.*, s.name as shop_name, s.address as shop_address, s.phone as shop_phone, s.pincode as shop_pincode, s.logo as shop_logo
      FROM orders o
      JOIN shops s ON o.shop_id = s.id
      WHERE o.order_number = ?
    `).get(orderNumber);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    // Timeline calculation
    const statusSequence = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusSequence.indexOf(order.status);

    const timeline = statusSequence.map((step, idx) => ({
      step,
      label: step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      completed: currentIndex >= idx,
      current: currentIndex === idx
    }));

    return res.json({
      success: true,
      order: {
        ...order,
        items,
        timeline
      }
    });
  } catch (error) {
    console.error('Order tracking error:', error);
    return res.status(500).json({ success: false, message: 'Server error tracking order' });
  }
});

// PUT /api/orders/:id/cancel - Customer can cancel placed order
router.put('/:id/cancel', authenticateToken, (req, res) => {
  try {
    const orderId = req.params.id;
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in "${order.status}" status`
      });
    }

    // Return stock back to products
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    db.exec('BEGIN TRANSACTION;');
    try {
      const restock = db.prepare('UPDATE products SET stock = stock + ?, sales_count = sales_count - ? WHERE id = ?');
      for (const item of items) {
        restock.run(item.quantity, item.quantity, item.product_id);
      }

      db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(orderId);
      db.exec('COMMIT;');

      return res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

export default router;
