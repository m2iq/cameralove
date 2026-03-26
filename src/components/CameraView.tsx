"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useHandGesture } from "@/hooks/useHandGesture";

interface CameraViewProps {
  heartDetected: boolean;
  onHeartDetected: () => void;
  onHeartLost: () => void;
  onBack: () => void;
}

export default function CameraView({
  heartDetected,
  onHeartDetected,
  onHeartLost,
  onBack,
}: CameraViewProps) {
  const { videoRef, canvasRef, isLoading, confidence } = useHandGesture({
    onHeartDetected,
    onHeartLost,
    enabled: true,
  });

  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      {/* Background glow when heart detected */}
      <AnimatePresence>
        {heartDetected && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(225,29,72,0.15) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Camera container */}
      <motion.div
        className="relative z-10 w-[90vw] max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Glassmorphism border */}
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-700 ${
            heartDetected ? "glow-pulse" : ""
          }`}
          style={{
            border: heartDetected
              ? "2px solid rgba(225, 29, 72, 0.5)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: heartDetected
              ? "0 0 40px rgba(225, 29, 72, 0.3), inset 0 0 40px rgba(225, 29, 72, 0.05)"
              : "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        />

        {/* Hidden video element for MediaPipe */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />

        {/* Canvas for rendering processed camera feed */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover rounded-3xl"
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-3xl"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-white/60 text-sm">
                  Initializing camera...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instruction overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  heartDetected ? "bg-rose-500" : "bg-emerald-400"
                }`}
                animate={heartDetected ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="text-sm text-white/70 font-medium">
                {heartDetected
                  ? "Heart detected! ❤️"
                  : "Make a heart with both hands 🤲"}
              </span>
            </div>

            {/* Confidence indicator */}
            {confidence > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Back button */}
      <motion.button
        onClick={onBack}
        className="absolute top-6 left-6 z-20 glass rounded-full px-5 py-2.5 text-sm text-white/70 hover:text-white/90 transition-colors cursor-pointer"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </motion.button>

      {/* Heart detected label */}
      <AnimatePresence>
        {heartDetected && (
          <motion.div
            className="absolute top-6 right-6 z-20"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
          >
            <div className="glass-strong rounded-full px-5 py-2.5 flex items-center gap-2">
              <motion.span
                className="text-lg"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ❤️
              </motion.span>
              <span className="text-sm font-medium text-rose-300">
                Love Detected
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
