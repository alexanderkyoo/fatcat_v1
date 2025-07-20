"use client";

import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 text-center">
          Start ordering by asking me to add items to your cart!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Order ({getTotalItems()} items)
          </h2>
          <Button
            variant="secondary"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 h-8 px-3 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
                <p className="text-lg font-semibold text-green-600 mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="secondary"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Total */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-2xl font-bold text-green-600">
            ${getTotalPrice().toFixed(2)}
          </span>
        </div>
        <Button className="w-full h-12 text-lg">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
