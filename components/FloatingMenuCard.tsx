"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface FloatingCard {
  id: string;
  item: MenuItem;
  category?: string;
  timestamp: number;
}

interface FloatingMenuCardProps {
  card: FloatingCard;
  onRemove: (id: string) => void;
  index: number;
}

function FloatingMenuCard({ card, onRemove, index }: FloatingMenuCardProps) {
  const { addItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAddToCart = async () => {
    try {
      await addItem({
        menuItemId: card.item.id,
        name: card.item.name,
        price: card.item.price,
        quantity: 1
      });
      
      toast.success(`Added ${card.item.name} to cart!`, {
        icon: "🛒",
      });
      
      // Remove the card after adding to cart
      setIsRemoving(true);
      setTimeout(() => onRemove(card.id), 300);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(card.id), 300);
  };

  // This component is deprecated - using FloatingMenuCardWithPosition instead
  const position = { x: 0, y: 0 };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8, 
        x: 0, // Start from center
        y: 0,
      }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        scale: isRemoving ? 0.8 : 1, 
        x: position.x,
        y: position.y,
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        x: position.x,
        y: position.y - 30,
        transition: { duration: 0.4 }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: index * 0.15 
      }}
      className="absolute z-50 w-72 max-w-[85vw]"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-md border border-orange-200/50 rounded-2xl shadow-xl shadow-orange-100/50 overflow-hidden"
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 border-b border-orange-100/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-orange-600">
              {card.category || "Menu Item"}
            </span>
          </div>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="w-6 h-6 p-0 hover:bg-orange-100/50 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Item image placeholder */}
          <div className="w-full h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-3 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>

          {/* Item details */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {card.item.name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {card.item.description}
            </p>
            
            {/* Price and add button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold text-orange-600">
                ${card.item.price.toFixed(2)}
              </span>
              <Button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-orange-300/30 pointer-events-none"
          animate={{
            borderColor: [
              "rgba(251, 146, 60, 0.3)",
              "rgba(239, 68, 68, 0.3)",
              "rgba(251, 146, 60, 0.3)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

interface FloatingMenuCardsProps {
  cards: FloatingCard[];
  onRemoveCard: (id: string) => void;
}

// Collision detection and positioning system
const calculateNonOverlappingPositions = (cardCount: number, containerWidth: number, containerHeight: number) => {
  const cardWidth = 288; // w-72 = 288px
  const cardHeight = 200; // Approximate card height
  const minSpacing = 20; // Minimum space between cards
  const effectiveCardWidth = cardWidth + minSpacing;
  const effectiveCardHeight = cardHeight + minSpacing;
  
  const positions: { x: number; y: number }[] = [];
  
  if (cardCount === 0) return positions;
  
  // Calculate how many cards can fit in each dimension
  const maxCols = Math.floor(containerWidth / effectiveCardWidth);
  const maxRows = Math.floor(containerHeight / effectiveCardHeight);
  const maxCards = maxCols * maxRows;
  
  // If we have more cards than can fit, use a more compact spiral
  if (cardCount > maxCards) {
    return calculateCompactSpiral(cardCount, containerWidth, containerHeight, cardWidth, cardHeight, minSpacing);
  }
  
  // For fewer cards, use a centered grid approach
  const cols = Math.min(cardCount, maxCols);
  const rows = Math.ceil(cardCount / cols);
  
  // Calculate starting position to center the grid
  const gridWidth = cols * effectiveCardWidth - minSpacing;
  const gridHeight = rows * effectiveCardHeight - minSpacing;
  const startX = (containerWidth - gridWidth) / 2;
  const startY = (containerHeight - gridHeight) / 2;
  
  for (let i = 0; i < cardCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    positions.push({
      x: startX + (col * effectiveCardWidth) - containerWidth / 2,
      y: startY + (row * effectiveCardHeight) - containerHeight / 2
    });
  }
  
  return positions;
};

// Compact spiral for when there are many cards
const calculateCompactSpiral = (cardCount: number, containerWidth: number, containerHeight: number, cardWidth: number, cardHeight: number, minSpacing: number) => {
  const positions: { x: number; y: number }[] = [];
  const centerX = 0;
  const centerY = 0;
  
  // First card at center
  positions.push({ x: centerX, y: centerY });
  
  if (cardCount === 1) return positions;
  
  // Calculate spiral with collision detection
  const maxRadius = Math.min(containerWidth, containerHeight) / 2 - cardWidth / 2;
  const angleStep = 45; // Degrees between positions
  let radius = cardWidth + minSpacing;
  let angle = 0;
  
  for (let i = 1; i < cardCount; i++) {
    let positioned = false;
    let attempts = 0;
    
    while (!positioned && attempts < 20) {
      const x = centerX + Math.cos(angle * Math.PI / 180) * radius;
      const y = centerY + Math.sin(angle * Math.PI / 180) * radius;
      
      // Check if position is within bounds
      if (Math.abs(x) + cardWidth / 2 <= containerWidth / 2 && 
          Math.abs(y) + cardHeight / 2 <= containerHeight / 2) {
        
        // Check for collisions with existing cards
        let hasCollision = false;
        for (const pos of positions) {
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (distance < cardWidth + minSpacing) {
            hasCollision = true;
            break;
          }
        }
        
        if (!hasCollision) {
          positions.push({ x, y });
          positioned = true;
        }
      }
      
      // Move to next position
      angle += angleStep;
      if (angle >= 360) {
        angle = 0;
        radius += cardWidth / 2 + minSpacing;
        if (radius > maxRadius) break;
      }
      attempts++;
    }
    
    // Fallback: if we can't find a good position, place it in a safe spot
    if (!positioned) {
      const fallbackX = (i % 3 - 1) * (cardWidth + minSpacing);
      const fallbackY = Math.floor(i / 3) * (cardHeight + minSpacing);
      positions.push({ x: fallbackX, y: fallbackY });
    }
  }
  
  return positions;
};

export default function FloatingMenuCards({ cards, onRemoveCard }: FloatingMenuCardsProps) {
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 400 });
  
  // Monitor container size changes
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('[data-floating-cards-container]');
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Also listen for resizable bar changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    const container = document.querySelector('[data-floating-cards-container]');
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);
  
  // Calculate positions for all cards
  const positions = calculateNonOverlappingPositions(
    cards.length, 
    containerDimensions.width, 
    containerDimensions.height
  );
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10" 
      data-floating-cards-container
    >
      <div className="relative w-full h-full">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <div key={card.id} className="pointer-events-auto">
              <FloatingMenuCardWithPosition
                card={card}
                onRemove={onRemoveCard}
                index={index}
                position={positions[index] || { x: 0, y: 0 }}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// New component that accepts calculated position
function FloatingMenuCardWithPosition({ 
  card, 
  onRemove, 
  index, 
  position 
}: {
  card: FloatingCard;
  onRemove: (id: string) => void;
  index: number;
  position: { x: number; y: number };
}) {
  const { addItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAddToCart = async () => {
    try {
      await addItem({
        menuItemId: card.item.id,
        name: card.item.name,
        price: card.item.price,
        quantity: 1
      });
      
      toast.success(`Added ${card.item.name} to cart!`, {
        icon: "🛒",
      });
      
      // Remove the card after adding to cart
      setIsRemoving(true);
      setTimeout(() => onRemove(card.id), 300);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  };

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(card.id), 300);
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8, 
        x: 0, // Start from center
        y: 0,
      }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        scale: isRemoving ? 0.8 : 1, 
        x: position.x,
        y: position.y,
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.8, 
        x: position.x,
        y: position.y - 30,
        transition: { duration: 0.4 }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: index * 0.15 
      }}
      className="absolute z-50 w-72 max-w-[85vw]"
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-md border border-orange-200/50 rounded-2xl shadow-xl shadow-orange-100/50 overflow-hidden"
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 border-b border-orange-100/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-orange-600">
              {card.category || "Menu Item"}
            </span>
          </div>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="w-6 h-6 p-0 hover:bg-orange-100/50 rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Item image placeholder */}
          <div className="w-full h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-3 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>

          {/* Item details */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {card.item.name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {card.item.description}
            </p>
            
            {/* Price and add button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xl font-bold text-orange-600">
                ${card.item.price.toFixed(2)}
              </span>
              <Button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-orange-300/30 pointer-events-none"
          animate={{
            borderColor: [
              "rgba(251, 146, 60, 0.3)",
              "rgba(239, 68, 68, 0.3)",
              "rgba(251, 146, 60, 0.3)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
