"use client";

import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";

interface LandingScreenProps {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(225,29,72,0.15) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.12) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 50% 80%, rgba(244,63,94,0.1) 0%, transparent 50%), " +
              "#0a0a0a",
          }}
        />
        {/* Slow moving gradient overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 40%, rgba(225,29,72,0.12) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 60%, rgba(168,85,247,0.12) 0%, transparent 60%)",
              "radial-gradient(ellipse at 40% 70%, rgba(244,63,94,0.12) 0%, transparent 60%)",
              "radial-gradient(ellipse at 30% 40%, rgba(225,29,72,0.12) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <ParticleBackground />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Decorative heart icon */}
        <motion.div
          className="text-6xl md:text-7xl"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          💕
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="gradient-text">
            Make a Heart
          </span>
          <br />
          <span className="text-white/90">
            With Your Hands
          </span>
          <motion.span
            className="inline-block ml-3"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ❤️
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-white/50 max-w-md font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Use your camera to create a heart gesture and watch the magic unfold
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={onStart}
          className="group relative mt-4 px-10 py-4 rounded-full font-semibold text-lg text-white overflow-hidden cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Button gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-full" />
          {/* Button glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer rounded-full" />
          <span className="relative z-10 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Start Camera
          </span>
        </motion.button>

        {/* Bottom hint */}
        <motion.div
          className="mt-8 flex items-center gap-2 text-sm text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="w-2 h-2 rounded-full bg-green-400/60 animate-pulse" />
          Camera access required
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />
    </div>
  );
}
