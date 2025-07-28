"use client";

import { ConnectOptions, useVoice, VoiceProvider, ToolCallHandler } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import MicFFT from "./MicFFT";

interface NotifyWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

// Separate component that uses the waiter's VoiceProvider
function WaiterModalContent({ isOpen, onClose, accessToken }: NotifyWaiterModalProps) {
  const { status, connect, disconnect, micFft } = useVoice();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasBeenConnected, setHasBeenConnected] = useState(false);

  const EVI_WAITER_CONNECT_OPTIONS: ConnectOptions = {
    auth: { type: "accessToken", value: accessToken },
    configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID_WAITER,
  };

  // Handle connection status changes
  useEffect(() => {
    if (status.value === "connected") {
      setIsConnecting(false);
      setHasBeenConnected(true);
    } else if (status.value === "disconnected" && isOpen && hasBeenConnected) {
      setIsConnecting(false);
      // Auto-close modal when call ends (only if we were previously connected)
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }, [status.value, isOpen, hasBeenConnected, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasBeenConnected(false);
      setIsConnecting(false);
    }
  }, [isOpen]);

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen && status.value === "connected") {
      disconnect();
    }
  }, [isOpen, status.value, disconnect]);

  const handleStartCall = () => {
    setIsConnecting(true);
    
    connect(EVI_WAITER_CONNECT_OPTIONS)
      .then(() => {
        // Connection successful
      })
      .catch(() => {
        setIsConnecting(false);
        toast.error("Unable to start waiter call", {
          description: "Please check your microphone permissions",
        });
      });
  };

  const handleClose = () => {
    if (status.value === "connected") {
      disconnect();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            variant="secondary"
            className="absolute top-4 right-4 h-8 w-8 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notify Waiter</h2>
            <p className="text-gray-600 text-sm">
              {status.value === "connected" 
                ? "Speak your request clearly" 
                : "Tap to start and tell us what you need"}
            </p>
          </div>

          {/* Call interface */}
          <div className="space-y-4">
            {status.value !== "connected" ? (
              <Button
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-lg font-semibold"
                onClick={handleStartCall}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Start Request"}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Mic visualization */}
                <div className="h-24 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 flex items-center justify-center">
                  <div className="w-full h-full">
                    <MicFFT fft={micFft} className="fill-blue-500" />
                  </div>
                </div>
                
                {/* Status */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Listening...
                  </div>
                </div>

                {/* End call button */}
                <Button
                  variant="destructive"
                  className="w-full h-12"
                  onClick={handleClose}
                >
                  End Request
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              Examples: "I need a fork", "Can I get some napkins?", "Ready for the check"
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Main component with its own VoiceProvider
export default function NotifyWaiterModal({ isOpen, onClose, accessToken }: NotifyWaiterModalProps) {
  // Tool handler for notify_waiter
  const handleToolCall: ToolCallHandler = async (message, send) => {
    if (message.name === "notify_waiter") {
      try {
        const parsedParameters = typeof message.parameters === 'string' 
          ? JSON.parse(message.parameters)
          : message.parameters;
          
        const response = await fetch("/api/notifyWaiter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parameters: parsedParameters }),
        });

        const result = await response.json();
        
        if (result.success) {
          return send.success(result.data);
        } else {
          return send.error(result.error);
        }
      } catch (err) {
        return send.error({
          error: "Waiter notification error",
          code: "notify_waiter_error",
          level: "error",
          content: "There was an error sending the waiter notification",
        });
      }
    }

    return send.error({
      error: "Tool not found",
      code: "tool_not_found",
      level: "warn",
      content: "The tool you requested was not found",
    });
  };

  if (!isOpen) return null;

  return (
    <VoiceProvider
      onToolCall={handleToolCall}
      onError={(error) => {
        console.error('Waiter voice error:', error);
        toast.error(error.message);
      }}
    >
      <WaiterModalContent 
        isOpen={isOpen} 
        onClose={onClose} 
        accessToken={accessToken} 
      />
    </VoiceProvider>
  );
}
