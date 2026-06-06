import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeShop, setActiveShop] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      const u = saved ? JSON.parse(saved) : null;
      return u?.role !== 'superAdmin' ? u?.shop : null;
    } catch {
      return null;
    }
  });
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check login state on initial load
  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await api.auth.me();
          // Resiliently support wrapped { user } or flat user responses
          const loggedUser = res.data?.user || res.data;
          
          if (!loggedUser || !loggedUser.role) {
            throw new Error('Invalid session profile shape.');
          }

          setUser(loggedUser);
          setToken(savedToken);
          localStorage.setItem('user', JSON.stringify(loggedUser));
          
          // Set active shop
          if (loggedUser.role !== 'superAdmin') {
            setActiveShop(loggedUser.shop);
          } else {
            // Load all shops for superAdmin
            const shopsRes = await api.shops.list();
            setShops(shopsRes.data);
            if (shopsRes.data.length > 0) {
              setActiveShop(prev => prev || shopsRes.data[0]); // default to first shop
            }
          }
        } catch (err) {
          console.error('Failed to restore auth session', err);
          logout();
        }
      }
      setLoading(false);
    };
    
    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      // Support both { user, token } and flat user responses
      const loggedUser = res.data?.user || res.data;
      const authToken = res.data?.token || res.data?.jwt;
      
      if (!loggedUser || !loggedUser.role) {
        throw new Error('Authentication response is missing user profile data.');
      }

      setUser(loggedUser);
      if (authToken) {
        setToken(authToken);
        localStorage.setItem('token', authToken);
      }
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      
      if (loggedUser.role !== 'superAdmin') {
        setActiveShop(loggedUser.shop);
      } else {
        const shopsRes = await api.shops.list();
        setShops(shopsRes.data);
        if (shopsRes.data.length > 0) {
          setActiveShop(shopsRes.data[0]);
        }
      }
      
      return loggedUser;
    } catch (err) {
      setUser(null);
      setToken(null);
      setActiveShop(null);
      setShops([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setActiveShop(null);
    setShops([]);
  };

  const selectShop = async (shopId) => {
    if (user && user.role === 'superAdmin') {
      const shop = shops.find(s => s._id === shopId);
      if (shop) {
        setActiveShop(shop);
      }
    }
  };

  const refreshShops = async () => {
    if (user && user.role === 'superAdmin') {
      const shopsRes = await api.shops.list();
      setShops(shopsRes.data);
    }
  };

  const value = {
    user,
    token,
    loading,
    activeShop,
    shops,
    login,
    logout,
    selectShop,
    refreshShops
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

