"use client";

import { ChevronUp, ChevronDown, GripHorizontal } from "lucide-react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

interface ResizableBarProps {
  onResize: (percentage: number) => void;
}

export default function ResizableBar({ onResize }: ResizableBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const mouseY = e.clientY;
      
      // Calculate percentage (minimum 20%, maximum 80%)
      let percentage = Math.min(Math.max((mouseY / windowHeight) * 100, 20), 80);
      onResize(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onResize]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const windowHeight = window.innerHeight;
      const touchY = e.touches[0]?.clientY;
      
      if (touchY !== undefined) {
        // Calculate percentage (minimum 20%, maximum 80%)
        let percentage = Math.min(Math.max((touchY / windowHeight) * 100, 20), 80);
        onResize(percentage);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove, { passive: false } as any);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false } as any);
    document.addEventListener('touchend', handleTouchEnd);
  }, [onResize]);

  return (
    <motion.div
      className={cn(
        "flex items-center justify-center cursor-row-resize select-none relative",
        "h-8 sm:h-8 md:h-8 bg-gradient-to-r from-orange-100 via-white to-red-100",
        "border-y border-orange-200/50",
        "transition-all duration-300",
        "touch-none", // Prevent default touch behaviors
        isDragging && "bg-gradient-to-r from-orange-200 to-red-200 shadow-lg",
        isHovered && "bg-gradient-to-r from-orange-150 to-red-150"
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-300/20 to-red-300/20 rounded-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDragging ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Drag handle with enhanced design */}
      <motion.div
        className="flex items-center gap-2 text-gray-600 relative z-10"
        animate={{
          scale: isDragging ? 1.1 : 1,
          color: isDragging ? "#f97316" : "#6b7280"
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ y: isDragging ? -1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronUp className="w-4 h-4" />
        </motion.div>
        
        {/* Enhanced grip indicator */}
        <motion.div
          className="flex items-center gap-1"
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <GripHorizontal className="w-5 h-5 text-orange-500" />
        </motion.div>
        
        <motion.div
          animate={{ y: isDragging ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
      
      {/* Enhanced hover tooltip */}
      <motion.div
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg pointer-events-none whitespace-nowrap"
        initial={{ opacity: 0, y: 5, scale: 0.9 }}
        animate={{
          opacity: isHovered && !isDragging ? 1 : 0,
          y: isHovered && !isDragging ? 0 : 5,
          scale: isHovered && !isDragging ? 1 : 0.9
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3 h-3" />
          <span>Drag to resize sections</span>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </motion.div>


      {/* Subtle animated dots for visual interest */}
      <div className="absolute left-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-orange-400 rounded-full"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <div className="absolute right-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-red-400 rounded-full"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2 + 1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
