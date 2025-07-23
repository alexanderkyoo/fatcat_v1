"use client";

import { VoiceProvider, ToolCallHandler, useVoice } from "@humeai/voice-react";
import SuggestedMessages from "./SuggestedMessages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import Cart from "./Cart";
import Menu from "./Menu";
import ResizableBar from "./ResizableBar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { apiCall } from "@/utils/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Menu as MenuIcon, ShoppingCart } from "lucide-react";

type ToolMeta = {
  endpoint: string;
  error: {
    error: string;
    code: string;
    level: "warn" | "error";
    content: string;
  };
};

const tools: Record<string, ToolMeta> = {
  get_current_weather: {
    endpoint: "/api/fetchWeather",
    error: {
      error: "Weather tool error",
      code: "weather_tool_error",
      level: "warn",
      content: "There was an error with the weather tool",
    },
  },
  get_menu: {
    endpoint: "/api/getMenu",
    error: {
      error: "Menu tool error",
      code: "menu_tool_error",
      level: "warn",
      content: "There was an error retrieving menu information",
    },
  },
  add_to_cart: {
    endpoint: "/api/addToCart",
    error: {
      error: "Cart tool error",
      code: "cart_tool_error",
      level: "warn",
      content: "There was an error adding item to cart",
    },
  },
  remove_from_cart: {
    endpoint: "/api/removeFromCart",
    error: {
      error: "Cart tool error",
      code: "cart_tool_error",
      level: "warn",
      content: "There was an error removing item from cart",
    },
  },
};

