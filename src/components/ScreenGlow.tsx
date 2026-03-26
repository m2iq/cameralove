"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

export default function ScreenGlow() {
  const gestureDetected = useAppStore((s) => s.gestureDetected);

  return (
    <AnimatePresence>
      {gestureDetected && (
        <>
          {/* Center radial glow */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
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
            transition={{ duration: 1.5 }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-48"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(225,29,72,0.08), transparent)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-48"
              style={{
                background:
                  "linear-gradient(to top, rgba(168,85,247,0.08), transparent)",
              }}
            />
          </motion.div>

          {/* Initial flash */}
          <motion.div
            className="fixed inset-0 pointer-events-none bg-white/5"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
