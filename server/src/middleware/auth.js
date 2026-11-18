import jwt from 'jsonwebtoken';
import db from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'localstore_super_secret_jwt_key_2026';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    // Verify user still exists in database
    const user = db.prepare('SELECT id, name, email, role, phone, avatar, address, city, pincode, status FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User account not found' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Account has been suspended' });
    }

    req.user = user;
    next();
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const user = db.prepare('SELECT id, name, email, role, phone, avatar, address, city, pincode, status FROM users WHERE id = ?').get(decoded.id);
      req.user = user || null;
    } else {
      req.user = null;
    }
    next();
  });
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
