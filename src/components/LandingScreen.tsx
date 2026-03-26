"use client";

import { motion } from "framer-motion";
import { Heart, Camera, Sparkles, ImageIcon } from "lucide-react";

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
              "radial-gradient(ellipse at 20% 50%, rgba(225,29,72,0.18) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.14) 0%, transparent 50%), " +
              "radial-gradient(ellipse at 50% 80%, rgba(244,63,94,0.12) 0%, transparent 50%), " +
              "#0a0a0a",
          }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 40%, rgba(225,29,72,0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse at 70% 60%, rgba(168,85,247,0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse at 40% 70%, rgba(244,63,94,0.15) 0%, transparent 60%)",
              "radial-gradient(ellipse at 30% 40%, rgba(225,29,72,0.15) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        {/* Subtle noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Heart icon */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            type: "spring",
            stiffness: 200,
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              filter: [
                "drop-shadow(0 0 12px rgba(225,29,72,0.4))",
                "drop-shadow(0 0 24px rgba(225,29,72,0.6))",
                "drop-shadow(0 0 12px rgba(225,29,72,0.4))",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-rose-500 fill-rose-500" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 40px 20px rgba(225,29,72,0.08)",
                "0 0 60px 30px rgba(225,29,72,0.15)",
                "0 0 40px 20px rgba(225,29,72,0.08)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="gradient-text">اصنع قلبًا</span>
          <br />
          <span className="text-white/90">بيديك</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-white/40 max-w-lg font-light leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          شكّل قلبًا بيديك أمام الكاميرا وشاهد السحر
          <br className="hidden sm:block" />
          <span className="text-white/25">
            يدعم القلب الكلاسيكي والقلب الكوري
          </span>
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={onStart}
          className="group relative mt-4 sm:mt-6 px-10 sm:px-12 py-4 sm:py-5 rounded-full font-semibold text-base sm:text-lg text-white overflow-hidden cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-full" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full blur-xl"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="absolute inset-0 shimmer rounded-full" />
          <span className="relative z-10 flex items-center gap-2.5">
            <Camera className="w-5 h-5" />
            تشغيل الكاميرا
          </span>
        </motion.button>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {[
            { icon: Heart, label: "القلب الكوري" },
            { icon: Heart, label: "القلب الكلاسيكي" },
            { icon: ImageIcon, label: "التقاط صور" },
            { icon: Sparkles, label: "تأثيرات بصرية" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="glass rounded-full px-4 py-1.5 text-xs text-white/40 font-medium flex items-center gap-1.5"
            >
              <Icon className="w-3 h-3" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          className="mt-6 sm:mt-8 flex items-center gap-2 text-sm text-white/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400/50 animate-pulse" />
          يتطلب الوصول إلى الكاميرا
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />
    </div>
  );
}
