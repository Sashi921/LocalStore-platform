import bcrypt from 'bcryptjs';
import db from './connection.js';
import { initSchema } from './schema.js';

export function runSeed() {
  initSchema();

  console.log('Seeding LocalStore database with realistic demo data...');

  // Clear existing data in correct foreign key order
  db.exec(`
    DELETE FROM support_tickets;
    DELETE FROM notifications;
    DELETE FROM reviews;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM wishlist_items;
    DELETE FROM cart_items;
    DELETE FROM products;
    DELETE FROM categories;
    DELETE FROM shops;
    DELETE FROM user_addresses;
    DELETE FROM coupons;
    DELETE FROM users;
  `);

  // 1. Seed Users
  const salt = bcrypt.genSaltSync(10);
  const adminPassword = bcrypt.hashSync('admin123', salt);
  const shopPassword = bcrypt.hashSync('shop123', salt);
  const customerPassword = bcrypt.hashSync('customer123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password, role, phone, avatar, address, city, pincode, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run(
    'Platform Admin',
    'admin@localstore.com',
    adminPassword,
    'admin',
    '+91 98765 00001',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'Civic Center, Connaught Place',
    'New Delhi',
    '110001',
    'active'
  ).lastInsertRowid;

  const shopUser1Id = insertUser.run(
    'Ramesh Sharma (Green Harvest)',
    'greenharvest@localstore.com',
    shopPassword,
    'shopkeeper',
    '+91 98111 22334',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Shop 12, Main Market, Connaught Place',
    'New Delhi',
    '110001',
    'active'
  ).lastInsertRowid;

  const shopUser2Id = insertUser.run(
    'Chef Ananya Rao (Artisan Bakehouse)',
    'artisan@localstore.com',
    shopPassword,
    'shopkeeper',
    '+91 98222 33445',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    '44 Middle Circle, Connaught Place',
    'New Delhi',
    '110001',
    'active'
  ).lastInsertRowid;

  const shopUser3Id = insertUser.run(
    'Vikram Mehta (Metro Electronics)',
    'metro@localstore.com',
    shopPassword,
    'shopkeeper',
    '+91 98333 44556',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    '78 Electronics Arcade, Karol Bagh',
    'New Delhi',
    '110005',
    'active'
  ).lastInsertRowid;

  const shopUser4Id = insertUser.run(
    'Dr. Sunita Gupta (PureCare Pharmacy)',
    'purecare@localstore.com',
    shopPassword,
    'shopkeeper',
    '+91 98444 55667',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    '15 Health Complex, Barakhamba Road',
    'New Delhi',
    '110001',
    'active'
  ).lastInsertRowid;

  const customer1Id = insertUser.run(
    'Priya Verma',
    'priya@example.com',
    customerPassword,
    'customer',
    '+91 98765 43210',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'Flat 302, Regency Apartments, KG Marg',
    'New Delhi',
    '110001',
    'active'
  ).lastInsertRowid;

  const customer2Id = insertUser.run(
    'Rahul Kapoor',
    'rahul@example.com',
    customerPassword,
    'customer',
    '+91 98989 12345',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    'B-14 Panchsheel Enclave',
    'New Delhi',
    '110017',
    'active'
  ).lastInsertRowid;

  // 2. Seed Addresses for Customer
  const insertAddress = db.prepare(`
    INSERT INTO user_addresses (user_id, label, full_name, phone, street_address, city, pincode, state, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAddress.run(
    customer1Id,
    'Home',
    'Priya Verma',
    '+91 98765 43210',
    'Flat 302, Regency Apartments, KG Marg',
    'New Delhi',
    '110001',
    'Delhi',
    1
  );

  insertAddress.run(
    customer1Id,
    'Office',
    'Priya Verma',
    '+91 98765 43210',
    '4th Floor, Tech Hub, Barakhamba Road',
    'New Delhi',
    '110001',
    'Delhi',
    0
  );

  // 3. Seed Categories
  const categoriesData = [
    {
      name: 'Groceries & Staples',
      slug: 'groceries-staples',
      icon: 'ShoppingBag',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
      description: 'Farm fresh vegetables, organic fruits, whole grains and daily culinary pantry items.',
      display_order: 1
    },
    {
      name: 'Bakery & Patisserie',
      slug: 'bakery-patisserie',
      icon: 'Cake',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
      description: 'Freshly baked sourdough breads, artisanal croissants, muffins and custom celebration cakes.',
      display_order: 2
    },
    {
      name: 'Electronics & Gadgets',
      slug: 'electronics-gadgets',
      icon: 'Smartphone',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      description: 'Premium cables, high-speed power adapters, ANC headphones, smart watches and accessories.',
      display_order: 3
    },
    {
      name: 'Pharmacy & Wellness',
      slug: 'pharmacy-wellness',
      icon: 'HeartPulse',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
      description: 'Prescription medicines, daily vitamins, herbal wellness supplements and first aid essentials.',
      display_order: 4
    },
    {
      name: 'Dairy & Beverages',
      slug: 'dairy-beverages',
      icon: 'Coffee',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
      description: 'Pure A2 milk, farm paneer, fresh yogurt, artisanal butter and specialty teas.',
      display_order: 5
    },
    {
      name: 'Spices & Dry Fruits',
      slug: 'spices-dry-fruits',
      icon: 'Sparkles',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500',
      description: 'Hand-picked Kashmiri saffron, whole spices, roasted almonds, cashews and natural honey.',
      display_order: 6
    }
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, icon, image, description, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const categoryMap = {};
  for (const cat of categoriesData) {
    const res = insertCategory.run(cat.name, cat.slug, cat.icon, cat.image, cat.description, cat.display_order);
    categoryMap[cat.slug] = res.lastInsertRowid;
  }

  // 4. Seed Shops
  const shopsData = [
    {
      owner_id: shopUser1Id,
      name: 'Green Harvest Organic Mart',
      slug: 'green-harvest',
      description: 'Your neighborhood trusted store for 100% certified organic vegetables, daily pulses, cold-pressed oils, and farm fresh greens.',
      category: 'Groceries & Staples',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
      banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200',
      phone: '+91 98111 22334',
      email: 'greenharvest@localstore.com',
      address: 'Shop 12, Block B, Inner Circle, Connaught Place',
      city: 'New Delhi',
      pincode: '110001',
      latitude: 28.6328,
      longitude: 77.2197,
      opening_time: '08:00',
      closing_time: '21:30',
      is_open: 1,
      delivery_radius_km: 8.5,
      delivery_fee: 20.0,
      min_order_amount: 149.0,
      status: 'approved',
      rating: 4.8,
      rating_count: 142
    },
    {
      owner_id: shopUser2Id,
      name: 'The Artisan Bakehouse & Cafe',
      slug: 'artisan-bakehouse',
      description: 'Handcrafted sourdough, French butter croissants, rich truffle brownies and sourdough pizzas baked fresh thrice daily.',
      category: 'Bakery & Patisserie',
      logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
      banner: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200',
      phone: '+91 98222 33445',
      email: 'artisan@localstore.com',
      address: '44 Middle Circle, Connaught Place',
      city: 'New Delhi',
      pincode: '110001',
      latitude: 28.6315,
      longitude: 77.2185,
      opening_time: '07:30',
      closing_time: '22:00',
      is_open: 1,
      delivery_radius_km: 12.0,
      delivery_fee: 30.0,
      min_order_amount: 199.0,
      status: 'approved',
      rating: 4.9,
      rating_count: 218
    },
    {
      owner_id: shopUser3Id,
      name: 'Metro Tech & Mobile Express',
      slug: 'metro-tech',
      description: 'Authorized retailer for genuine smartphone accessories, fast GaN chargers, ANC wireless headphones, and PC peripherals.',
      category: 'Electronics & Gadgets',
      logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      banner: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200',
      phone: '+91 98333 44556',
      email: 'metro@localstore.com',
      address: '78 Electronics Arcade, Ajmal Khan Road, Karol Bagh',
      city: 'New Delhi',
      pincode: '110005',
      latitude: 28.6517,
      longitude: 77.1906,
      opening_time: '10:00',
      closing_time: '20:30',
      is_open: 1,
      delivery_radius_km: 15.0,
      delivery_fee: 40.0,
      min_order_amount: 299.0,
      status: 'approved',
      rating: 4.7,
      rating_count: 89
    },
    {
      owner_id: shopUser4Id,
      name: 'PureCare Meds & Wellness Store',
      slug: 'purecare-pharmacy',
      description: 'Registered community pharmacy stocking essential medications, Ayurvedic immunity boosters, wellness monitors and first-aid kits.',
      category: 'Pharmacy & Wellness',
      logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
      banner: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200',
      phone: '+91 98444 55667',
      email: 'purecare@localstore.com',
      address: '15 Health Complex, Barakhamba Road',
      city: 'New Delhi',
      pincode: '110001',
      latitude: 28.6270,
      longitude: 77.2240,
      opening_time: '08:00',
      closing_time: '23:00',
      is_open: 1,
      delivery_radius_km: 10.0,
      delivery_fee: 25.0,
      min_order_amount: 99.0,
      status: 'approved',
      rating: 4.8,
      rating_count: 110
    }
  ];

  const insertShop = db.prepare(`
    INSERT INTO shops (
      owner_id, name, slug, description, category, logo, banner, phone, email,
      address, city, pincode, latitude, longitude, opening_time, closing_time,
      is_open, delivery_radius_km, delivery_fee, min_order_amount, status, rating, rating_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const shopMap = {};
  for (const s of shopsData) {
    const res = insertShop.run(
      s.owner_id, s.name, s.slug, s.description, s.category, s.logo, s.banner,
      s.phone, s.email, s.address, s.city, s.pincode, s.latitude, s.longitude,
      s.opening_time, s.closing_time, s.is_open, s.delivery_radius_km, s.delivery_fee,
      s.min_order_amount, s.status, s.rating, s.rating_count
    );
    shopMap[s.slug] = res.lastInsertRowid;
  }

  // 5. Seed Products
  const productsData = [
    // Green Harvest Products
    {
      shop_id: shopMap['green-harvest'],
      category_id: categoryMap['groceries-staples'],
      category_name: 'Groceries & Staples',
      name: 'Organic Hass Avocados (Pack of 2)',
      slug: 'organic-hass-avocados',
      description: 'Creamy, perfectly ripe organic Hass avocados loaded with heart-healthy monounsaturated fats. Ideal for guacamole, sourdough toast, or green salads.',
      price: 240,
      original_price: 290,
      stock: 35,
      low_stock_threshold: 10,
      unit: 'pack',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800',
        'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'organic,fruits,healthy,keto',
      rating: 4.8,
      rating_count: 42,
      sales_count: 120
    },
    {
      shop_id: shopMap['green-harvest'],
      category_id: categoryMap['groceries-staples'],
      category_name: 'Groceries & Staples',
      name: 'Hydroponic English Spinach (250g)',
      slug: 'hydroponic-english-spinach',
      description: 'Pesticide-free, crisp and washed hydroponic baby spinach leaves bursting with iron, calcium, and antioxidants.',
      price: 65,
      original_price: 85,
      stock: 22,
      low_stock_threshold: 8,
      unit: 'pack',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'organic,greens,spinach,fresh',
      rating: 4.9,
      rating_count: 36,
      sales_count: 85
    },
    {
      shop_id: shopMap['green-harvest'],
      category_id: categoryMap['groceries-staples'],
      category_name: 'Groceries & Staples',
      name: 'Cold Pressed Virgin Mustard Oil (1L)',
      slug: 'cold-pressed-virgin-mustard-oil',
      description: 'Traditional wood-pressed (Kachi Ghani) pure yellow mustard oil preserving natural nutrients, aroma, and pungency for authentic cooking.',
      price: 215,
      original_price: 260,
      stock: 4, // LOW STOCK for alert demo!
      low_stock_threshold: 5,
      unit: 'bottle',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
      is_available: 1,
      is_featured: 0,
      tags: 'oil,cold-pressed,cooking,mustard',
      rating: 4.7,
      rating_count: 19,
      sales_count: 64
    },
    {
      shop_id: shopMap['green-harvest'],
      category_id: categoryMap['dairy-beverages'],
      category_name: 'Dairy & Beverages',
      name: 'Pure Desi Gir Cow A2 Ghee (500ml)',
      slug: 'pure-desi-gir-cow-a2-ghee',
      description: 'Slow-simmered Vedic Bilona method A2 clarified butter from grass-fed Gir cows. Rich aroma, golden grainy texture, easily digestible.',
      price: 890,
      original_price: 999,
      stock: 15,
      low_stock_threshold: 4,
      unit: 'jar',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'ghee,a2,dairy,ayurveda',
      rating: 5.0,
      rating_count: 58,
      sales_count: 94
    },
    {
      shop_id: shopMap['green-harvest'],
      category_id: categoryMap['groceries-staples'],
      category_name: 'Groceries & Staples',
      name: 'Organic Royal Basmati Rice (5kg)',
      slug: 'organic-royal-basmati-rice',
      description: 'Aged for 2 years, extra-long grain aromatic Basmati rice cultivated in Himalayan foothills. Cooks fluffily without sticking.',
      price: 495,
      original_price: 590,
      stock: 28,
      low_stock_threshold: 5,
      unit: 'bag',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
      is_available: 1,
      is_featured: 0,
      tags: 'rice,basmati,staples,grains',
      rating: 4.6,
      rating_count: 31,
      sales_count: 77
    },

    // Artisan Bakehouse Products
    {
      shop_id: shopMap['artisan-bakehouse'],
      category_id: categoryMap['bakery-patisserie'],
      category_name: 'Bakery & Patisserie',
      name: 'Traditional Country Sourdough Loaf (600g)',
      slug: 'traditional-country-sourdough-loaf',
      description: 'Naturally fermented over 36 hours with our wild mother starter. Blistered crispy crust with open, airy, chewy and gently tangy crumb.',
      price: 180,
      original_price: 210,
      stock: 12,
      low_stock_threshold: 5,
      unit: 'loaf',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'bread,sourdough,artisan,bakery',
      rating: 4.9,
      rating_count: 85,
      sales_count: 240
    },
    {
      shop_id: shopMap['artisan-bakehouse'],
      category_id: categoryMap['bakery-patisserie'],
      category_name: 'Bakery & Patisserie',
      name: 'Flaky French Butter Croissants (Box of 2)',
      slug: 'flaky-french-butter-croissants',
      description: 'Laminated with premium 82% Normandy cultured butter. 27 delicate layers baked to a golden honey sheen. Crispy outside, pillowy inside.',
      price: 190,
      original_price: 220,
      stock: 8,
      low_stock_threshold: 4,
      unit: 'box',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'croissant,french,butter,pastry',
      rating: 5.0,
      rating_count: 67,
      sales_count: 180
    },
    {
      shop_id: shopMap['artisan-bakehouse'],
      category_id: categoryMap['bakery-patisserie'],
      category_name: 'Bakery & Patisserie',
      name: 'Belgian Dark Chocolate Sea Salt Brownie',
      slug: 'belgian-dark-chocolate-sea-salt-brownie',
      description: 'Decadent fudge brownie prepared with 70% Callebaut dark chocolate, topped with crunchy Maldon sea salt flakes.',
      price: 135,
      original_price: 160,
      stock: 2, // LOW STOCK!
      low_stock_threshold: 5,
      unit: 'piece',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'chocolate,brownie,dessert,sweet',
      rating: 4.8,
      rating_count: 92,
      sales_count: 310
    },
    {
      shop_id: shopMap['artisan-bakehouse'],
      category_id: categoryMap['bakery-patisserie'],
      category_name: 'Bakery & Patisserie',
      name: 'Blueberry Lemon Glazed Teacake (400g)',
      slug: 'blueberry-lemon-glazed-teacake',
      description: 'Moist vanilla sour cream cake studded with juicy wild blueberries and finished with a zesty Meyer lemon glaze.',
      price: 320,
      original_price: 380,
      stock: 9,
      low_stock_threshold: 3,
      unit: 'cake',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      is_available: 1,
      is_featured: 0,
      tags: 'cake,blueberry,lemon,tea-time',
      rating: 4.7,
      rating_count: 28,
      sales_count: 53
    },

    // Metro Tech Products
    {
      shop_id: shopMap['metro-tech'],
      category_id: categoryMap['electronics-gadgets'],
      category_name: 'Electronics & Gadgets',
      name: '65W GaN Ultra-Fast Dual Port Wall Charger',
      slug: '65w-gan-ultra-fast-charger',
      description: 'Gallium Nitride technology powers this pocket-sized charger. Dual USB-C PD 3.0 ports rapidly charge laptops, tablets, and phones safely.',
      price: 1499,
      original_price: 2199,
      stock: 18,
      low_stock_threshold: 5,
      unit: 'item',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'charger,gan,usb-c,fast-charging',
      rating: 4.7,
      rating_count: 45,
      sales_count: 98
    },
    {
      shop_id: shopMap['metro-tech'],
      category_id: categoryMap['electronics-gadgets'],
      category_name: 'Electronics & Gadgets',
      name: 'Braided 100W USB-C to USB-C Cable (2m)',
      slug: 'braided-100w-usb-c-cable',
      description: 'Military-grade nylon braided cord with zinc alloy connectors. Supports 100W Power Delivery and 480Mbps high-speed data transfer.',
      price: 449,
      original_price: 699,
      stock: 40,
      low_stock_threshold: 10,
      unit: 'item',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      is_available: 1,
      is_featured: 0,
      tags: 'cable,usb-c,durable,charging',
      rating: 4.8,
      rating_count: 53,
      sales_count: 140
    },
    {
      shop_id: shopMap['metro-tech'],
      category_id: categoryMap['electronics-gadgets'],
      category_name: 'Electronics & Gadgets',
      name: 'Wireless ANC Bluetooth Headphones (Black)',
      slug: 'wireless-anc-bluetooth-headphones',
      description: 'Active Noise Cancellation with 40mm neodymium dynamic drivers, 40 hours playtime, dual microphone ENC for crystal clear calls.',
      price: 2999,
      original_price: 4499,
      stock: 7,
      low_stock_threshold: 3,
      unit: 'item',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'audio,anc,headphones,bluetooth',
      rating: 4.6,
      rating_count: 38,
      sales_count: 67
    },
    {
      shop_id: shopMap['metro-tech'],
      category_id: categoryMap['electronics-gadgets'],
      category_name: 'Electronics & Gadgets',
      name: '20,000mAh Magnetic Power Bank with Stand',
      slug: '20000mah-magnetic-power-bank',
      description: 'MagSafe compatible wireless charging with built-in foldable kickstand and 22.5W quick-charge USB-A/C ports.',
      price: 1899,
      original_price: 2599,
      stock: 14,
      low_stock_threshold: 4,
      unit: 'item',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1609592424855-6e54148e65e6?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1609592424855-6e54148e65e6?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'powerbank,battery,magsafe,gadgets',
      rating: 4.8,
      rating_count: 29,
      sales_count: 51
    },

    // PureCare Pharmacy Products
    {
      shop_id: shopMap['purecare-pharmacy'],
      category_id: categoryMap['pharmacy-wellness'],
      category_name: 'Pharmacy & Wellness',
      name: 'Daily Vitamin C 1000mg + Zinc (60 Tablets)',
      slug: 'daily-vitamin-c-zinc-tablets',
      description: 'Immunity booster effervescent and chewable formula with natural amla extract and essential zinc for everyday wellness.',
      price: 349,
      original_price: 499,
      stock: 50,
      low_stock_threshold: 10,
      unit: 'bottle',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
      is_available: 1,
      is_featured: 1,
      tags: 'wellness,vitamins,immunity,health',
      rating: 4.9,
      rating_count: 64,
      sales_count: 190
    },
    {
      shop_id: shopMap['purecare-pharmacy'],
      category_id: categoryMap['pharmacy-wellness'],
      category_name: 'Pharmacy & Wellness',
      name: 'Digital Infrared Forehead Thermometer',
      slug: 'digital-infrared-forehead-thermometer',
      description: 'Non-contact instant 1-second temperature readout with color-coded fever warning screen and 32-reading memory log.',
      price: 899,
      original_price: 1499,
      stock: 12,
      low_stock_threshold: 5,
      unit: 'item',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=500',
      is_available: 1,
      is_featured: 0,
      tags: 'medical,thermometer,health,device',
      rating: 4.7,
      rating_count: 22,
      sales_count: 45
    },
    {
      shop_id: shopMap['purecare-pharmacy'],
      category_id: categoryMap['pharmacy-wellness'],
      category_name: 'Pharmacy & Wellness',
      name: 'Herbal Pain Relief Balm (50g)',
      slug: 'herbal-pain-relief-balm',
      description: 'Formulated with Eucalyptus, Menthol and Nilgiri extracts for rapid relief from headache, muscle aches, and joint stiffness.',
      price: 110,
      original_price: 135,
      stock: 3, // LOW STOCK!
      low_stock_threshold: 5,
      unit: 'jar',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608248597359-5613589b2160?w=800'
      ]),
      thumbnail: 'https://images.unsplash.com/photo-1608248597359-5613589b2160?w=500',
      is_available: 1,
      is_featured: 0,
      tags: 'herbal,ayurveda,pain-relief,balm',
      rating: 4.8,
      rating_count: 41,
      sales_count: 112
    }
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (
      shop_id, category_id, category_name, name, slug, description, price, original_price,
      stock, low_stock_threshold, unit, images, thumbnail, is_available, is_featured,
      tags, rating, rating_count, sales_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const productMap = {};
  for (const p of productsData) {
    const res = insertProduct.run(
      p.shop_id, p.category_id, p.category_name, p.name, p.slug, p.description,
      p.price, p.original_price, p.stock, p.low_stock_threshold, p.unit,
      p.images, p.thumbnail, p.is_available, p.is_featured, p.tags, p.rating,
      p.rating_count, p.sales_count
    );
    productMap[p.slug] = res.lastInsertRowid;
  }

  // 6. Seed Coupons
  const couponsData = [
    {
      code: 'WELCOME50',
      discount_percent: 50,
      max_discount: 150,
      min_order_amount: 299,
      valid_until: '2027-12-31 23:59:59',
      is_active: 1
    },
    {
      code: 'LOCAL10',
      discount_percent: 10,
      max_discount: 100,
      min_order_amount: 199,
      valid_until: '2027-12-31 23:59:59',
      is_active: 1
    },
    {
      code: 'FESTIVE25',
      discount_percent: 25,
      max_discount: 250,
      min_order_amount: 499,
      valid_until: '2027-12-31 23:59:59',
      is_active: 1
    }
  ];

  const insertCoupon = db.prepare(`
    INSERT INTO coupons (code, discount_percent, max_discount, min_order_amount, valid_until, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const c of couponsData) {
    insertCoupon.run(c.code, c.discount_percent, c.max_discount, c.min_order_amount, c.valid_until, c.is_active);
  }

  // 7. Seed Orders with Order Items
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      order_number, user_id, shop_id, subtotal, delivery_fee, discount, coupon_code,
      total, status, payment_method, payment_status, payment_id, delivery_address,
      delivery_city, delivery_pincode, delivery_phone, customer_notes, shopkeeper_notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: Delivered
  const order1Id = insertOrder.run(
    'LOC-2026-90412',
    customer1Id,
    shopMap['green-harvest'],
    480, // subtotal (2x avocado)
    20,  // delivery
    50,  // discount
    'WELCOME50',
    450, // total
    'delivered',
    'online',
    'paid',
    'pay_demo_98412851',
    'Flat 302, Regency Apartments, KG Marg',
    'New Delhi',
    '110001',
    '+91 98765 43210',
    'Please leave with security if unavailable.',
    'Delivered promptly on time.',
    '2026-11-15 14:22:00',
    '2026-11-15 15:45:00'
  ).lastInsertRowid;

  insertOrderItem.run(
    order1Id,
    productMap['organic-hass-avocados'],
    'Organic Hass Avocados (Pack of 2)',
    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
    240,
    2,
    480
  );

  // Order 2: Out for delivery
  const order2Id = insertOrder.run(
    'LOC-2026-90435',
    customer1Id,
    shopMap['artisan-bakehouse'],
    370,
    30,
    0,
    null,
    400,
    'out_for_delivery',
    'cod',
    'pending',
    null,
    'Flat 302, Regency Apartments, KG Marg',
    'New Delhi',
    '110001',
    '+91 98765 43210',
    'Ring bell twice please.',
    'Rider Manoj is en-route on scooter.',
    '2026-11-18 18:30:00',
    '2026-11-18 19:15:00'
  ).lastInsertRowid;

  insertOrderItem.run(
    order2Id,
    productMap['traditional-country-sourdough-loaf'],
    'Traditional Country Sourdough Loaf (600g)',
    'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
    180,
    1,
    180
  );

  insertOrderItem.run(
    order2Id,
    productMap['flaky-french-butter-croissants'],
    'Flaky French Butter Croissants (Box of 2)',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
    190,
    1,
    190
  );

  // Order 3: Preparing
  const order3Id = insertOrder.run(
    'LOC-2026-90458',
    customer2Id,
    shopMap['metro-tech'],
    1499,
    40,
    100,
    'LOCAL10',
    1439,
    'preparing',
    'online',
    'paid',
    'pay_demo_87319412',
    'B-14 Panchsheel Enclave',
    'New Delhi',
    '110017',
    '+91 98989 12345',
    'Call before dispatching.',
    'Packed in bubble wrap with invoice.',
    '2026-11-18 19:40:00',
    '2026-11-18 19:45:00'
  ).lastInsertRowid;

  insertOrderItem.run(
    order3Id,
    productMap['65w-gan-ultra-fast-charger'],
    '65W GaN Ultra-Fast Dual Port Wall Charger',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500',
    1499,
    1,
    1499
  );

  // 8. Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (user_id, product_id, shop_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(
    customer1Id,
    productMap['organic-hass-avocados'],
    shopMap['green-harvest'],
    5,
    'Super fresh avocados! They ripened beautifully in two days and tasted incredible on my breakfast toast.',
    '2026-11-16 10:15:00'
  );

  insertReview.run(
    customer2Id,
    productMap['traditional-country-sourdough-loaf'],
    shopMap['artisan-bakehouse'],
    5,
    'Hands down the most authentic sourdough in Delhi. Crisp blistered crust and nice sour tang.',
    '2026-11-17 12:30:00'
  );

  insertReview.run(
    customer1Id,
    productMap['flaky-french-butter-croissants'],
    shopMap['artisan-bakehouse'],
    5,
    'Pure buttery bliss! Heated in the oven for 2 minutes and tasted like Paris.',
    '2026-11-17 14:00:00'
  );

  // 9. Seed Cart & Wishlist
  const insertCart = db.prepare(`
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
  `);

  insertCart.run(customer1Id, productMap['hydroponic-english-spinach'], 2);
  insertCart.run(customer1Id, productMap['belgian-dark-chocolate-sea-salt-brownie'], 1);

  const insertWishlist = db.prepare(`
    INSERT INTO wishlist_items (user_id, product_id)
    VALUES (?, ?)
  `);

  insertWishlist.run(customer1Id, productMap['pure-desi-gir-cow-a2-ghee']);
  insertWishlist.run(customer1Id, productMap['wireless-anc-bluetooth-headphones']);

  // 10. Seed Support Tickets
  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (user_id, shop_id, order_id, subject, category, description, status, priority, admin_response)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTicket.run(
    customer1Id,
    shopMap['green-harvest'],
    order1Id,
    'Inquiry about next-day recurring milk delivery',
    'delivery',
    'Hi, do you also supply farm fresh A2 cow milk bottles on a recurring daily subscription?',
    'resolved',
    'medium',
    'Hello Priya! Yes, our shop offers morning milk delivery between 6:30 AM to 8:00 AM. You can place the order directly via our store page.'
  );

  insertTicket.run(
    customer2Id,
    shopMap['metro-tech'],
    order3Id,
    'Warranty card verification for GaN charger',
    'quality',
    'Does the 65W GaN charger include a 1-year official replacement warranty certificate in the package?',
    'in_progress',
    'low',
    'Our team is verifying with Metro Tech. They have included the manufacturer warranty card stamped inside the box.'
  );

  // 11. Seed Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, is_read, link)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    customer1Id,
    'Order LOC-2026-90435 is Out for Delivery! 🛵',
    'The Artisan Bakehouse rider is on the way with your warm breads and croissants.',
    'order',
    0,
    '/orders/track/LOC-2026-90435'
  );

  insertNotification.run(
    shopUser1Id,
    'Low Stock Warning ⚠️',
    'Cold Pressed Virgin Mustard Oil is running low (4 items left). Please replenish inventory.',
    'alert',
    0,
    '/shopkeeper/products'
  );

  insertNotification.run(
    adminId,
    'New Support Ticket Raised',
    'Customer Rahul Kapoor submitted an inquiry regarding order LOC-2026-90458.',
    'info',
    0,
    '/admin/support'
  );

  console.log('✅ LocalStore database successfully seeded with all realistic models, users, shops, products, orders, and tickets!');
}

// If run directly via node
if (process.argv[1].endsWith('seed.js')) {
  runSeed();
}
