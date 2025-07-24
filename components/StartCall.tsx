import { ConnectOptions, useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { status, connect } = useVoice();
  const [isClicked, setIsClicked] = useState(false);

  const EVI_CONNECT_OPTIONS: ConnectOptions = {
    auth: { type: "accessToken", value: accessToken },
    configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID,
  };

  // Reset when call ends
  useEffect(() => {
    if (status.value === "disconnected") {
      setIsClicked(false);
    }
  }, [status.value]);

  const handleClick = () => {
    setIsClicked(true);
    
    connect(EVI_CONNECT_OPTIONS)
      .then(() => {
        // Connection successful - no toast notification
      })
      .catch(() => {
        setIsClicked(false); // Reset if connection fails
        toast.error("Unable to start call", {
          description: "Please check your microphone permissions",
        });
      });
  };

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 z-50 h-screen"
          style={{ height: '100dvh' }}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-200 to-orange-200 rounded-full opacity-20 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
            {/* Call button */}
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Full screen pulse waves - triggered on click */}
                <AnimatePresence>
                  {isClicked && (
                    <>
                      {/* Main pulse that fills the entire screen */}
                      <motion.div
                        className="fixed inset-0 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 z-20"
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ 
                          scale: [0, 15, 20], 
                          opacity: [0.8, 0.6, 1] 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1.5, 
                          ease: [0.25, 0.46, 0.45, 0.94],
                          times: [0, 0.7, 1]
                        }}
                        style={{
                          transformOrigin: "center center",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                      
                      {/* Secondary pulse wave */}
                      <motion.div
                        className="fixed inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-400 z-19"
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ 
                          scale: [0, 12, 18], 
                          opacity: [0.6, 0.4, 0] 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1.3, 
                          ease: [0.25, 0.46, 0.45, 0.94],
                          delay: 0.1,
                          times: [0, 0.6, 1]
                        }}
                        style={{
                          transformOrigin: "center center",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                      
                      {/* Tertiary pulse wave */}
                      <motion.div
                        className="fixed inset-0 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-red-300 z-18"
                        initial={{ scale: 0, opacity: 0.4 }}
                        animate={{ 
                          scale: [0, 10, 16], 
                          opacity: [0.4, 0.2, 0] 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1.1, 
                          ease: [0.25, 0.46, 0.45, 0.94],
                          delay: 0.2,
                          times: [0, 0.5, 1]
                        }}
                        style={{
                          transformOrigin: "center center",
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </>
                  )}
                </AnimatePresence>
                
                <Button
                  className="relative z-30 w-40 h-40 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white shadow-2xl border-0 transition-all duration-300 group touch-manipulation"
                  onClick={handleClick}
                  disabled={isClicked}
                >
                  <motion.div 
                    className="flex flex-col items-center justify-center gap-3"
                    animate={isClicked ? { scale: 0.9 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Phone
                      className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={2}
                    />
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {isClicked ? "Connecting..." : "Start Call"}
                      </div>
                      <div className="text-sm opacity-90">
                        {isClicked ? "Please wait" : "Tap to begin"}
                      </div>
                    </div>
                  </motion.div>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
