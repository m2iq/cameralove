"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHandGesture } from "@/hooks/useHandGesture";
import { useAppStore } from "@/lib/store";

interface CameraViewProps {
  onBack: () => void;
}

export default function CameraView({ onBack }: CameraViewProps) {
  const { videoRef, canvasRef, isLoading } = useHandGesture({ enabled: true });

  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const gestureType = useAppStore((s) => s.gestureType);
  const confidence = useAppStore((s) => s.confidence);
  const photoCaptureEnabled = useAppStore((s) => s.photoCaptureEnabled);
  const togglePhotoCapture = useAppStore((s) => s.togglePhotoCapture);
  const setCapturedPhoto = useAppStore((s) => s.setCapturedPhoto);
  const explosionTrigger = useAppStore((s) => s.explosionTrigger);
  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const toggleMusic = useAppStore((s) => s.toggleMusic);

  const lastCapturedTrigger = useRef(0);

  // Auto-capture photo on heart detection when enabled
  useEffect(() => {
    if (
      photoCaptureEnabled &&
      gestureDetected &&
      explosionTrigger > lastCapturedTrigger.current
    ) {
      lastCapturedTrigger.current = explosionTrigger;
      // Small delay to let the user see the explosion first
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          setCapturedPhoto(canvas.toDataURL("image/png"));
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [explosionTrigger, photoCaptureEnabled, gestureDetected, canvasRef, setCapturedPhoto]);

  const gestureLabel = gestureType === "korean-heart"
    ? "Korean Heart ✌️❤️"
    : gestureType === "heart"
    ? "Heart Detected ❤️"
    : "Scanning...";

  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      {/* Background glow on detection */}
      <AnimatePresence>
        {gestureDetected && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(225,29,72,0.18) 0%, rgba(168,85,247,0.1) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Camera container */}
      <motion.div
        className="relative z-10 w-[92vw] sm:w-[85vw] max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glassmorphism border + glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{
            border: gestureDetected
              ? "2px solid rgba(225, 29, 72, 0.6)"
              : "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: gestureDetected
              ? "0 0 60px rgba(225, 29, 72, 0.35), 0 0 120px rgba(225, 29, 72, 0.1), inset 0 0 40px rgba(225, 29, 72, 0.05)"
              : "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
          transition={{ duration: 0.6 }}
          style={{ zIndex: 2 }}
        />

        {/* Hidden video for MediaPipe */}
        <video ref={videoRef} className="hidden" playsInline muted />

        {/* Canvas */}
        <canvas ref={canvasRef} className="w-full h-full object-cover rounded-3xl" />

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/85 rounded-3xl z-10"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  className="w-12 h-12 border-2 border-rose-500/60 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-white/70 text-sm font-medium">
                    Initializing camera...
                  </span>
                  <span className="text-white/30 text-xs">
                    Loading hand tracking model
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom instruction bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
          <div className="glass rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  gestureDetected ? "bg-rose-500" : "bg-emerald-400/80"
                }`}
                animate={gestureDetected ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="text-xs sm:text-sm text-white/60 font-medium">
                {gestureDetected ? gestureLabel : "Make a heart with your hands 🤲"}
              </span>
            </div>

            {/* Confidence bar */}
            {confidence > 0 && !gestureDetected && (
              <div className="flex items-center gap-2">
                <div className="w-14 sm:w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Top bar: Back + controls */}
      <motion.div
        className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Back button */}
        <motion.button
          onClick={onBack}
          className="glass rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer flex items-center gap-1.5"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </motion.button>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Music toggle */}
          <motion.button
            onClick={toggleMusic}
            className={`glass rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm cursor-pointer transition-colors ${
              musicEnabled ? "text-rose-400" : "text-white/40"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Toggle music"
          >
            {musicEnabled ? "🎵" : "🔇"}
          </motion.button>

          {/* Photo capture toggle */}
          <div className="glass rounded-full px-3 sm:px-4 py-2 flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-white/40 font-medium hidden sm:inline">
              📸 Capture
            </span>
            <span className="text-[10px] sm:text-xs text-white/40 font-medium sm:hidden">
              📸
            </span>
            <button
              onClick={togglePhotoCapture}
              className={`relative w-9 sm:w-10 h-5 sm:h-5.5 rounded-full transition-colors cursor-pointer ${
                photoCaptureEnabled
                  ? "bg-gradient-to-r from-rose-600 to-pink-500"
                  : "bg-white/10"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-white rounded-full shadow-md"
                animate={{ left: photoCaptureEnabled ? "calc(100% - 18px)" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Heart detected label */}
      <AnimatePresence>
        {gestureDetected && (
          <motion.div
            className="absolute bottom-6 sm:bottom-8 z-20"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="glass-strong rounded-full px-6 py-3 flex items-center gap-3">
              <motion.span
                className="text-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              >
                ❤️
              </motion.span>
              <span className="text-sm font-semibold text-rose-300">
                {gestureType === "korean-heart" ? "Korean Finger Heart!" : "Love Detected!"}
              </span>
              {photoCaptureEnabled && (
                <span className="text-xs text-white/40">📸 Capturing...</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
