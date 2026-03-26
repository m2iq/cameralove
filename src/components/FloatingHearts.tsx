"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { HeartParticle, createHeartBurst } from "@/utils/particles";

function HeartSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function FloatingHearts() {
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const explosionTrigger = useAppStore((s) => s.explosionTrigger);
  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const lastTrigger = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Burst on explosion
  useEffect(() => {
    if (explosionTrigger <= lastTrigger.current) return;
    lastTrigger.current = explosionTrigger;
    setParticles((prev) => {
      const trimmed = prev.length > 120 ? prev.slice(-80) : prev;
      return [...trimmed, ...createHeartBurst(25)];
    });
  }, [explosionTrigger]);

  // Continuous hearts while gesture held
  useEffect(() => {
    if (gestureDetected) {
      intervalRef.current = setInterval(() => {
        setParticles((prev) => {
          const trimmed = prev.length > 150 ? prev.slice(-100) : prev;
          return [...trimmed, ...createHeartBurst(6)];
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gestureDetected]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 25 }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            initial={{
              x: `${p.x}vw`,
              y: "110vh",
              opacity: 0,
              scale: 0.2,
              rotate: p.rotation,
            }}
            animate={{
              y: "-10vh",
              opacity: [0, p.opacity, p.opacity * 0.8, 0],
              scale: [0.2, 1, 0.9, 0.5],
              rotate: p.rotation + (Math.random() > 0.5 ? 40 : -40),
              x: `${p.x + (Math.random() - 0.5) * 12}vw`,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 5 + Math.random() * 3,
              delay: p.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ filter: `drop-shadow(0 0 ${p.size * 0.4}px ${p.color})` }}
          >
            <HeartSVG color={p.color} size={p.size} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
