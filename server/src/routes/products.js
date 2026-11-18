import express from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to parse product JSON images
function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    images: p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : [p.thumbnail || '']
  };
}

// GET /api/categories - Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, name ASC').all();
    
    // Attach product counts
    const enriched = categories.map(cat => {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_available = 1').get(cat.id);
      return {
        ...cat,
        product_count: countRow ? countRow.count : 0
      };
    });

    return res.json({ success: true, categories: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products - Search & Filter products
router.get('/', (req, res) => {
  try {
    const {
      search,
      category,
      shop_id,
      min_price,
      max_price,
      min_rating,
      in_stock,
      sort = 'popularity',
      page = 1,
      limit = 24
    } = req.query;

    let query = `
      SELECT p.*, s.name as shop_name, s.slug as shop_slug, s.city as shop_city, s.pincode as shop_pincode, s.rating as shop_rating
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.is_available = 1 AND s.status = 'approved'
    `;

    const params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ? OR s.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      // Can match category slug or category_name
      query += ` AND (p.category_name = ? OR p.category_id IN (SELECT id FROM categories WHERE slug = ?))`;
      params.push(category, category);
    }

    if (shop_id) {
      query += ` AND p.shop_id = ?`;
      params.push(Number(shop_id));
    }

    if (min_price) {
      query += ` AND p.price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ` AND p.price <= ?`;
      params.push(Number(max_price));
    }

    if (min_rating) {
      query += ` AND p.rating >= ?`;
      params.push(Number(min_rating));
    }

    if (in_stock === 'true' || in_stock === '1') {
      query += ` AND p.stock > 0`;
    }

    // Sort options
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating DESC, p.rating_count DESC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      case 'popularity':
      default:
        query += ` ORDER BY p.is_featured DESC, p.sales_count DESC, p.rating DESC`;
        break;
    }

    // Calculate total count
    const countSql = `SELECT COUNT(*) as total FROM (${query})`;
    const countRow = db.prepare(countSql).get(...params);
    const total = countRow ? countRow.total : 0;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(query).all(...params);
    const products = rows.map(formatProduct);

    return res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      products
    });
  } catch (error) {
    console.error('List products error:', error);
    return res.status(500).json({ success: false, message: 'Server error listing products' });
  }
});

// GET /api/products/:idOrSlug - Single product details
router.get('/:idOrSlug', (req, res) => {
  try {
    const param = req.params.idOrSlug;
    let product;

    if (/^\d+$/.test(param)) {
      product = db.prepare(`
        SELECT p.*, s.name as shop_name, s.slug as shop_slug, s.address as shop_address, s.pincode as shop_pincode, s.delivery_fee, s.min_order_amount, s.rating as shop_rating
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE p.id = ?
      `).get(Number(param));
    } else {
      product = db.prepare(`
        SELECT p.*, s.name as shop_name, s.slug as shop_slug, s.address as shop_address, s.pincode as shop_pincode, s.delivery_fee, s.min_order_amount, s.rating as shop_rating
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE p.slug = ?
      `).get(param);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const formattedProduct = formatProduct(product);

    // Reviews for this product
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name, u.avatar as user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `).all(formattedProduct.id);

    // Frequently bought together (other products from the same shop)
    const frequentlyBought = db.prepare(`
      SELECT p.*, s.name as shop_name
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.shop_id = ? AND p.id != ? AND p.is_available = 1 AND p.stock > 0
      ORDER BY p.sales_count DESC
      LIMIT 3
    `).all(formattedProduct.shop_id, formattedProduct.id).map(formatProduct);

    // Smart recommendations (similar products in same category from any local store)
    const recommendations = db.prepare(`
      SELECT p.*, s.name as shop_name, s.slug as shop_slug
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.category_name = ? AND p.id != ? AND p.is_available = 1
      ORDER BY p.rating DESC, p.sales_count DESC
      LIMIT 6
    `).all(formattedProduct.category_name, formattedProduct.id).map(formatProduct);

    return res.json({
      success: true,
      product: formattedProduct,
      reviews,
      frequently_bought_together: frequentlyBought,
      recommendations
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products - Create product (Shopkeeper / Admin)
router.post('/', authenticateToken, requireRole('shopkeeper', 'admin'), (req, res) => {
  try {
    // If shopkeeper, find their shop
    let shopId = req.body.shop_id;
    if (req.user.role === 'shopkeeper') {
      const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
      if (!shop) {
        return res.status(400).json({ success: false, message: 'You must have an approved shop before adding products' });
      }
      shopId = shop.id;
    }

    const {
      name, category_id, category_name, description, price, original_price,
      stock, low_stock_threshold = 5, unit = 'item', images = [], thumbnail,
      is_available = 1, is_featured = 0, tags = ''
    } = req.body;

    if (!name || price === undefined || stock === undefined || !category_name) {
      return res.status(400).json({ success: false, message: 'Name, price, stock, and category are required' });
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const imageArray = Array.isArray(images) && images.length > 0 ? images : [thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'];
    const primaryThumb = thumbnail || imageArray[0];

    const insert = db.prepare(`
      INSERT INTO products (
        shop_id, category_id, category_name, name, slug, description, price, original_price,
        stock, low_stock_threshold, unit, images, thumbnail, is_available, is_featured, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      shopId,
      category_id || null,
      category_name,
      name.trim(),
      slug,
      description || '',
      Number(price),
      original_price ? Number(original_price) : null,
      Number(stock),
      Number(low_stock_threshold),
      unit,
      JSON.stringify(imageArray),
      primaryThumb,
      is_available ? 1 : 0,
      is_featured ? 1 : 0,
      tags
    );

    const created = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Product created successfully', product: formatProduct(created) });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, requireRole('shopkeeper', 'admin'), (req, res) => {
  try {
    const productId = req.params.id;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If shopkeeper, ensure they own the shop
    if (req.user.role === 'shopkeeper') {
      const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
      if (!shop || shop.id !== product.shop_id) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this product' });
      }
    }

    const {
      name, category_id, category_name, description, price, original_price,
      stock, low_stock_threshold, unit, images, thumbnail,
      is_available, is_featured, tags
    } = req.body;

    const imagesStr = images ? JSON.stringify(images) : product.images;

    db.prepare(`
      UPDATE products
      SET name = COALESCE(?, name),
          category_id = COALESCE(?, category_id),
          category_name = COALESCE(?, category_name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          original_price = COALESCE(?, original_price),
          stock = COALESCE(?, stock),
          low_stock_threshold = COALESCE(?, low_stock_threshold),
          unit = COALESCE(?, unit),
          images = COALESCE(?, images),
          thumbnail = COALESCE(?, thumbnail),
          is_available = COALESCE(?, is_available),
          is_featured = COALESCE(?, is_featured),
          tags = COALESCE(?, tags)
      WHERE id = ?
    `).run(
      name, category_id, category_name, description, price, original_price,
      stock, low_stock_threshold, unit, imagesStr, thumbnail,
      is_available, is_featured, tags, productId
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    return res.json({ success: true, message: 'Product updated successfully', product: formatProduct(updated) });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticateToken, requireRole('shopkeeper', 'admin'), (req, res) => {
  try {
    const productId = req.params.id;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role === 'shopkeeper') {
      const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
      if (!shop || shop.id !== product.shop_id) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
      }
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

export default router;
