"use client";

import { useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export default function PhotoCapture() {
  const capturedPhoto = useAppStore((s) => s.capturedPhoto);
  const setCapturedPhoto = useAppStore((s) => s.setCapturedPhoto);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw romantic overlay on photo
  useEffect(() => {
    if (!capturedPhoto) return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Soft vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rose tint overlay
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = "rgba(225, 29, 72, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      // Soft glow center
      const glow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.4
      );
      glow.addColorStop(0, "rgba(253, 164, 175, 0.12)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating hearts
      const heartEmoji = "❤️";
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 16 + Math.random() * 32;
        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.font = `${size}px serif`;
        ctx.fillText(heartEmoji, x, y);
      }
      ctx.globalAlpha = 1;

      // Bottom gradient
      const bottomGrad = ctx.createLinearGradient(0, canvas.height * 0.8, 0, canvas.height);
      bottomGrad.addColorStop(0, "rgba(0,0,0,0)");
      bottomGrad.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Watermark
      ctx.font = "14px system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "right";
      ctx.fillText("Camera Love ❤️", canvas.width - 16, canvas.height - 16);
    };
    img.src = capturedPhoto;
  }, [capturedPhoto]);

  const handleDownload = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `camera-love-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleShare = useCallback(async () => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !navigator.share) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-love.png", { type: "image/png" });
      try {
        await navigator.share({
          title: "Camera Love ❤️",
          text: "I made a heart gesture!",
          files: [file],
        });
      } catch {
        // User cancelled share
      }
    });
  }, []);

  return (
    <AnimatePresence>
      {capturedPhoto && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCapturedPhoto(null)}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 glass-strong rounded-3xl p-6 max-w-lg w-[90vw] flex flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <h3 className="text-xl font-semibold gradient-text">
              Love Moment Captured ❤️
            </h3>

            {/* Photo preview */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
              <canvas
                ref={overlayCanvasRef}
                className="w-full h-auto"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <motion.button
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium text-sm cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ↓ Download
              </motion.button>

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <motion.button
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl glass text-white/80 font-medium text-sm cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ↗ Share
                </motion.button>
              )}

              <motion.button
                onClick={() => setCapturedPhoto(null)}
                className="py-3 px-5 rounded-xl glass text-white/60 font-medium text-sm cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ✕
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
