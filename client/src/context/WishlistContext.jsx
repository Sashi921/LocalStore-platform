import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, authFetch } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('localstore_wishlist');
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch (e) { setItems([]); }
      }
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch('/api/wishlist');
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = async (product) => {
    if (isAuthenticated) {
      try {
        const res = await authFetch(`/api/wishlist/${product.id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, data.is_in_wishlist ? 'success' : 'info');
          await fetchWishlist();
        }
      } catch (err) {
        showToast('Failed to update wishlist', 'error');
      }
    } else {
      setItems(prev => {
        const exists = prev.some(i => i.id === product.id);
        let updated;
        if (exists) {
          updated = prev.filter(i => i.id !== product.id);
          showToast('Removed from wishlist', 'info');
        } else {
          updated = [...prev, product];
          showToast('Added to wishlist', 'success');
        }
        localStorage.setItem('localstore_wishlist', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const isInWishlist = (productId) => {
    return items.some(i => i.id === productId || i.product_id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        loading,
        toggleWishlist,
        isInWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