function ChatContent({ 
  accessToken, 
  setToolCallHandler 
}: { 
  accessToken: string;
  setToolCallHandler?: (handler: ToolCallHandler) => void;
}) {
  const { status } = useVoice();
  const { addItem, removeItem, clearCart, items, updateQuantity, refreshCart } = useCart();
  const [topSectionHeight, setTopSectionHeight] = useState(55); // Default 55% to weight more towards menu
  const [showCart, setShowCart] = useState(false); // Show menu by default
  
  // Debug: Log when showCart changes
  useEffect(() => {
    console.log(`🛒 Cart view state changed: showCart = ${showCart}`);
  }, [showCart]);

  // Clear cart when call ends
  useEffect(() => {
    if (status.value === "disconnected" && items.length > 0) {
      clearCart();
      toast.info("Cart cleared - call ended");
    }
  }, [status.value, clearCart, items.length]);

  // Listen for showCart events from Menu component
  useEffect(() => {
    const handleShowCart = () => {
      console.log('🎯 handleShowCart event triggered - switching to cart view');
      console.trace('Stack trace for showCart event:');
      setShowCart(true);
    };

    window.addEventListener('showCart', handleShowCart);
    return () => window.removeEventListener('showCart', handleShowCart);
  }, []);

  // Register the tool call handler with parent component
  useEffect(() => {
    if (setToolCallHandler) {
      setToolCallHandler(handleToolCall);
      console.log('🔗 ChatContent tool handler registered with parent');
    }
  }, [setToolCallHandler]);

  const handleToolCall: ToolCallHandler = async (message, send) => {
    const tool = tools[message.name];

    if (!tool) {
      return send.error({
        error: "Tool not found",
        code: "tool_not_found",
        level: "warn",
        content: "The tool you requested was not found",
      });
    }

    try {
      const response = await fetch(tool.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameters: message.parameters }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Handle cart operations - just show feedback and refresh
        if (message.name === "add_to_cart" && result.item) {
          // Show success toast (but stay on menu like manual adds)
          toast.success(`Added ${result.item.name} to cart!`, {
            icon: "🛒",
          });
          console.log(`🎤 Voice added item: ${result.item.name}, refreshing cart...`);
          
          // Immediate refresh (but don't auto-switch to cart view)
          refreshCart().then(() => {
            console.log('✅ Cart refreshed after voice addition - cart indicator should appear');
          });
          
        } else if (message.name === "remove_from_cart" && result.item) {
          toast.success(`Removed ${result.item.name} from cart!`, {
            icon: "🗑️",
          });
          console.log(`🎤 Voice removed item: ${result.item.name}, refreshing cart...`);
          
          // Immediate refresh
          refreshCart().then(() => {
            console.log('✅ Cart refreshed after voice removal');
          });
        }
        
        return send.success(result.data);
      } else {
        return send.error(result.error);
      }
    } catch (err) {
      return send.error(tool.error);
    }
  };

  const isConnected = status.value === "connected";

  return (
    <div className="relative grow flex flex-col mx-auto w-full overflow-hidden min-h-0 h-full">
      {isConnected ? (
        // Layout when connected with resizable sections
        <div className="flex flex-col w-full h-full min-h-screen min-h-[100dvh] overflow-hidden">
          {/* Top section - Controls and Suggestions */}
          <motion.div 
            className="flex flex-col overflow-hidden bg-gradient-to-br from-white via-orange-50/30 to-red-50/30"
            style={{ 
              height: `${topSectionHeight}%`, 
              minHeight: '200px',
              maxHeight: '60vh'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Controls area */}
            <div className="flex items-start justify-center bg-white/80 backdrop-blur-sm border-b border-orange-200/50 p-4 pt-2">
              <Controls />
            </div>
            {/* Suggestions area */}
            <div className="flex-1 p-2 sm:p-4 overflow-auto">
              <SuggestedMessages />
            </div>
          </motion.div>

          {/* Resizable bar */}
          <ResizableBar onResize={setTopSectionHeight} />
          
          {/* Bottom section - Menu/Cart */}
          <motion.div 
            className="flex flex-col overflow-hidden flex-1"
            style={{ 
              height: `${100 - topSectionHeight}%`,
              minHeight: '300px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {showCart ? (
                <motion.div
                  key="cart"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className="h-full flex flex-col"
                >
                  {/* Cart Header with Back Button */}
                  <div className="flex items-center p-4 border-b border-orange-200/50 bg-white/80 backdrop-blur-sm">
                    <motion.button
                      onClick={() => setShowCart(false)}
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors focus-ring rounded-lg px-3 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span>Back to Menu</span>
                    </motion.button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Cart />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full"
                >
                  <Menu />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      ) : (
        // Full screen chat when not connected
        <motion.div
          className="flex flex-col w-full h-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SuggestedMessages />
          <Controls />
        </motion.div>
      )}
      <StartCall accessToken={accessToken} />
    </div>
  );
}

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  // This will be set by ChatContent and used by VoiceProvider
  let chatContentHandler: ToolCallHandler | null = null;

  const handleToolCall: ToolCallHandler = async (message, send) => {
    console.log('🎯 ClientComponent handleToolCall called for:', message.name);
    
    // Use the ChatContent handler if available, otherwise fallback to simple handler
    if (chatContentHandler) {
      console.log('✅ Using ChatContent handler with cart logic');
      return chatContentHandler(message, send);
    }

    console.log('⚠️ Fallback to simple handler (no cart logic)');
    const tool = tools[message.name];

    if (!tool) {
      return send.error({
        error: "Tool not found",
        code: "tool_not_found",
        level: "warn",
        content: "The tool you requested was not found",
      });
    }

    try {
      const response = await fetch(tool.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameters: message.parameters }),
      });

      const result = await response.json();
      return result.success
        ? send.success(result.data)
        : send.error(result.error);
    } catch (err) {
      return send.error(tool.error);
    }
  };

  return (
    <VoiceProvider
      onToolCall={(message, send) => {
        console.log('🚨 TOOL CALL EVENT DETECTED:', message.name, message.parameters);
        return handleToolCall(message, send);
      }}
      onMessage={(message) => {
        console.log('Received message:', message);
        // Check if message contains tool call info
        if (message.type === 'tool_call' || (message as any).tool_call) {
          console.log('🔧 Tool call in message:', message);
        }
      }}
      onError={(error) => {
        console.error('Voice error:', error);
        toast.error(error.message);
      }}
    >
      <ChatContent 
        accessToken={accessToken} 
        setToolCallHandler={(handler: ToolCallHandler) => {
          console.log('🔗 ChatContent handler registered');
          chatContentHandler = handler;
        }}
      />
    </VoiceProvider>
  );
}
