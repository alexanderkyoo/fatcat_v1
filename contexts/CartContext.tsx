"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiCall } from '@/utils/apiClient';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  findItemByMenuId: (menuItemId: string) => CartItem | undefined;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart data from centralized data structure
  const refreshCart = async () => {
    try {
      console.log('📡 refreshCart called - fetching /api/getCart');
      const response = await apiCall('/api/getCart');
      const result = await response.json();
      if (result.success) {
        setItems(result.data.items);
        console.log('✅ Cart refreshed successfully, items:', result.data.items.length);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  // Load cart on mount - POLLING DISABLED to fix performance issue
  useEffect(() => {
    console.log('🚀 CartProvider mounted - loading initial cart (no polling)');
    refreshCart(); // Only load once on mount
    
    // POLLING DISABLED - cart will only update on user actions
    // If you need real-time updates, enable the polling below:
    // const interval = setInterval(refreshCart, 30000); // Every 30 seconds
    // return () => clearInterval(interval);
  }, []);

  const findItemByMenuId = (menuItemId: string) => {
    return items.find(item => item.menuItemId === menuItemId);
  };

  const addItem = async (newItem: Omit<CartItem, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Use the centralized add_to_cart API
      const response = await apiCall('/api/addToCart', {
        method: 'POST',
        body: JSON.stringify({
          parameters: {
            itemId: newItem.menuItemId,
            quantity: newItem.quantity
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh cart to get updated data
        await refreshCart();
      } else {
        console.error('Failed to add item:', result.error);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      
      // Use the centralized remove_from_cart API
      const response = await apiCall('/api/removeFromCart', {
        method: 'POST',
        body: JSON.stringify({
          parameters: {
            itemId: itemId
          }
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Refresh cart to get updated data
        await refreshCart();
      } else {
        console.error('Failed to remove item:', result.error);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }
      
      // For now, we'll use the cart manager directly
      // In a real app, you might want a dedicated updateQuantity API
      const response = await apiCall('/api/updateCartItem', {
        method: 'POST',
        body: JSON.stringify({
          itemId,
          quantity
        })
      });
      
      // If the API doesn't exist yet, fall back to local update
      if (response.status === 404) {
        // Update locally and refresh
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        const result = await response.json();
        if (result.success) {
          await refreshCart();
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Fall back to local update
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiCall('/api/getCart', {
        method: 'POST',
        body: JSON.stringify({ action: 'clear' })
      });
      
      const result = await response.json();
      if (result.success) {
        setItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      findItemByMenuId,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
