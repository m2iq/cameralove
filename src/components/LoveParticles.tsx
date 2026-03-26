"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/lib/store";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulse: number;
  pulseSpeed: number;
  type: "dot" | "glow" | "dust";
  hue: number;
}

export default function LoveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const gestureRef = useRef(false);

  useEffect(() => {
    gestureRef.current = gestureDetected;
  }, [gestureDetected]);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(80, Math.floor((w * h) / 12000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.15 - Math.random() * 0.35,
      size: 0.8 + Math.random() * 2.5,
      opacity: 0.08 + Math.random() * 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.02,
      type: (
        Math.random() < 0.3 ? "glow" : Math.random() < 0.5 ? "dust" : "dot"
      ) as Particle["type"],
      hue: 330 + Math.random() * 40,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const active = gestureRef.current;

      for (const p of particlesRef.current) {
        p.x += p.vx * (active ? 1.5 : 1);
        p.y += p.vy * (active ? 1.8 : 1);
        p.pulse += p.pulseSpeed * (active ? 2 : 1);

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const baseOpacity = active ? p.opacity * 2.5 : p.opacity;
        const currentOpacity = baseOpacity * (0.5 + 0.5 * Math.sin(p.pulse));

        if (p.type === "glow") {
          const r = p.size * (active ? 8 : 5);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          grad.addColorStop(
            0,
            `hsla(${p.hue}, 80%, 70%, ${currentOpacity})`
          );
          grad.addColorStop(
            0.5,
            `hsla(${p.hue}, 70%, 50%, ${currentOpacity * 0.3})`
          );
          grad.addColorStop(1, `hsla(${p.hue}, 60%, 40%, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "dust") {
          ctx.fillStyle = `hsla(${p.hue}, 60%, 80%, ${currentOpacity * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core dot
        ctx.fillStyle = `hsla(${p.hue}, 80%, 85%, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
