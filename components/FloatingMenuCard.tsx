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
  topSectionHeight?: number;
  viewportHeight?: number;
  viewportWidth?: number;
}

// Simple list-based positioning system
const calculateListPositions = (cardCount: number, containerWidth: number, containerHeight: number) => {
  const positions: { x: number; y: number }[] = [];
  
  if (cardCount === 0) return positions;
  
  const isMobile = containerWidth < 640;
  const cardHeight = isMobile ? 100 : 120; // Much smaller height
  const spacing = isMobile ? 12 : 16;
  
  // Single card - center it
  if (cardCount === 1) {
    positions.push({ x: 0, y: 0 });
    return positions;
  }
  
  // Multiple cards - stack them horizontally like a list
  const cardWidth = isMobile ? 80 : 96; // Much smaller cards
  const totalWidth = (cardCount * cardWidth) + ((cardCount - 1) * spacing);
  const startX = -totalWidth / 2;
  
  for (let i = 0; i < cardCount; i++) {
    positions.push({
      x: startX + (i * (cardWidth + spacing)) + (cardWidth / 2),
      y: 0 // Always center vertically
    });
  }
  
  return positions;
};



export default function FloatingMenuCards({ 
  cards, 
  onRemoveCard, 
  topSectionHeight = 55,
  viewportHeight = window.innerHeight,
  viewportWidth = window.innerWidth
}: FloatingMenuCardsProps) {
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 400 });
  const [isMobile, setIsMobile] = useState(false);
  
  // Debug: Log viewport changes
  useEffect(() => {
    console.log(`🔄 Viewport update: ${viewportWidth}x${viewportHeight}, topSection: ${topSectionHeight}%`);
  }, [viewportWidth, viewportHeight, topSectionHeight]);
  
  // Monitor container size changes
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('[data-floating-cards-container]');
      if (container) {
        const rect = container.getBoundingClientRect();
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
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
  
  // Calculate effective viewport dimensions based on resize position
  const topSectionPixelHeight = (viewportHeight * topSectionHeight) / 100;
  const resizeBarHeight = 8; // Height of resize bar
  const controlsHeight = isMobile ? 100 : 80; // Controls area height
  
  // Available space for cards in the top section (avoiding controls and resize bar)
  const availableCardHeight = topSectionPixelHeight - controlsHeight - resizeBarHeight - 20; // 20px buffer
  const availableCardWidth = viewportWidth - (isMobile ? 32 : 64); // Side padding
  
  // Calculate positions using simple list layout
  const rawPositions = calculateListPositions(
    cards.length, 
    Math.max(320, availableCardWidth), 
    Math.max(200, availableCardHeight)
  );
  
  // Position cards in the optimal area (upper portion of top section, avoiding resize bar)
  const optimalVerticalPosition = -(availableCardHeight / 4); // Bias towards upper area
  
  const positions = rawPositions.map((pos: { x: number; y: number }) => ({
    x: pos.x,
    y: pos.y + optimalVerticalPosition
  }));
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 overflow-x-auto overflow-y-hidden" 
      data-floating-cards-container
      style={{
        // Dynamic padding based on viewport and resize position
        paddingTop: `${controlsHeight / 2}px`, // Half controls height as top buffer
        paddingBottom: `${resizeBarHeight + 10}px`, // Resize bar height + buffer
        paddingLeft: isMobile ? '16px' : '32px',
        paddingRight: isMobile ? '16px' : '32px',
      }}
    >
      <div className="relative w-full h-full flex flex-row items-center justify-center">
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
      className="absolute z-50 w-20 sm:w-24"
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        maxHeight: 'calc(100vh - 8rem)', // Prevent overflow on mobile
      }}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-md border border-orange-200/50 rounded-xl shadow-lg shadow-orange-100/50 overflow-hidden relative"
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Compact content */}
        <div className="p-2">
          {/* Item image */}
          <div className="w-full h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg mb-2 flex items-center justify-center relative">
            <span className="text-lg">🍽️</span>
            {/* Add button overlay */}
            <Button
              onClick={handleAddToCart}
              className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-md flex items-center justify-center"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Item name */}
          <h3 className="text-xs font-medium text-gray-900 text-center leading-tight line-clamp-2">
            {card.item.name}
          </h3>
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
