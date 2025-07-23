"use client";
import { useVoice } from "@humeai/voice-react";
import { Button } from "./ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toggle } from "./ui/toggle";
import MicFFT from "./MicFFT";
import { cn } from "@/utils";

export default function Controls() {
  const { disconnect, status, isMuted, unmute, mute, micFft } = useVoice();

  return (
    <div className="flex items-center justify-center p-2">
      <AnimatePresence>
        {status.value === "connected" ? (
          <motion.div
            initial={{
              y: 50,
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 50,
              opacity: 0,
              scale: 0.9,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="glass-effect rounded-xl p-3 flex items-center gap-4 shadow-lg border border-white/20 backdrop-blur-xl"
          >
            {/* Mute/Unmute Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Toggle
                className={cn(
                  "rounded-full w-10 h-10 transition-all duration-300",
                  "data-[state=on]:bg-gradient-to-br data-[state=on]:from-green-500 data-[state=on]:to-emerald-600",
                  "data-[state=off]:bg-gradient-to-br data-[state=off]:from-red-500 data-[state=off]:to-red-600",
                  "hover:shadow-md hover:scale-105",
                  "focus-ring"
                )}
                pressed={!isMuted}
                onPressedChange={() => {
                  if (isMuted) {
                    unmute();
                  } else {
                    mute();
                  }
                }}
              >
                <motion.div
                  initial={false}
                  animate={{ 
                    rotate: isMuted ? 0 : 360,
                    scale: isMuted ? 0.9 : 1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isMuted ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-white" />
                  )}
                </motion.div>
              </Toggle>
            </motion.div>

            {/* Audio Visualizer - Minimal */}
            <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/20">
              <div className="relative grid h-6 w-32 shrink-0 grow-0">
                <MicFFT 
                  fft={micFft} 
                  className="fill-gradient-to-r from-orange-400 to-red-500" 
                />
              </div>
            </div>

            {/* End Call Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 h-10",
                  "bg-gradient-to-br from-red-500 to-red-600",
                  "hover:from-red-600 hover:to-red-700",
                  "text-white font-medium text-sm",
                  "shadow-md hover:shadow-lg",
                  "transition-all duration-300",
                  "border-0",
                  "focus-ring"
                )}
                onClick={() => {
                  disconnect();
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <PhoneOff className="w-4 h-4" />
                </motion.div>
                <span>End Call</span>
              </Button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
