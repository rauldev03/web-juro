import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, Color, Size, ProductVariant } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, color: Color, size: Size, variant: ProductVariant, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (cart_id: string) => void;
  updateQuantity: (cart_id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('kkrius_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('kkrius_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, color: Color, size: Size, variant: ProductVariant, quantity = 1) => {
    const variantId = variant.variant_id || variant.id;
    if (!variantId) {
      return { success: false, message: 'Variante no válida seleccionada' };
    }

    if (variant.stock <= 0) {
      return { success: false, message: 'Esta variante se encuentra agotada.' };
    }

    const cart_id = `${product.id}-${color.id}-${size.id}`;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cart_id === cart_id);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, variant.stock);
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          max_stock: variant.stock
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cart_id,
          product_id: product.id,
          variant_id: variantId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.primary_image || (product.images && product.images[0]?.image_url) || '',
          color: { id: color.id, name: color.name, hex_code: color.hex_code },
          size: { id: size.id, name: size.name },
          quantity: Math.min(quantity, variant.stock),
          max_stock: variant.stock
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
    return { success: true };
  };

  const removeFromCart = (cart_id: string) => {
    setCart(prev => prev.filter(item => item.cart_id !== cart_id));
  };

  const updateQuantity = (cart_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cart_id);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.cart_id === cart_id) {
          const validQty = Math.min(quantity, item.max_stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
