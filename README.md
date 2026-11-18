# 🏪 LocalStore - Neighborhood E-commerce Marketplace

**LocalStore** is a modern, responsive, full-stack local store e-commerce marketplace connecting neighborhood shopkeepers with nearby customers. Customers can discover nearby stores on an interactive map, browse products by category, compare prices, apply discount coupons, checkout with Cash on Delivery or simulated card payments, track live order progress, and review shops. Local merchants get a dedicated dashboard for catalog management, stock alerts, sales analytics, and order fulfillment. Administrators have complete platform governance, store moderation, and ticket dispute resolution.

---

## 🚀 Key Features

### 1. 🛍️ Customer Storefront & Shopping Experience
- **Hero & Discovery**: Clean white & emerald design inspired by modern storefronts (Amazon/Shopify) with fast neighborhood selection.
- **Location-Based Shopping**: Select delivery PIN code (e.g. `110001`, `110005`) or use GPS to calculate live store distances using the Haversine formula and OpenStreetMap.
- **Product Catalog & Filters**: Search products by name, filter by category, price range, customer ratings, in-stock only, and sort by popularity, price or newest.
- **Product Details & Gallery**: Multi-image thumbnail gallery, verified store badge, stock warning (`Only X left!`), unit specifications, and frequently bought together suggestions.
- **Cart & Server-Side Validation**: Stock limit enforcement, quantity stepper, coupon engine (`WELCOME50`, `LOCAL10`, `FESTIVE25`), delivery fee calculation.
- **Checkout & Celebration**: Saved address selection, new address form, Cash on Delivery (COD) or simulated online card payment, celebratory confetti animation.
- **Live 5-Stage Order Tracking**: Visual progress timeline (`Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`) with direct store phone contact.
- **Wishlist & 4-Product Side-by-Side Comparison**: Compare price, ratings, pack size, and availability.
- **Customer Reviews**: 1 to 5 star rating submission with instant product and shop rating recalculation.

### 2. 🏪 Local Shopkeeper Portal
- **Overview Metrics**: Total sales GMV, today's revenue, active order count, and low-stock alerts.
- **Sales Analytics Charts**: 7-day revenue trend chart (Recharts) and top-selling products leaderboard.
- **Inventory & Stock Management**: Add new products with image URLs, set prices, edit quantities inline, and receive low-stock warnings.
- **Order Processing**: Advance order stages from acceptance to packaging, dispatching, and delivery with custom merchant dispatch notes.
- **Storefront Settings**: Configure operating hours, delivery radius (km), delivery fee, logo, banner, and store contact info.

### 3. 🛡️ Admin Control Center
- **Platform Analytics**: Gross platform sales, total registered stores, active customers, order volume.
- **Store Moderation**: Approve, reject, or suspend registered shopkeeper stores.
- **User Management**: Monitor customers and shopkeepers; toggle account status (`active` / `blocked`).
- **Global Order Log**: Inspect all marketplace transactions across all neighborhood vendors.
- **Customer Dispute & Complaint Desk**: Review customer complaint tickets, assign resolution notes, and notify users.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet & OpenStreetMap, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js (ES Modules), CORS, dotenv |
| **Database** | SQLite via built-in `node:sqlite` (DatabaseSync, WAL mode, synchronous foreign keys) |
| **Authentication** | JWT (JSON Web Tokens) + `bcryptjs` password hashing |

---

## 📂 Project Structure

