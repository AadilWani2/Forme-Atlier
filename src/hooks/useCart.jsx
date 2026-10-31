/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "forme-studio-cart-v1";
const CartContext = createContext(null);

function readCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("FORME Studio could not persist the cart in this browser.", error);
    }
  }, [items]);

  const addItem = (item) => {
    setItems((current) => [...current, { ...item, quantity: 1 }]);
  };

  const removeItem = (itemId) => {
    setItems((current) => current.filter((item) => item.cartId !== itemId));
  };

  const updateItem = (itemId, updates) => {
    setItems((current) => current.map((item) =>
      item.cartId === itemId ? { ...item, ...updates, cartId: itemId } : item
    ));
  };

  const updateQuantity = (itemId, quantity) => {
    const safeQuantity = Math.max(1, Math.min(99, Number(quantity) || 1));
    setItems((current) => current.map((item) =>
      item.cartId === itemId ? { ...item, quantity: safeQuantity } : item
    ));
  };

  const clearCart = () => setItems([]);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(() => ({
    items, addItem, updateItem, removeItem, updateQuantity, clearCart, cartCount, subtotal,
  }), [items, cartCount, subtotal]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
