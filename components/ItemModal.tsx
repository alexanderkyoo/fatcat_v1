"use client";

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { X, Plus, Minus } from 'lucide-react';

interface OptionChoice {
  id: string;
  name: string;
  price: number;
}

interface ItemOption {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  maxSelections?: number;
  choices: OptionChoice[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  options: ItemOption[];
}

interface ItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemModal({ item, isOpen, onClose }: ItemModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  if (!isOpen) return null;

  const handleOptionChange = (optionId: string, choiceId: string, isMultiple: boolean) => {
    setSelectedOptions(prev => {
      if (isMultiple) {
        const current = prev[optionId] || [];
        const option = item.options.find(opt => opt.id === optionId);
        const maxSelections = option?.maxSelections;
        
        if (current.includes(choiceId)) {
          return {
            ...prev,
            [optionId]: current.filter(id => id !== choiceId)
          };
        } else {
          if (maxSelections && current.length >= maxSelections) {
            return prev; // Don't add if max selections reached
          }
          return {
            ...prev,
            [optionId]: [...current, choiceId]
          };
        }
      } else {
        return {
          ...prev,
          [optionId]: [choiceId]
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = item.price;
    
    item.options.forEach(option => {
      const selected = selectedOptions[option.id] || [];
      selected.forEach(choiceId => {
        const choice = option.choices.find(c => c.id === choiceId);
        if (choice) {
          total += choice.price;
        }
      });
    });
    
    return total * quantity;
  };

  const canAddToCart = () => {
    return item.options.every(option => {
      if (!option.required) return true;
      const selected = selectedOptions[option.id] || [];
      return selected.length > 0;
    });
  };

  const handleAddToCart = () => {
    if (!canAddToCart()) return;

    // Build description with selected options
    let description = item.description;
    const optionDescriptions: string[] = [];
    
    item.options.forEach(option => {
      const selected = selectedOptions[option.id] || [];
      if (selected.length > 0) {
        const selectedNames = selected.map(choiceId => {
          const choice = option.choices.find(c => c.id === choiceId);
          return choice?.name || '';
        }).filter(Boolean);
        
        if (selectedNames.length > 0) {
          optionDescriptions.push(`${option.name}: ${selectedNames.join(', ')}`);
        }
      }
    });
    
    if (optionDescriptions.length > 0) {
      description += ` (${optionDescriptions.join('; ')})`;
    }

    addItem({
      name: item.name,
      price: calculateTotalPrice() / quantity, // Price per item including options
      quantity: quantity,
      description: description
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{item.name}</h2>
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Item Image */}
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
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
                    parent.innerHTML = '<div class="text-gray-400 text-sm">No Image Available</div>';
                  }
                }}
              />
            ) : (
              <div className="text-gray-400 text-sm">No Image Available</div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4">{item.description}</p>

          {/* Base Price */}
          <div className="text-lg font-semibold text-green-600 mb-4">
            Base Price: ${item.price.toFixed(2)}
          </div>

          {/* Options */}
          {item.options.map((option) => (
            <div key={option.id} className="mb-6">
              <h3 className="font-medium mb-2">
                {option.name}
                {option.required && <span className="text-red-500 ml-1">*</span>}
                {option.maxSelections && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Choose up to {option.maxSelections})
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {option.choices.map((choice) => {
                  const isSelected = (selectedOptions[option.id] || []).includes(choice.id);
                  const isDisabled = option.type === 'multiple' && 
                    option.maxSelections && 
                    (selectedOptions[option.id] || []).length >= option.maxSelections && 
                    !isSelected;

                  return (
                    <label
                      key={choice.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50' 
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type={option.type === 'multiple' ? 'checkbox' : 'radio'}
                          name={option.id}
                          value={choice.id}
                          checked={isSelected}
                          disabled={isDisabled ? true : undefined}
                          onChange={() => handleOptionChange(option.id, choice.id, option.type === 'multiple')}
                          className="mr-3"
                        />
                        <span className={isDisabled ? 'text-gray-400' : ''}>{choice.name}</span>
                      </div>
                      {choice.price > 0 && (
                        <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-green-600'}`}>
                          +${choice.price.toFixed(2)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="secondary"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <div className="text-xl font-bold text-green-600 mb-4">
            Total: ${calculateTotalPrice().toFixed(2)}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart()}
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add to Cart
          </Button>

          {/* Required options warning */}
          {!canAddToCart() && (
            <p className="text-red-500 text-sm mt-2 text-center">
              Please select all required options
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
