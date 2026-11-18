import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, authFetch } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(25);
  const [coupon, setCoupon] = useState(null); // { code, discount_amount }
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend when user is authenticated
  const fetchCart = async () => {
    if (!isAuthenticated) {
      // Local storage fallback for guests
      const saved = localStorage.getItem('localstore_guest_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setItems(parsed);
          calculateLocalTotals(parsed);
        } catch (e) {
          setItems([]);
        }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setSubtotal(data.subtotal);
        setDeliveryFee(data.delivery_fee);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalTotals = (cartItems) => {
    const sub = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setSubtotal(sub);
    setDeliveryFee(cartItems.length > 0 ? (cartItems[0].delivery_fee || 25) : 0);
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const res = await authFetch('/api/cart', {
          method: 'POST',
          body: JSON.stringify({ product_id: product.id, quantity })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Added ${product.name} to cart!`, 'success');
          await fetchCart();
        } else {
          showToast(data.message || 'Could not add to cart', 'error');
        }
      } catch (err) {
        showToast('Failed to add item to cart', 'error');
      }
    } else {
      // Guest mode
      setItems(prev => {
        const idx = prev.findIndex(i => i.product_id === product.id);
        let updated;
        if (idx >= 0) {
          updated = [...prev];
          updated[idx].quantity += quantity;
        } else {
          updated = [...prev, {
            product_id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            unit: product.unit,
            thumbnail: product.thumbnail,
            shop_id: product.shop_id,
            shop_name: product.shop_name,
            delivery_fee: product.delivery_fee || 25,
            quantity
          }];
        }
        localStorage.setItem('localstore_guest_cart', JSON.stringify(updated));
        calculateLocalTotals(updated);
        showToast(`Added ${product.name} to cart!`, 'success');
        return updated;
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await authFetch(`/api/cart/${productId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (data.success) {
          await fetchCart();
        } else {
          showToast(data.message, 'error');
        }
      } catch (err) {
        showToast('Failed to update quantity', 'error');
      }
    } else {
      setItems(prev => {
        let updated;
        if (quantity <= 0) {
          updated = prev.filter(i => i.product_id !== productId);
        } else {
          updated = prev.map(i => i.product_id === productId ? { ...i, quantity } : i);
        }
        localStorage.setItem('localstore_guest_cart', JSON.stringify(updated));
        calculateLocalTotals(updated);
        return updated;
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        await authFetch(`/api/cart/${productId}`, { method: 'DELETE' });
        await fetchCart();
        showToast('Item removed from cart', 'info');
      } catch (err) {
        showToast('Failed to remove item', 'error');
      }
    } else {
      setItems(prev => {
        const updated = prev.filter(i => i.product_id !== productId);
        localStorage.setItem('localstore_guest_cart', JSON.stringify(updated));
        calculateLocalTotals(updated);
        showToast('Item removed from cart', 'info');
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await authFetch('/api/cart', { method: 'DELETE' });
      await fetchCart();
    } else {
      localStorage.removeItem('localstore_guest_cart');
      setItems([]);
      setSubtotal(0);
      setDeliveryFee(0);
    }
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setCoupon(data.coupon);
        showToast(data.message, 'success');
        return true;
      } else {
        showToast(data.message || 'Invalid coupon', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error validating coupon', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const discountAmount = coupon ? coupon.discount_amount : 0;
  const total = Math.max(0, subtotal + (items.length > 0 ? deliveryFee : 0) - discountAmount);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee: items.length > 0 ? deliveryFee : 0,
        discountAmount,
        total,
        coupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
