"use client";

import { useCallback, lazy, Suspense, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingScreen from "@/components/LandingScreen";
import CameraView from "@/components/CameraView";
import FloatingHearts from "@/components/FloatingHearts";
import ScreenGlow from "@/components/ScreenGlow";
import LoveParticles from "@/components/LoveParticles";
import PhotoCapture from "@/components/PhotoCapture";
import { useAppStore } from "@/lib/store";

// Lazy load heavy 3D component
const HeartExplosion3D = lazy(() => import("@/components/HeartExplosion3D"));

export default function Home() {
  const screen = useAppStore((s) => s.screen);
  const setScreen = useAppStore((s) => s.setScreen);
  const reset = useAppStore((s) => s.reset);
  const musicEnabled = useAppStore((s) => s.musicEnabled);
  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Background music management
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (musicEnabled && screen === "camera") {
      if (!audioRef.current) {
        // Use a royalty-free romantic tone via Web Audio API
        const audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();

        // Store a ref to clean up
        audioRef.current = { close: () => { gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5); setTimeout(() => { osc.stop(); audioCtx.close(); }, 600); } } as unknown as HTMLAudioElement;
      }
    } else {
      if (audioRef.current) {
        (audioRef.current as unknown as { close: () => void }).close();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        (audioRef.current as unknown as { close: () => void }).close();
        audioRef.current = null;
      }
    };
  }, [musicEnabled, screen]);

  const handleBack = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* Ambient particles — always visible */}
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

      {/* Effects layer — only when camera is active */}
      {screen === "camera" && (
        <>
          <FloatingHearts />

          <Suspense fallback={null}>
            <HeartExplosion3D />
          </Suspense>

          <ScreenGlow />
        </>
      )}

      {/* Photo capture modal */}
      <PhotoCapture />
    </main>
  );
}
