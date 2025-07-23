import { ConnectOptions, useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { toast } from "sonner";

export default function StartCall({ accessToken }: { accessToken: string }) {
  const { status, connect } = useVoice();

  const EVI_CONNECT_OPTIONS: ConnectOptions = {
    auth: { type: "accessToken", value: accessToken },
    configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID,
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
                {/* Pulsing ring effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 opacity-30 animate-ping animation-delay-75" />
                
                <Button
                  className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white shadow-2xl border-0 transition-all duration-300 group pulse-glow touch-manipulation"
                  onClick={() => {
                    connect(EVI_CONNECT_OPTIONS)
                      .then(() => {
                        // Connection successful - no toast notification
                      })
                      .catch(() => {
                        toast.error("Unable to start call", {
                          description: "Please check your microphone permissions",
                        });
                      });
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Phone
                      className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={2}
                    />
                    <div className="text-center">
                      <div className="text-lg font-bold">Start Call</div>
                      <div className="text-sm opacity-90">Tap to begin</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
