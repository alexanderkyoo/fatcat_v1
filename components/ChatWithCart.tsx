"use client";

import { VoiceProvider, ToolCallHandler, useVoice } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import Cart from "./Cart";
import { ComponentRef, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

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
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const { status } = useVoice();
  const { addItem, removeItem, clearCart, items, updateQuantity } = useCart();

  // Clear cart when call ends
  useEffect(() => {
    if (status.value === "disconnected" && items.length > 0) {
      clearCart();
      toast.info("Cart cleared - call ended");
    }
  }, [status.value, clearCart, items.length]);

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
        // Handle cart operations
        if (message.name === "add_to_cart" && result.item) {
          addItem({
            name: result.item.name,
            price: result.item.price,
            quantity: result.item.quantity,
            description: result.item.description,
          });
        } else if (message.name === "remove_from_cart" && result.item) {
          // Find item by name and remove it
          const existingItem = items.find(item => 
            item.name.toLowerCase() === result.item.name.toLowerCase()
          );
          if (existingItem) {
            if (result.item.quantity >= existingItem.quantity) {
              removeItem(existingItem.id);
            } else {
              // Reduce quantity
              const newQuantity = existingItem.quantity - result.item.quantity;
              updateQuantity(existingItem.id, newQuantity);
            }
          }
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
    <div className="relative grow flex mx-auto w-full overflow-hidden h-[0px]">
      {isConnected ? (
        // Split screen layout when connected
        <div className="flex w-full h-full">
          {/* Left side - Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Messages ref={ref} />
            <Controls />
          </div>
          {/* Right side - Cart */}
          <div className="w-96 border-l border-gray-200 bg-white">
            <Cart />
          </div>
        </div>
      ) : (
        // Full screen chat when not connected
        <div className="flex flex-col w-full h-full overflow-hidden">
          <Messages ref={ref} />
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
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

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
        
        if (timeout.current) {
          window.clearTimeout(timeout.current);
        }

        timeout.current = window.setTimeout(() => {
          if (ref.current) {
            const scrollHeight = ref.current.scrollHeight;

            ref.current.scrollTo({
              top: scrollHeight,
              behavior: "smooth",
            });
          }
        }, 200);
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
