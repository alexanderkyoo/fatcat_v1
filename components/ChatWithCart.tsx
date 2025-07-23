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

function ChatContent({ accessToken }: { accessToken: string }) {
  const { status } = useVoice();
  const { addItem, removeItem, clearCart, items, updateQuantity, refreshCart } = useCart();
  const [topSectionHeight, setTopSectionHeight] = useState(50); // Default 50%
  const [showCart, setShowCart] = useState(false); // Show menu by default

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
      setShowCart(true);
    };

    window.addEventListener('showCart', handleShowCart);
    return () => window.removeEventListener('showCart', handleShowCart);
  }, []);

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
          // Show success toast and switch to cart view
          toast.success(`Added ${result.item.name} to cart!`);
          console.log(`🎤 Voice added item: ${result.item.name}, refreshing cart...`);
          
          // Immediate refresh and show cart
          refreshCart().then(() => {
            console.log('✅ Cart refreshed after voice addition');
            setShowCart(true);
          });
          
        } else if (message.name === "remove_from_cart" && result.item) {
          toast.success(`Removed ${result.item.name} from cart!`);
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
    <div className="relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]">
      {isConnected ? (
        // Layout when connected with resizable sections
        <div className="flex flex-col w-full h-full overflow-hidden">
          {/* Top section - Controls and Suggestions */}
          <div 
            className="flex flex-col overflow-hidden bg-white"
            style={{ height: `${topSectionHeight}%` }}
          >
            {/* Controls area */}
            <div className="flex items-start justify-center bg-card border-b border-gray-200 p-4 pt-2">
              <Controls />
            </div>
            {/* Suggestions area */}
            <div className="flex-1 p-2 sm:p-4 overflow-auto">
              <SuggestedMessages />
            </div>
          </div>

          {/* Resizable bar */}
          <ResizableBar onResize={setTopSectionHeight} />
          
          {/* Bottom section - Menu/Cart */}
          <div 
            className="flex flex-col overflow-hidden bg-gray-50"
            style={{ height: `${100 - topSectionHeight}%` }}
          >
            {showCart ? (
              <div className="h-full flex flex-col">
                {/* Cart Header with Back Button */}
                <div className="flex items-center p-4 border-b border-gray-200 bg-white">
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    ← Back to Menu
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Cart />
                </div>
              </div>
            ) : (
              <Menu />
            )}
          </div>
        </div>
      ) : (
        // Full screen chat when not connected
        <div className="flex flex-col w-full h-full overflow-hidden">
          <SuggestedMessages />
          <Controls />
        </div>
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
      return result.success
        ? send.success(result.data)
        : send.error(result.error);
    } catch (err) {
      return send.error(tool.error);
    }
  };

  return (
    <VoiceProvider
      onToolCall={handleToolCall}
      onMessage={(message) => {
        console.log('Received message:', message);
      }}
      onError={(error) => {
        console.error('Voice error:', error);
        toast.error(error.message);
      }}
    >
      <ChatContent accessToken={accessToken} />
    </VoiceProvider>
  );
}
