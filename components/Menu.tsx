"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import menuData from '@/data/menu.json';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function Menu() {
  const { getTotalItems, addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(menuData.categories[0].id);

  const currentCategory = menuData.categories.find(cat => cat.id === selectedCategory);
  const totalItems = getTotalItems();
  
  // Debug: Log when totalItems changes
  useEffect(() => {
    console.log(`🍽️ Menu: totalItems = ${totalItems}`);
  }, [totalItems]);

  const handleAddToCart = (item: any) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      description: item.description,
      category: currentCategory?.name || 'Other'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Restaurant Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <h1 className="text-2xl font-bold">{menuData.restaurant.name}</h1>
        <p className="text-orange-100">{menuData.restaurant.description}</p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
        {menuData.categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              selectedCategory === category.id
                ? 'border-orange-500 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {currentCategory?.items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${item.price.toFixed(2)}
                    </span>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
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
                    No Image
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold shadow-lg"
            onClick={() => {
              // This will be handled by the parent component to show cart
              const event = new CustomEvent('showCart');
              window.dispatchEvent(event);
            }}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </Button>
        </div>
      )}

    </div>
  );
}
