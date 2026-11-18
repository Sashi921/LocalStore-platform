import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [shop, setShop] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('localstore_token') || null);
  const [loading, setLoading] = useState(true);

  // Helper for requests with auth
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };
    return fetch(url, { ...options, headers });
  };

  const refreshProfile = async () => {
    if (!token) {
      setUser(null);
      setShop(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setShop(data.shop || null);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('localstore_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setShop(data.shop || null);
    return data;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('localstore_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setShop(data.shop || null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('localstore_token');
    setToken(null);
    setUser(null);
    setShop(null);
  };

  // Quick Demo Login Helper
  const demoLogin = async (role = 'customer') => {
    const credentials = {
      admin: { email: 'admin@localstore.com', password: 'admin123' },
      shopkeeper: { email: 'greenharvest@localstore.com', password: 'shop123' },
      customer: { email: 'priya@example.com', password: 'customer123' }
    };
    const cred = credentials[role] || credentials.customer;
    return login(cred.email, cred.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        role: user?.role || 'guest',
        login,
        register,
        logout,
        refreshProfile,
        demoLogin,
        authFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
