import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/connection.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register user
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone, address, city, pincode, shopName, shopCategory, shopAddress, shopPincode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    if (!['customer', 'shopkeeper'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role, phone, address, city, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      role,
      phone || null,
      address || null,
      city || 'New Delhi',
      pincode || '110001'
    );

    const userId = result.lastInsertRowid;

    // If shopkeeper registering, create pending/approved shop
    let createdShop = null;
    if (role === 'shopkeeper' && shopName) {
      const baseSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const insertShop = db.prepare(`
        INSERT INTO shops (
          owner_id, name, slug, description, category, phone, email,
          address, city, pincode, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const shopRes = insertShop.run(
        userId,
        shopName.trim(),
        uniqueSlug,
        `Welcome to ${shopName.trim()}`,
        shopCategory || 'Groceries & Staples',
        phone || '',
        email.toLowerCase().trim(),
        shopAddress || address || 'Connaught Place',
        city || 'New Delhi',
        shopPincode || pincode || '110001',
        'approved' // Pre-approved for instant demo testing
      );

      createdShop = db.prepare('SELECT * FROM shops WHERE id = ?').get(shopRes.lastInsertRowid);
    }

    const user = db.prepare('SELECT id, name, email, role, phone, avatar, address, city, pincode FROM users WHERE id = ?').get(userId);
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user,
      shop: createdShop
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let shop = null;
    if (user.role === 'shopkeeper') {
      shop = db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(user.id);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      city: user.city,
      pincode: user.pincode
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: safeUser,
      shop
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Get current profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    let shop = null;
    if (req.user.role === 'shopkeeper') {
      shop = db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(req.user.id);
    }

    const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.id);

    return res.json({
      success: true,
      user: req.user,
      shop,
      addresses
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

// Update profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, phone, address, city, pincode, avatar } = req.body;

    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          city = COALESCE(?, city),
          pincode = COALESCE(?, pincode),
          avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(name, phone, address, city, pincode, avatar, req.user.id);

    const updatedUser = db.prepare('SELECT id, name, email, role, phone, avatar, address, city, pincode FROM users WHERE id = ?').get(req.user.id);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// Customer addresses
router.get('/addresses', authenticateToken, (req, res) => {
  try {
    const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC').all(req.user.id);
    return res.json({ success: true, addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
});

router.post('/addresses', authenticateToken, (req, res) => {
  try {
    const { label = 'Home', full_name, phone, street_address, city, pincode, state = 'Delhi', is_default = 0 } = req.body;

    if (!full_name || !phone || !street_address || !pincode) {
      return res.status(400).json({ success: false, message: 'Name, phone, street address, and pincode are required' });
    }

    if (is_default) {
      db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    const insert = db.prepare(`
      INSERT INTO user_addresses (user_id, label, full_name, phone, street_address, city, pincode, state, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      req.user.id,
      label,
      full_name,
      phone,
      street_address,
      city || 'New Delhi',
      pincode,
      state,
      is_default ? 1 : 0
    );

    const address = db.prepare('SELECT * FROM user_addresses WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ success: true, message: 'Address added', address });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add address' });
  }
});

router.delete('/addresses/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    return res.json({ success: true, message: 'Address removed' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
});

export default router;
