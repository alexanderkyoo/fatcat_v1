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
  allergies?: string[];
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
            
            {/* Allergy indicators */}
            {card.item.allergies && card.item.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.item.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            )}
            
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

// Simple list-based positioning system with dynamic sizing
const calculateListPositions = (
  cardCount: number, 
  containerWidth: number, 
  containerHeight: number, 
  cardSize: number, 
  spacing: number
) => {
  const positions: { x: number; y: number }[] = [];
  
  if (cardCount === 0) return positions;
  
  // Single card - center horizontally, top-align vertically 
  if (cardCount === 1) {
    positions.push({ x: 0, y: 0 }); // y: 0 will be adjusted by topOffset in parent
    return positions;
  }
  
  // Multiple cards - stack them horizontally like a list, perfectly centered
  const cardWidth = cardSize; // Use dynamic card size
  const totalWidth = (cardCount * cardWidth) + ((cardCount - 1) * spacing);
  
  // Start from the left edge of the centered group
  const startX = -totalWidth / 2;
  
  for (let i = 0; i < cardCount; i++) {
    positions.push({
      x: startX + (i * (cardWidth + spacing)) + (cardWidth / 2),
      y: 0 // Will be top-aligned by topOffset in parent
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
  
  // Calculate the dedicated floating cards space (from below controls to resize bar)
  const controlsHeight = isMobile ? 100 : 80;
  const topSectionPixelHeight = (viewportHeight * topSectionHeight) / 100;
  const availableCardHeight = topSectionPixelHeight - controlsHeight - 40; // Subtract controls + padding
  const availableCardWidth = viewportWidth - (isMobile ? 32 : 64); // Side padding
  
  // Calculate dynamic card size based on the dedicated space
  const minCardSize = isMobile ? 100 : 120; // Increased minimum card size
  const maxCardSize = isMobile ? 200 : 240; // Increased maximum card size for 80% usage
  const optimalCardSize = Math.min(maxCardSize, Math.max(minCardSize, availableCardHeight * 0.8)); // 80% of available height
  
  // Dynamic spacing based on card size
  const dynamicSpacing = Math.max(8, optimalCardSize * 0.1);
  
  // Calculate positions using simple list layout with dynamic sizing
  const rawPositions = calculateListPositions(
    cards.length, 
    Math.max(320, availableCardWidth), 
    Math.max(200, availableCardHeight),
    optimalCardSize,
    dynamicSpacing
  );
  
  // Position cards at top of the dedicated floating cards space
  const containerHeight = availableCardHeight + 40; // Add back the padding we subtracted
  const topOffset = -containerHeight / 2 + optimalCardSize / 2 + 20; // Top of dedicated space + margin
  const positions = rawPositions.map((pos: { x: number; y: number }) => ({
    x: pos.x,
    y: pos.y + topOffset // Top-aligned within dedicated floating cards space
  }));
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 overflow-x-auto overflow-y-hidden" 
      data-floating-cards-container
      style={{
        // Span from below controls to bottom of top section
        top: `${isMobile ? 100 : 80}px`, // Controls height
        bottom: '0px',
        left: '0px', 
        right: '0px',
        paddingTop: '20px',
        paddingBottom: '20px', 
        paddingLeft: isMobile ? '16px' : '32px',
        paddingRight: isMobile ? '16px' : '32px',
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <div key={card.id} className="pointer-events-auto">
              <FloatingMenuCardWithPosition
                card={card}
                onRemove={onRemoveCard}
                index={index}
                position={positions[index] || { x: 0, y: 0 }}
                cardSize={optimalCardSize}
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
  position,
  cardSize
}: {
  card: FloatingCard;
  onRemove: (id: string) => void;
  index: number;
  position: { x: number; y: number };
  cardSize: number;
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
      className="absolute z-50"
      style={{
        width: `${cardSize}px`,
        height: `${cardSize}px`,
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        maxHeight: 'calc(100vh - 8rem)', // Prevent overflow on mobile
      }}
    >
      {/* + Button positioned freely outside all card constraints */}
      <Button
        onClick={handleAddToCart}
        className="absolute -top-4 -right-4 w-10 h-10 p-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-20 border-2 border-white"
        style={{ pointerEvents: 'auto' }}
      >
        <Plus className="w-5 h-5" />
      </Button>

      {/* Simplified card with single clean border */}
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden relative w-full h-full border border-gray-200"
        whileHover={{ scale: 1.05, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Card content */}
        <div className="p-3 flex flex-col h-full">
          {/* Item image */}
          <div 
            className="w-full bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ height: `${cardSize * 0.55}px` }} // Reduced image height to make room for title
          >
            {card.item.image ? (
              <img 
                src={card.item.image} 
                alt={card.item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-lg">🍽️</span>' + parent.innerHTML.replace(/<img[^>]*>/, '');
                  }
                }}
              />
            ) : (
              <span className="text-lg">🍽️</span>
            )}
          </div>

          {/* Item name - prominently displayed */}
          <h3 className="text-sm font-bold text-gray-900 text-center leading-tight mb-2 min-h-[2.5rem] flex items-center justify-center">
            {card.item.name}
          </h3>
          
          {/* Allergy indicators */}
          {card.item.allergies && card.item.allergies.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mt-auto">
              {card.item.allergies.slice(0, 2).map((allergy) => (
                <span
                  key={allergy}
                  className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium"
                >
                  {allergy}
                </span>
              ))}
              {card.item.allergies.length > 2 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                  +{card.item.allergies.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
