"use client";

import { useState, useEffect } from 'react';
import Menu from '@/components/Menu';
import Cart from '@/components/Cart';
import { CartProvider } from '@/contexts/CartContext';

export default function DemoPage() {
  const [showCart, setShowCart] = useState(false);

  // Listen for showCart events from Menu component
  useEffect(() => {
    const handleShowCart = () => {
      setShowCart(true);
    };

    window.addEventListener('showCart', handleShowCart);
    return () => window.removeEventListener('showCart', handleShowCart);
  }, []);

  return (
    <CartProvider>
      <div className="h-screen flex flex-col bg-white">
        {showCart ? (
          <div className="h-full flex flex-col">
            {/* Cart Header with Back Button */}
            <div className="flex items-center p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => setShowCart(false)}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                ← Back to Menu
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Cart />
            </div>
          </div>
        ) : (
          <Menu />
        )}
      </div>
    </CartProvider>
  );
}
