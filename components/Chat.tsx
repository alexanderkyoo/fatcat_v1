"use client";

import { VoiceProvider, ToolCallHandler, useVoice } from "@humeai/voice-react";
import SuggestedMessages from "./SuggestedMessages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import Cart from "./Cart";
import { useEffect } from "react";
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

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  
  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        onToolCall={handleToolCall}
        onMessage={(message) => {
          console.log('Received message:', message); // Debug logging
        }}
        onError={(error) => {
          console.error('Voice error:', error); // Debug logging
          toast.error(error.message);
        }}
      >
        <div className="flex flex-col w-full h-full overflow-hidden">
          <SuggestedMessages />
          <Controls />
        </div>
        <StartCall accessToken={accessToken} />
      </VoiceProvider>
    </div>
  );
}
