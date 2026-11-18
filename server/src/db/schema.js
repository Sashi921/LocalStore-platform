import db from './connection.js';

export function initSchema() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'shopkeeper', 'admin')),
      phone TEXT,
      avatar TEXT,
      address TEXT,
      city TEXT,
      pincode TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'blocked')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Shops table
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      logo TEXT,
      banner TEXT,
      phone TEXT,
      email TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      latitude REAL NOT NULL DEFAULT 28.6139,
      longitude REAL NOT NULL DEFAULT 77.2090,
      opening_time TEXT DEFAULT '09:00',
      closing_time TEXT DEFAULT '21:00',
      is_open INTEGER DEFAULT 1,
      delivery_radius_km REAL DEFAULT 10.0,
      delivery_fee REAL DEFAULT 25.0,
      min_order_amount REAL DEFAULT 99.0,
      status TEXT DEFAULT 'approved' CHECK(status IN ('pending', 'approved', 'rejected', 'suspended')),
      rating REAL DEFAULT 4.8,
      rating_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      image TEXT,
      description TEXT,
      display_order INTEGER DEFAULT 0
    );

    -- Products table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      category_name TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      unit TEXT DEFAULT 'item',
      images TEXT, -- JSON array of strings
      thumbnail TEXT,
      is_available INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      tags TEXT, -- comma separated or JSON
      rating REAL DEFAULT 0.0,
      rating_count INTEGER DEFAULT 0,
      sales_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Cart Items
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    -- Wishlist Items
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      subtotal REAL NOT NULL,
      delivery_fee REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      coupon_code TEXT,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed' CHECK(status IN ('placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
      payment_method TEXT NOT NULL DEFAULT 'cod' CHECK(payment_method IN ('cod', 'online')),
      payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'refunded', 'failed')),
      payment_id TEXT,
      delivery_address TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      delivery_pincode TEXT NOT NULL,
      delivery_phone TEXT NOT NULL,
      customer_notes TEXT,
      shopkeeper_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      product_image TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL
    );

    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Coupons
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_percent REAL NOT NULL,
      max_discount REAL,
      min_order_amount REAL DEFAULT 0,
      valid_until DATETIME,
      is_active INTEGER DEFAULT 1
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info', 'order', 'promo', 'alert')),
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Support Tickets / Complaints
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      shop_id INTEGER REFERENCES shops(id) ON DELETE SET NULL,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('delivery', 'quality', 'payment', 'shop_complaint', 'other')),
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
      admin_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Customer Addresses
    CREATE TABLE IF NOT EXISTS user_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT DEFAULT 'Home',
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      state TEXT DEFAULT 'Delhi',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for high performance
    CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
    CREATE INDEX IF NOT EXISTS idx_shops_pincode ON shops(pincode);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
  `);

  console.log('Database schema initialized successfully.');
}
