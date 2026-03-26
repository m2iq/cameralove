"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HeartParticle } from "@/utils/particles";

interface FloatingHeartsProps {
  particles: HeartParticle[];
}

function HeartSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function FloatingHearts({ particles }: FloatingHeartsProps) {
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
              scale: 0.3,
              rotate: p.rotation,
            }}
            animate={{
              y: "-10vh",
              opacity: [0, p.opacity, p.opacity, 0],
              scale: [0.3, 1, 1, 0.6],
              rotate: p.rotation + (Math.random() > 0.5 ? 30 : -30),
              x: `${p.x + (Math.random() - 0.5) * 10}vw`,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 4 + Math.random() * 3,
              delay: p.delay,
              ease: "easeOut",
            }}
            style={{ filter: `drop-shadow(0 0 ${p.size * 0.3}px ${p.color})` }}
          >
            <HeartSVG color={p.color} size={p.size} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
