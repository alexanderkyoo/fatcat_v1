"use client";

import { useVoice } from "@humeai/voice-react";
import { Button } from "./ui/button";
import { MessageCircle, Sparkles, Utensils, Heart, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";
import { useState } from "react";

interface SuggestedMessage {
  id: string;
  label: string;
  message: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const suggestedMessages: SuggestedMessage[] = [
  {
    id: "allergies",
    label: "Allergies & Dietary",
    message: "Please ask me about any allergies or dietary restrictions I have.",
    description: "I'll ask about your food allergies and dietary needs",
    icon: null,
    color: "from-red-500 to-pink-500"
  },
  {
    id: "popular",
    label: "Popular Items",
    message: "Please tell me about your most popular menu items.",
    description: "I'll share our customer favorites and bestsellers",
    icon: null,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "ingredients",
    label: "Favorite Ingredients", 
    message: "Please ask me about my favorite ingredients and food preferences.",
    description: "I'll ask about your preferences to suggest perfect dishes",
    icon: null,
    color: "from-green-500 to-emerald-500"
  }
];

export default function SuggestedMessages() {
  const { status, sendUserInput, messages } = useVoice();
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [clickedSuggestion, setClickedSuggestion] = useState<string | null>(null);
  
  const handleSuggestionClick = async (suggestion: SuggestedMessage) => {
    try {
      setClickedSuggestion(suggestion.id);
      // Send the message to trigger the AI response
      await sendUserInput(suggestion.message);
      
      // Reset clicked state after animation
      setTimeout(() => setClickedSuggestion(null), 1000);
    } catch (error) {
      console.error("Error sending suggested message:", error);
      setClickedSuggestion(null);
    }
  };

  const isConnected = status.value === "connected";
  
  // Hide suggestions if there are any user messages
  const hasUserMessages = messages.some(msg => msg.type === "user_message");
  const shouldShowSuggestions = suggestionsVisible && !hasUserMessages;

  // If suggestions are hidden, show enhanced white space with subtle patterns
  if (!shouldShowSuggestions) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-white via-orange-50/20 to-red-50/20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-red-300 rounded-full blur-2xl" />
        </div>
        
        {/* Floating elements for visual interest */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-300 rounded-full opacity-30"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/3 w-3 h-3 bg-red-300 rounded-full opacity-20"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1 
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        !isConnected ? "grow flex flex-col items-center justify-center p-4 sm:p-8 pt-16 sm:pt-24" : "w-full p-4"
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
          </motion.div>
        ) : (
          // Connected state header
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-sm text-gray-600">Ask me about...</p>
          </motion.div>
        )}

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: isConnected ? 0 : 0.2 }}
            className="space-y-3"
          >
            <div className="grid gap-3 sm:gap-4">
              {suggestedMessages.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: (isConnected ? 0.1 : 0.3) + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={!isConnected}
                    variant="secondary"
                    className={cn(
                      "w-full p-4 sm:p-5 h-auto justify-start text-left transition-all duration-300 group relative overflow-hidden",
                      "bg-white/80 backdrop-blur-sm border border-orange-200/50 hover:border-orange-300/70",
                      "hover:shadow-lg hover:shadow-orange-100/50",
                      "rounded-2xl",
                      !isConnected && "opacity-50 cursor-not-allowed",
                      clickedSuggestion === suggestion.id && "scale-95"
                    )}
                  >
                    {/* Animated background gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      suggestion.color
                    )} />
                    
                    {/* Content */}
                    <div className="relative z-10 flex items-center w-full">
                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-orange-600 transition-colors">
                          {suggestion.label}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                      
                      {/* Hover indicator */}
                      <motion.div
                        className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ rotate: 90 }}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Click effect */}
                    <AnimatePresence>
                      {clickedSuggestion === suggestion.id && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-2xl"
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 1, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
