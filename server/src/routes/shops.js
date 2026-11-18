import express from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper: Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper: check if shop is open now
function isShopOpenNow(openingTime, closingTime) {
  if (!openingTime || !closingTime) return true;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

// GET /api/shops - List all approved shops with location & distance calculation
router.get('/', (req, res) => {
  try {
    const { category, search, pincode, lat, lng, limit = 50 } = req.query;

    let query = "SELECT * FROM shops WHERE status = 'approved'";
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (pincode) {
      query += ' AND pincode = ?';
      params.push(pincode);
    }

    query += ' ORDER BY rating DESC, rating_count DESC LIMIT ?';
    params.push(Number(limit));

    const shops = db.prepare(query).all(...params);

    // Enrich with real-time distance and open status
    const customerLat = lat ? parseFloat(lat) : null;
    const customerLng = lng ? parseFloat(lng) : null;

    const enrichedShops = shops.map((shop) => {
      let distanceKm = null;
      let deliversToLocation = true;

      if (customerLat && customerLng && shop.latitude && shop.longitude) {
        distanceKm = calculateDistance(customerLat, customerLng, shop.latitude, shop.longitude);
        deliversToLocation = distanceKm <= (shop.delivery_radius_km || 10);
      }

      const isOpenNow = Boolean(shop.is_open && isShopOpenNow(shop.opening_time, shop.closing_time));

      // Get count of available products
      const countRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE shop_id = ? AND is_available = 1').get(shop.id);

      return {
        ...shop,
        is_open_now: isOpenNow,
        distance_km: distanceKm,
        delivers_to_location: deliversToLocation,
        product_count: countRow ? countRow.count : 0
      };
    });

    // Sort by distance if customer location provided
    if (customerLat && customerLng) {
      enrichedShops.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
    }

    return res.json({ success: true, count: enrichedShops.length, shops: enrichedShops });
  } catch (error) {
    console.error('List shops error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching shops' });
  }
});

// GET /api/shops/owner/me - Get current shopkeeper's shop
router.get('/owner/me', authenticateToken, requireRole('shopkeeper', 'admin'), (req, res) => {
  try {
    const shop = db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'No shop found for this account' });
    }

    return res.json({ success: true, shop });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/shops/owner/me - Update shopkeeper's shop details
router.put('/owner/me', authenticateToken, requireRole('shopkeeper', 'admin'), (req, res) => {
  try {
    const shop = db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(req.user.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'No shop found' });
    }

    const {
      name, description, category, logo, banner, phone, email,
      address, city, pincode, latitude, longitude, opening_time, closing_time,
      is_open, delivery_radius_km, delivery_fee, min_order_amount
    } = req.body;

    db.prepare(`
      UPDATE shops
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          logo = COALESCE(?, logo),
          banner = COALESCE(?, banner),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          pincode = COALESCE(?, pincode),
          latitude = COALESCE(?, latitude),
          longitude = COALESCE(?, longitude),
          opening_time = COALESCE(?, opening_time),
          closing_time = COALESCE(?, closing_time),
          is_open = COALESCE(?, is_open),
          delivery_radius_km = COALESCE(?, delivery_radius_km),
          delivery_fee = COALESCE(?, delivery_fee),
          min_order_amount = COALESCE(?, min_order_amount)
      WHERE id = ?
    `).run(
      name, description, category, logo, banner, phone, email,
      address, city, pincode, latitude, longitude, opening_time, closing_time,
      is_open, delivery_radius_km, delivery_fee, min_order_amount, shop.id
    );

    const updatedShop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shop.id);
    return res.json({ success: true, message: 'Shop details updated successfully', shop: updatedShop });
  } catch (error) {
    console.error('Update shop error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update shop details' });
  }
});

// GET /api/shops/:idOrSlug - Single shop details with products and reviews
router.get('/:idOrSlug', (req, res) => {
  try {
    const param = req.params.idOrSlug;
    let shop;
    if (/^\d+$/.test(param)) {
      shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(Number(param));
    } else {
      shop = db.prepare('SELECT * FROM shops WHERE slug = ?').get(param);
    }

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const isOpenNow = Boolean(shop.is_open && isShopOpenNow(shop.opening_time, shop.closing_time));

    // Get shop products
    const products = db.prepare('SELECT * FROM products WHERE shop_id = ? AND is_available = 1 ORDER BY is_featured DESC, sales_count DESC').all(shop.id);

    // Parse product images
    const parsedProducts = products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));

    // Get shop reviews
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.shop_id = ?
      ORDER BY r.created_at DESC
      LIMIT 20
    `).all(shop.id);

    return res.json({
      success: true,
      shop: {
        ...shop,
        is_open_now: isOpenNow
      },
      products: parsedProducts,
      reviews
    });
  } catch (error) {
    console.error('Get shop error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
