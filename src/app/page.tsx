"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingScreen from "@/components/LandingScreen";
import CameraView from "@/components/CameraView";
import FloatingHearts from "@/components/FloatingHearts";
import HeartCanvas from "@/components/HeartCanvas";
import ScreenGlow from "@/components/ScreenGlow";
import { HeartParticle, createHeartBurst, createSparkle } from "@/utils/particles";

type AppScreen = "landing" | "camera";

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [heartDetected, setHeartDetected] = useState(false);
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const [canvasParticles, setCanvasParticles] = useState<HeartParticle[]>([]);
  const burstIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startBursting = useCallback(() => {
    // Initial large burst
    setParticles((prev) => [...prev, ...createHeartBurst(30)]);
    setCanvasParticles((prev) => [
      ...prev,
      ...createHeartBurst(15),
      ...Array.from({ length: 20 }, () => createSparkle()),
    ]);

    // Continuous smaller bursts
    burstIntervalRef.current = setInterval(() => {
      setParticles((prev) => {
        const trimmed = prev.length > 150 ? prev.slice(-100) : prev;
        return [...trimmed, ...createHeartBurst(8)];
      });
      setCanvasParticles((prev) => {
        const trimmed = prev.length > 100 ? prev.slice(-60) : prev;
        return [
          ...trimmed,
          ...createHeartBurst(5),
          ...Array.from({ length: 8 }, () => createSparkle()),
        ];
      });
    }, 1200);
  }, []);

  const stopBursting = useCallback(() => {
    if (burstIntervalRef.current) {
      clearInterval(burstIntervalRef.current);
      burstIntervalRef.current = null;
    }
  }, []);

  const handleHeartDetected = useCallback(() => {
    setHeartDetected(true);
    startBursting();
  }, [startBursting]);

  const handleHeartLost = useCallback(() => {
    setHeartDetected(false);
    stopBursting();
  }, [stopBursting]);

  const handleBack = useCallback(() => {
    setScreen("landing");
    setHeartDetected(false);
    setParticles([]);
    setCanvasParticles([]);
    stopBursting();
  }, [stopBursting]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        {screen === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingScreen onStart={() => setScreen("camera")} />
          </motion.div>
        ) : (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CameraView
              heartDetected={heartDetected}
              onHeartDetected={handleHeartDetected}
              onHeartLost={handleHeartLost}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hearts (Framer Motion — DOM based) */}
      <FloatingHearts particles={particles} />

      {/* Heart Canvas (Canvas 2D — high performance) */}
      <HeartCanvas particles={canvasParticles} active={heartDetected} />

      {/* Screen glow effects */}
      <ScreenGlow active={heartDetected} />
    </main>
  );
}
