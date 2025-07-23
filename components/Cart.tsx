"use client";

import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50/50 via-white to-red-50/50">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-full flex items-center justify-center mb-6 mx-auto"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <ShoppingCart className="w-12 h-12 text-orange-600" />
          </motion.div>
          
          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-700 mb-3"
          >
            Your cart is empty
          </motion.h3>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-center max-w-sm leading-relaxed"
          >
            Start ordering by asking me to add items to your cart or browse our delicious menu!
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-col gap-2 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Try saying "Add a burger to my cart"</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Or browse the menu below</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-orange-50/30 to-red-50/30">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 bg-white/80 backdrop-blur-sm border-b border-orange-200/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
              <p className="text-sm text-gray-600">{getTotalItems()} items</p>
            </div>
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 px-4 text-sm rounded-xl border border-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              layout
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-orange-200/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-green-600">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      each
                    </span>
                  </div>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="secondary"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="secondary"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-10 w-10 p-0 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 border border-orange-200 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    key={item.quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="w-12 text-center"
                  >
                    <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="secondary"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-10 w-10 p-0 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 border border-orange-200"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                  <motion.p
                    key={item.quantity * item.price}
                    initial={{ scale: 1.1, color: "#f97316" }}
                    animate={{ scale: 1, color: "#059669" }}
                    className="text-xl font-bold text-green-600"
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer with Total */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-t border-orange-200/50 p-6 bg-white/90 backdrop-blur-sm"
      >
        {/* Order Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8.5%)</span>
            <span className="font-medium">${(getTotalPrice() * 0.085).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium text-green-600">FREE</span>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <motion.span
                key={getTotalPrice()}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-green-600"
              >
                ${(getTotalPrice() * 1.085).toFixed(2)}
              </motion.span>
            </div>
          </div>
        </div>
        
        {/* Checkout Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-3">
              <CreditCard className="w-6 h-6" />
              <span>Proceed to Checkout</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </div>
          </Button>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
