"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export default function ScreenGlow() {
  const gestureDetected = useAppStore((s) => s.gestureDetected);

  return (
    <AnimatePresence>
      {gestureDetected && (
        <>
          {/* Center radial glow pulse */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(225,29,72,0.14) 0%, rgba(168,85,247,0.07) 30%, transparent 60%)",
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
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-48"
              style={{
                background: "linear-gradient(to bottom, rgba(225,29,72,0.1), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-48"
              style={{
                background: "linear-gradient(to top, rgba(168,85,247,0.1), transparent)",
              }}
            />
            <div
              className="absolute top-0 bottom-0 left-0 w-32"
              style={{
                background: "linear-gradient(to right, rgba(225,29,72,0.06), transparent)",
              }}
            />
            <div
              className="absolute top-0 bottom-0 right-0 w-32"
              style={{
                background: "linear-gradient(to left, rgba(168,85,247,0.06), transparent)",
              }}
            />
          </motion.div>

          {/* Slow rotating light rays */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 19 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(225,29,72,0.06) 20deg, transparent 40deg, rgba(168,85,247,0.06) 100deg, transparent 120deg, rgba(244,63,94,0.05) 200deg, transparent 220deg, rgba(192,132,252,0.05) 300deg, transparent 320deg)",
              }}
            />
          </motion.div>

          {/* Flash on first detection */}
          <motion.div
            className="fixed inset-0 pointer-events-none bg-white/5"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
