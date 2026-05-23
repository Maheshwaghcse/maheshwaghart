import React, { createContext, useState, useContext } from 'react';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    // If a different user is logging in, clear the cart first
    const prevUser = localStorage.getItem('userInfo');
    if (prevUser) {
      const prev = JSON.parse(prevUser);
      if (prev._id !== data._id) {
        localStorage.removeItem('cartItems');
      }
    }
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUserInfo(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems'); // clear cart on logout
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
