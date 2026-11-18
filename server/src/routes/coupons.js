import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

// GET /api/coupons - List all active coupons
router.get('/', (req, res) => {
  try {
    const coupons = db.prepare(`
      SELECT * FROM coupons 
      WHERE is_active = 1 AND (valid_until IS NULL OR valid_until > datetime('now'))
      ORDER BY discount_percent DESC
    `).all();

    return res.json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/coupons/validate - Validate coupon code against an order subtotal
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = db.prepare(`
      SELECT * FROM coupons 
      WHERE UPPER(code) = UPPER(?) AND is_active = 1
    `).get(code.trim());

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (subtotal < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.min_order_amount} required to use this coupon`
      });
    }

    // Calculate discount
    let discount = (subtotal * coupon.discount_percent) / 100;
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
    discount = Math.round(discount);

    return res.json({
      success: true,
      valid: true,
      message: `Coupon applied! You saved ₹${discount}`,
      coupon: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        discount_amount: discount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
});

export default router;
