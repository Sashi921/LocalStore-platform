import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LocationModal from './components/LocationModal';
import CompareModal from './components/CompareModal';

// Contexts
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Shops from './pages/Shops';
import ShopDetails from './pages/ShopDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import ShopkeeperProducts from './pages/ShopkeeperProducts';
import ShopkeeperOrders from './pages/ShopkeeperOrders';
import ShopkeeperSettings from './pages/ShopkeeperSettings';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import HelpSupport from './pages/HelpSupport';
import Login from './pages/Login';
import Register from './pages/Register';

function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order) => {
    setLastPlacedOrder(order);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'products':
        return (
          <Products
            onNavigate={navigateTo}
            initialCategory={pageParams.category || 'all'}
            initialSearch={pageParams.search || ''}
          />
        );
      case 'product-details':
        return <ProductDetails productId={pageParams.productId} onNavigate={navigateTo} />;
      case 'shops':
        return <Shops onNavigate={navigateTo} />;
      case 'shop-details':
        return <ShopDetails shopId={pageParams.shopId} onNavigate={navigateTo} />;
      case 'cart':
        return <Cart onNavigate={navigateTo} />;
      case 'checkout':
        return <Checkout onNavigate={navigateTo} onOrderSuccess={handleOrderSuccess} />;
      case 'order-confirmation':
        return <OrderConfirmation order={lastPlacedOrder} onNavigate={navigateTo} />;
      case 'order-tracking':
        return <OrderTracking orderNumber={pageParams.orderNumber} onNavigate={navigateTo} />;
      case 'wishlist':
        return <Wishlist onNavigate={navigateTo} />;
      case 'orders':
        return <CustomerOrders onNavigate={navigateTo} />;
      case 'profile':
        return <CustomerProfile onNavigate={navigateTo} />;
      case 'shopkeeper-dashboard':
        return <ShopkeeperDashboard onNavigate={navigateTo} />;
      case 'shopkeeper-products':
        return <ShopkeeperProducts onNavigate={navigateTo} />;
      case 'shopkeeper-orders':
        return <ShopkeeperOrders onNavigate={navigateTo} />;
      case 'shopkeeper-settings':
        return <ShopkeeperSettings onNavigate={navigateTo} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigateTo} />;
      case 'about':
        return <About onNavigate={navigateTo} />;
      case 'contact':
        return <Contact onNavigate={navigateTo} />;
      case 'help':
        return <HelpSupport onNavigate={navigateTo} />;
      case 'login':
        return <Login onNavigate={navigateTo} />;
      case 'register':
        return <Register onNavigate={navigateTo} />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar onNavigate={navigateTo} currentPage={currentPage} />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer onNavigate={navigateTo} />

      {/* Global Modals */}
      <LocationModal />
      <CompareModal onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <MainApp />
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
