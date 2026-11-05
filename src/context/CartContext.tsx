import React, { createContext, useContext, useState, useEffect } from 'react';
import { Producto, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (producto: Producto, cantidad?: number) => { success: boolean; message?: string };
  updateQuantity: (productoId: number, cantidad: number) => void;
  removeFromCart: (productoId: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'tienda_panaderia_carrito_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error guardando carrito en localStorage:', e);
    }
  }, [items]);

  const addToCart = (producto: Producto, cantidad: number = 1): { success: boolean; message?: string } => {
    if (producto.stock <= 0) {
      return { success: false, message: `"${producto.nombre}" no tiene stock disponible.` };
    }

    let success = true;
    let message: string | undefined;

    setItems((prev) => {
      const existing = prev.find((it) => it.producto.id === producto.id);
      if (existing) {
        const nuevaCantidad = existing.cantidad + cantidad;
        if (nuevaCantidad > producto.stock) {
          success = false;
          message = `No hay más stock disponible de "${producto.nombre}" (Máximo: ${producto.stock})`;
          return prev;
        }
        return prev.map((it) =>
          it.producto.id === producto.id ? { ...it, cantidad: nuevaCantidad } : it
        );
      } else {
        if (cantidad > producto.stock) {
          success = false;
          message = `Solo hay ${producto.stock} unidad(es) de "${producto.nombre}".`;
          return prev;
        }
        return [...prev, { producto, cantidad }];
      }
    });

    return { success, message };
  };

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.producto.id === productoId) {
          const qty = Math.min(cantidad, it.producto.stock);
          return { ...it, cantidad: qty };
        }
        return it;
      })
    );
  };

  const removeFromCart = (productoId: number) => {
    setItems((prev) => prev.filter((it) => it.producto.id !== productoId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);
  const subtotal = items.reduce((acc, it) => acc + it.producto.precio * it.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};
