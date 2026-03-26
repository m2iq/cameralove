"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export default function ScreenGlow() {
  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const heartX = useAppStore((s) => s.heartX);
  const heartY = useAppStore((s) => s.heartY);
  const explosionTrigger = useAppStore((s) => s.explosionTrigger);

  // Convert normalized position to percentage for CSS
  const glowLeft = `${heartX * 100}%`;
  const glowTop = `${heartY * 100}%`;

  return (
    <AnimatePresence>
      {gestureDetected && (
        <>
          {/* Position-aware radial glow centered on heart */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.6] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 60% 60% at ${glowLeft} ${glowTop}, rgba(225,29,72,0.15) 0%, rgba(168,85,247,0.07) 35%, transparent 65%)`,
              }}
            />
          </motion.div>

          {/* Light beams from heart position */}
          <motion.div
            className="fixed inset-0 pointer-events-none overflow-hidden"
            style={{ zIndex: 19 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={angle}
                className="absolute"
                style={{
                  left: glowLeft,
                  top: glowTop,
                  width: "2px",
                  height: "120px",
                  transformOrigin: "top center",
                  transform: `rotate(${angle}deg)`,
                  background:
                    "linear-gradient(to bottom, rgba(225,29,72,0.2), rgba(253,164,175,0.05), transparent)",
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  height: ["100px", "160px", "100px"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Edge vignette */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-40"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(225,29,72,0.06), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-40"
              style={{
                background:
                  "linear-gradient(to top, rgba(168,85,247,0.06), transparent)",
              }}
            />
          </motion.div>

          {/* Explosion flash */}
          <motion.div
            key={explosionTrigger}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0.25 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${glowLeft} ${glowTop}, rgba(255,255,255,0.12) 0%, transparent 50%)`,
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
