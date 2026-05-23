import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty) => {
    const existItem = cartItems.find(x => x.sketch === product.sketch);
    if (existItem) {
      setCartItems(cartItems.map(x => x.sketch === existItem.sketch ? { ...product, qty } : x));
    } else {
      setCartItems([...cartItems, { ...product, qty }]);
    }
  };

  const updateCartItem = (id, updates) => {
    setCartItems(cartItems.map(x => x.sketch === id ? { ...x, ...updates } : x));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(x => x.sketch !== id));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.price;
      const frameTotal = item.includeFrame ? (item.framePrice || 0) : 0;
      return total + itemTotal + frameTotal;
    }, 0);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateCartItem, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
