"use client";

import { useVoice } from "@humeai/voice-react";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/utils";
import { useState } from "react";

interface SuggestedMessage {
  id: string;
  label: string;
  message: string;
  description: string;
}

const suggestedMessages: SuggestedMessage[] = [
  {
    id: "allergies",
    label: "Allergies",
    message: "Please ask me about any allergies or dietary restrictions I have.",
    description: "I'll ask about your food allergies and dietary needs"
  },
  {
    id: "popular",
    label: "Popular Items",
    message: "Please tell me about your most popular menu items.",
    description: "I'll share our customer favorites and bestsellers"
  },
  {
    id: "ingredients",
    label: "Favorite Ingredients", 
    message: "Please ask me about my favorite ingredients and food preferences.",
    description: "I'll ask about your preferences to suggest perfect dishes"
  }
];

export default function SuggestedMessages() {
  const { status, sendUserInput, messages } = useVoice();
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  
  const handleSuggestionClick = async (suggestion: SuggestedMessage) => {
    try {
      // Send the message to trigger the AI response
      await sendUserInput(suggestion.message);
    } catch (error) {
      console.error("Error sending suggested message:", error);
    }
  };

  const isConnected = status.value === "connected";
  
  // Hide suggestions if there are any user messages
  const hasUserMessages = messages.some(msg => msg.type === "user_message");
  const shouldShowSuggestions = suggestionsVisible && !hasUserMessages;

  // If suggestions are hidden, show white space
  if (!shouldShowSuggestions) {
    return (
      <div className="w-full h-full bg-white">
        {/* White space for future content */}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        !isConnected ? "grow flex flex-col items-center justify-center p-4 sm:p-8 pt-16 sm:pt-24" : "w-full"
      )}
    >
      <div className="max-w-4xl mx-auto w-full px-2 sm:px-0">
        {!isConnected ? (
          // Full display when not connected
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-semibold mb-2">Ready to start your order?</h2>
            <p className="text-gray-600">Start a call and I'll help you find the perfect meal!</p>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: isConnected ? 0 : 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-base font-medium text-center mb-3">Ask me about...</h3>
          
          <div className="grid gap-2 sm:gap-3">
            {suggestedMessages.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: (isConnected ? 0.1 : 0.3) + index * 0.1 }}
              >
                <Button
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={!isConnected}
                  variant="outline"
                  className={cn(
                    "w-full p-3 sm:p-4 h-auto justify-start text-left transition-all duration-200",
                    "hover:shadow-sm hover:bg-gray-50 active:scale-[0.99]",
                    !isConnected && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="w-full">
                    <h4 className="font-medium text-sm sm:text-base mb-1">{suggestion.label}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 p-4 bg-blue-50 rounded-lg text-center"
          >
            <p className="text-sm text-blue-700">
              💡 You can also just start talking naturally - I'm listening and ready to help!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 