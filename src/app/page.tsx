"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingScreen from "@/components/LandingScreen";
import CameraView from "@/components/CameraView";
import HeartParticles from "@/components/HeartParticles";
import ScreenGlow from "@/components/ScreenGlow";
import LoveParticles from "@/components/LoveParticles";
import PhotoCapture from "@/components/PhotoCapture";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const screen = useAppStore((s) => s.screen);
  const setScreen = useAppStore((s) => s.setScreen);
  const reset = useAppStore((s) => s.reset);

  const handleBack = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <LoveParticles />

      <AnimatePresence mode="wait">
        {screen === "landing" ? (
          <motion.div
            key="landing"
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LandingScreen onStart={() => setScreen("camera")} />
          </motion.div>
        ) : (
          <motion.div
            key="camera"
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CameraView onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      {screen === "camera" && (
        <>
          <HeartParticles />
          <ScreenGlow />
        </>
      )}

      <PhotoCapture />
    </main>
  );
}