```
localstore/
├── package.json               # Root scripts
├── .env.example               # Environment variables template
├── README.md                  # Complete documentation
├── server/                    # Node.js + Express Backend
│   ├── package.json
│   ├── localstore.db          # SQLite persistent database file
│   └── src/
│       ├── index.js           # Server entry point & static dist serving
│       ├── db/
│       │   ├── connection.js  # node:sqlite connection
│       │   ├── schema.js      # All database tables, indexes & schema
│       │   └── seed.js        # Realistic demo data seed script
│       ├── middleware/
│       │   └── auth.js        # JWT verification & role authorization
│       └── routes/
│           ├── auth.js        # Registration, login, profile, addresses
│           ├── shops.js       # Store catalog, geolocation & distance
│           ├── products.js    # Product search, filter, CRUD
│           ├── cart.js        # Cart management & stock check
│           ├── wishlist.js    # Wishlist toggle
│           ├── orders.js      # Order placement, server total calculation
│           ├── coupons.js     # Coupon validation engine
│           ├── reviews.js     # Customer reviews & rating recalculation
│           ├── shopkeeper.js  # Shopkeeper dashboard stats & orders
│           ├── admin.js       # Admin stats, moderation & disputes
│           └── support.js     # Complaints, tickets & search suggestions
└── client/                    # React Frontend
    ├── package.json
    ├── vite.config.js         # Port 3000 & API proxy to port 5000
    ├── tailwind.config.js     # Emerald brand color theme
    ├── index.html
    └── src/
        ├── App.jsx            # Main app shell & router
        ├── main.jsx           # React DOM root
        ├── index.css          # Tailwind directives & Leaflet styles
        ├── context/           # Auth, Cart, Wishlist, Location, Toast, Compare
        ├── components/        # Navbar, Footer, ProductCard, ShopCard, LeafletMap, etc.
        └── pages/             # 23 full-featured pages (Home, Products, ShopDetails, etc.)
```

---

## 🔑 Pre-Configured Demo Accounts

For immediate testing, 1-click login buttons are available on the **Login** and **Checkout** pages:

| Role | Email | Password | Access / Scope |
|---|---|---|---|
| **Platform Admin** | `admin@localstore.com` | `admin123` | Full admin control, store approval, user management |
| **Shopkeeper** | `greenharvest@localstore.com` | `shop123` | Green Harvest Mart dashboard, inventory, orders |
| **Shopkeeper** | `artisan@localstore.com` | `shop123` | The Artisan Bakehouse storefront & orders |
| **Shopkeeper** | `metro@localstore.com` | `shop123` | Metro Tech & Gadgets store |
| **Customer** | `priya@example.com` | `customer123` | Saved addresses, order history, active cart |

### Demo Coupons:
- `WELCOME50` - 50% discount up to ₹150 (Min order: ₹299)
- `LOCAL10` - 10% instant discount (Min order: ₹199)
- `FESTIVE25` - 25% discount up to ₹250 (Min order: ₹499)

---

## 💻 How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested and verified on Node v26)
- **NPM**: v9.0.0 or higher

### 2. Run Database Seeding
To seed realistic stores, products, reviews, and test orders:
```bash
npm run seed
# or
cd server && node src/db/seed.js
```

### 3. Start the Server
From the root directory:
```bash
npm run server
# or
cd server && npm start
```
*The server runs at `http://localhost:5000`.*
Because the React client build is bundled in `client/dist`, visiting `http://localhost:5000` serves the full frontend and backend together!

### 4. Optional: Start Frontend in Vite Dev Mode
For hot-module replacement during UI development:
```bash
cd client
npm run dev
```
*Vite dev server will start at `http://localhost:3000` with automatic API proxying.*

---

## 📡 REST API Summary

- `POST /api/auth/register` - Create customer or shopkeeper account
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/shops` - List shops with live distance calculation & filter
- `GET /api/shops/:id` - Shop details, products, and reviews
- `GET /api/products` - Search and filter products
- `POST /api/cart` - Add item to cart with stock validation
- `POST /api/orders` - Place order with server-side stock and total verification
- `GET /api/orders/track/:orderNumber` - Real-time 5-stage order progress
- `GET /api/shopkeeper/stats` - Merchant revenue and order metrics
- `PUT /api/shopkeeper/orders/:id/status` - Advance order stage
- `GET /api/admin/stats` - Platform KPIs and moderation stats
- `POST /api/support/tickets` - File a customer support dispute
