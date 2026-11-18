import express from 'express';
import db from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cart - Get user's cart with product and shop details
router.get('/', authenticateToken, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.created_at as added_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.original_price,
        p.stock,
        p.unit,
        p.thumbnail,
        p.is_available,
        s.id as shop_id,
        s.name as shop_name,
        s.slug as shop_slug,
        s.delivery_fee,
        s.min_order_amount,
        s.pincode as shop_pincode
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN shops s ON p.shop_id = s.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.user.id);

    // Calculate subtotal
    let subtotal = 0;
    let hasOutOfStock = false;
    let shopId = null;
    let deliveryFee = 0;

    const validatedItems = items.map((item) => {
      const isItemOutOfStock = item.stock <= 0 || !item.is_available;
      const isQuantityExceeded = item.quantity > item.stock;

      if (isItemOutOfStock || isQuantityExceeded) {
        hasOutOfStock = true;
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      if (!shopId) {
        shopId = item.shop_id;
        deliveryFee = item.delivery_fee || 25;
      }

      return {
        ...item,
        item_total: itemTotal,
        is_out_of_stock: isItemOutOfStock,
        is_quantity_exceeded: isQuantityExceeded,
        max_available: item.stock
      };
    });

    return res.json({
      success: true,
      items: validatedItems,
      subtotal,
      delivery_fee: items.length > 0 ? deliveryFee : 0,
      total: items.length > 0 ? subtotal + deliveryFee : 0,
      has_out_of_stock: hasOutOfStock,
      count: items.reduce((sum, i) => sum + i.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving cart' });
  }
});

// POST /api/cart - Add item to cart
router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id is required' });
    }

    const product = db.prepare('SELECT id, stock, is_available, name FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.is_available || product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'This product is currently out of stock' });
    }

    // Check if product already exists in cart
    const existing = db.prepare('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);

    let newQuantity = quantity;
    if (existing) {
      newQuantity = existing.quantity + quantity;
      if (newQuantity > product.stock) {
        newQuantity = product.stock; // Cap at max available
      }
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQuantity, existing.id);
    } else {
      if (newQuantity > product.stock) {
        newQuantity = product.stock;
      }
      db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, newQuantity);
    }

    return res.json({
      success: true,
      message: `Added ${product.name} to cart`,
      quantity: newQuantity
    });
  } catch (error) {
    console.error('Add cart error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/:productId - Update quantity
router.put('/:productId', authenticateToken, (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const safeQty = Math.min(Number(quantity), product.stock);

    db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = ?
    `).run(req.user.id, productId, safeQty, safeQty);

    return res.json({ success: true, message: 'Cart updated', quantity: safeQty });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:productId - Remove single product
router.delete('/:productId', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
    return res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove item' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    return res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

export default router;
