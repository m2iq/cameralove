"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHandGesture } from "@/hooks/useHandGesture";
import { useAppStore } from "@/lib/store";
import { ArrowRight, Camera, Heart, Loader2 } from "lucide-react";

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
  const cooldownActive = useAppStore((s) => s.cooldownActive);

  const lastCapturedTrigger = useRef(0);

  // Auto-capture photo on explosion when enabled
  useEffect(() => {
    if (!photoCaptureEnabled) return;
    if (explosionTrigger <= lastCapturedTrigger.current) return;

    lastCapturedTrigger.current = explosionTrigger;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        setCapturedPhoto(canvas.toDataURL("image/png"));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [explosionTrigger, photoCaptureEnabled, canvasRef, setCapturedPhoto]);

  const gestureLabel =
    gestureType === "korean-heart"
      ? "القلب الكوري"
      : gestureType === "heart"
        ? "تم رصد القلب"
        : "جاري البحث...";

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
                "radial-gradient(ellipse at center, rgba(225,29,72,0.15) 0%, transparent 70%)",
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
        {/* Glow border */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none z-20"
          animate={{
            boxShadow: gestureDetected
              ? "0 0 60px rgba(225,29,72,0.35), inset 0 0 40px rgba(225,29,72,0.05)"
              : "0 8px 40px rgba(0,0,0,0.4)",
            border: gestureDetected
              ? "2px solid rgba(225,29,72,0.5)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Hidden video for MediaPipe */}
        <video ref={videoRef} className="hidden" playsInline muted />

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover rounded-3xl"
        />

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/85 rounded-3xl z-30"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col items-center gap-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="w-10 h-10 text-rose-500/70" />
                </motion.div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-white/70 text-sm font-medium">
                    جاري تحميل الكاميرا...
                  </span>
                  <span className="text-white/30 text-xs">
                    تحميل نموذج تتبع اليد
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom instruction bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
          <div className="glass rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-2.5 h-2.5 rounded-full ${
                  gestureDetected
                    ? "bg-rose-500"
                    : cooldownActive
                      ? "bg-amber-400/80"
                      : "bg-emerald-400/80"
                }`}
                animate={gestureDetected ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="text-xs sm:text-sm text-white/60 font-medium">
                {cooldownActive
                  ? "انتظر قليلاً..."
                  : gestureDetected
                    ? gestureLabel
                    : "شكّل قلبًا بيديك أمام الكاميرا"}
              </span>
            </div>

            {confidence > 0 && !gestureDetected && !cooldownActive && (
              <div className="w-14 sm:w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                  animate={{ width: `${confidence * 100}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Top controls */}
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
          رجوع
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>

        {/* Photo capture toggle */}
        <motion.button
          onClick={togglePhotoCapture}
          className={`glass rounded-full px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium cursor-pointer flex items-center gap-2 transition-colors ${
            photoCaptureEnabled
              ? "text-rose-400 border-rose-500/30"
              : "text-white/50"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">التقاط صورة للحظة الحب</span>
          <span className="sm:hidden">التقاط</span>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors ${
              photoCaptureEnabled ? "bg-rose-600" : "bg-white/15"
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow"
              animate={{ x: photoCaptureEnabled ? 16 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </motion.button>
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
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              >
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              </motion.div>
              <span className="text-sm font-semibold text-rose-300">
                {gestureType === "korean-heart"
                  ? "القلب الكوري!"
                  : "تم رصد الحب!"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
