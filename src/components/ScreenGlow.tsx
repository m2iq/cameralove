"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ScreenGlowProps {
  active: boolean;
}

export default function ScreenGlow({ active }: ScreenGlowProps) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Center screen glow pulse */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(225,29,72,0.12) 0%, rgba(168,85,247,0.06) 30%, transparent 60%)",
              }}
            />
          </motion.div>

          {/* Edge vignette glow */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-40"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(225,29,72,0.08), transparent)",
              }}
            />
            {/* Bottom glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-40"
              style={{
                background:
                  "linear-gradient(to top, rgba(168,85,247,0.08), transparent)",
              }}
            />
          </motion.div>

          {/* Light rays */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 19 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15, rotate: [0, 3, -3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(225,29,72,0.05) 30deg, transparent 60deg, rgba(168,85,247,0.05) 120deg, transparent 150deg, rgba(244,63,94,0.05) 210deg, transparent 240deg, rgba(192,132,252,0.05) 300deg, transparent 330deg)",
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
