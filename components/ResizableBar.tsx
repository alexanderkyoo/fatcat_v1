"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/utils";

interface ResizableBarProps {
  onResize: (percentage: number) => void;
}

export default function ResizableBar({ onResize }: ResizableBarProps) {
  const [isDragging, setIsDragging] = useState(false);

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
      const windowHeight = window.innerHeight;
      const touchY = e.touches[0]?.clientY;
      
      if (touchY) {
        // Calculate percentage (minimum 20%, maximum 80%)
        let percentage = Math.min(Math.max((touchY / windowHeight) * 100, 20), 80);
        onResize(percentage);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [onResize]);

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gray-200 border-y border-gray-300 cursor-row-resize select-none",
        "h-6 relative group hover:bg-gray-300 transition-colors duration-200",
        isDragging && "bg-blue-300"
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Drag handle with arrows */}
      <div className="flex items-center gap-1 text-gray-600">
        <ChevronUp className="w-4 h-4" />
        <div className="flex gap-0.5">
          <div className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="w-1 h-1 bg-gray-500 rounded-full" />
          <div className="w-1 h-1 bg-gray-500 rounded-full" />
        </div>
        <ChevronDown className="w-4 h-4" />
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Drag to resize
      </div>
    </div>
  );
} 