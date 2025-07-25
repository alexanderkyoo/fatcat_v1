"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, Plus, Star, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import menuData from '@/data/menu.json';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  allergies?: string[];
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function Menu() {
  const { getTotalItems, addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(menuData.categories[0].id);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());

  const currentCategory = menuData.categories.find(cat => cat.id === selectedCategory);
  const totalItems = getTotalItems();
  
  // Debug: Log when totalItems changes
  useEffect(() => {
    console.log(`🍽️ Menu: totalItems = ${totalItems}`);
  }, [totalItems]);

  const handleAddToCart = async (item: any) => {
    setAddingItems(prev => new Set(prev).add(item.id));
    
    // Add visual feedback delay
    setTimeout(() => {
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        description: item.description,
        category: currentCategory?.name || 'Other'
      });
      
      setAddingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 300);
  };

  const getCategoryIcon = (categoryName: string) => {
    return null;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-orange-50/30 to-red-50/30">
      {/* Category Tabs */}
      <div className="flex overflow-x-auto bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-10">
        {menuData.categories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-shrink-0 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'border-orange-500 text-orange-600 bg-gradient-to-r from-orange-50 to-red-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-orange-50/50'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {getCategoryIcon(category.name)}
            {category.name}
          </motion.button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {currentCategory?.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/80 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 card-hover"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-600">4.8</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Allergy indicators */}
                    {item.allergies && item.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.allergies.map((allergy) => (
                          <span
                            key={allergy}
                            className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-green-600">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`w-12 h-12 rounded-full font-semibold transition-all duration-300 flex items-center justify-center ${
                            addingItems.has(item.id)
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                          }`}
                          onClick={() => handleAddToCart(item)}
                          disabled={addingItems.has(item.id)}
                        >
                          <AnimatePresence mode="wait">
                            {addingItems.has(item.id) ? (
                              <motion.div
                                key="adding"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="flex items-center justify-center"
                              >
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="add"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="flex items-center justify-center"
                              >
                                <Plus className="w-5 h-5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center text-gray-400 text-xs overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    {item.image ? (
                      <motion.img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-2xl"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.fallback-text') as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : null}
                    <div className="fallback-text w-full h-full flex items-center justify-center text-center" style={{ display: item.image ? 'none' : 'flex' }}>
                      <div className="text-orange-400">
                        <Flame className="w-8 h-8 mx-auto mb-1" />
                        <span className="text-xs">Delicious</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-6 left-4 right-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="w-full h-16 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white text-lg font-bold shadow-2xl rounded-2xl border-0 relative overflow-hidden group"
                onClick={() => {
                  const event = new CustomEvent('showCart');
                  window.dispatchEvent(event);
                }}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  <span>
                    View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                </div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
