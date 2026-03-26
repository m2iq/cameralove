"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

const COLORS = [
  "#e11d48", "#f43f5e", "#fb7185", "#fda4af",
  "#f9a8d4", "#f472b6", "#ec4899", "#c084fc", "#a855f7",
];

interface Heart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
  glow: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  alpha: number,
  glowRadius: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = glowRadius;

  const w = size;
  const h = size;
  const d = h * 0.3;

  ctx.translate(0, -h * 0.35);

  ctx.beginPath();
  ctx.moveTo(0, d);
  ctx.bezierCurveTo(0, 0, -w / 2, 0, -w / 2, d);
  ctx.bezierCurveTo(-w / 2, (h + d) / 2, 0, (h + d) / 2, 0, h);
  ctx.bezierCurveTo(0, (h + d) / 2, w / 2, (h + d) / 2, w / 2, d);
  ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, d);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export default function HeartParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const animRef = useRef(0);
  const lastTimeRef = useRef(0);
  const continuousTimerRef = useRef(0);

  const explosionTrigger = useAppStore((s) => s.explosionTrigger);
  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const lastTriggerRef = useRef(0);
  const gestureRef = useRef(false);

  useEffect(() => {
    gestureRef.current = gestureDetected;
  }, [gestureDetected]);

  // Burst on explosion trigger
  useEffect(() => {
    if (explosionTrigger <= lastTriggerRef.current) return;
    lastTriggerRef.current = explosionTrigger;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      heartsRef.current.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 8 + Math.random() * 26,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.7 + Math.random() * 0.3,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        life: 3 + Math.random() * 2,
        maxLife: 3 + Math.random() * 2,
        glow: 6 + Math.random() * 14,
      });
    }

    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      sparksRef.current.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3,
        life: 0.6 + Math.random() * 1,
        maxLife: 0.6 + Math.random() * 1,
        color: Math.random() > 0.4 ? "#fda4af" : "#ffffff",
      });
    }
  }, [explosionTrigger]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = (time: number) => {
      const dt = Math.min(
        (time - (lastTimeRef.current || time)) / 1000,
        0.05
      );
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Continuous gentle hearts while gesture held
      if (gestureRef.current) {
        continuousTimerRef.current += dt;
        if (continuousTimerRef.current > 0.4) {
          continuousTimerRef.current = 0;
          for (let i = 0; i < 2; i++) {
            heartsRef.current.push({
              x: canvas.width * 0.2 + Math.random() * canvas.width * 0.6,
              y: canvas.height + 20,
              vx: (Math.random() - 0.5) * 1,
              vy: -(1.5 + Math.random() * 2),
              size: 10 + Math.random() * 18,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              opacity: 0.5 + Math.random() * 0.3,
              rotation: (Math.random() - 0.5) * 0.3,
              rotSpeed: (Math.random() - 0.5) * 0.01,
              life: 4 + Math.random() * 3,
              maxLife: 4 + Math.random() * 3,
              glow: 4 + Math.random() * 8,
            });
          }
        }
      } else {
        continuousTimerRef.current = 0;
      }

      // Update & draw hearts
      const aliveHearts: Heart[] = [];
      for (const h of heartsRef.current) {
        h.life -= dt;
        if (h.life <= 0) continue;

        h.vx *= 0.997;
        h.vy *= 0.997;
        h.x += h.vx * 60 * dt;
        h.y += h.vy * 60 * dt;
        h.rotation += h.rotSpeed;

        const lifeRatio = h.life / h.maxLife;
        const fadeIn = Math.min(1, (h.maxLife - h.life) / 0.25);
        const fadeOut = lifeRatio < 0.25 ? lifeRatio / 0.25 : 1;
        const alpha = h.opacity * fadeIn * fadeOut;

        if (alpha > 0.01) {
          drawHeart(
            ctx,
            h.x,
            h.y,
            h.size,
            h.rotation,
            h.color,
            alpha,
            h.glow * fadeOut
          );
        }
        aliveHearts.push(h);
      }
      heartsRef.current = aliveHearts;

      // Update & draw sparks
      const aliveSparks: Spark[] = [];
      for (const s of sparksRef.current) {
        s.life -= dt;
        if (s.life <= 0) continue;

        s.vx *= 0.96;
        s.vy *= 0.96;
        s.x += s.vx * 60 * dt;
        s.y += s.vy * 60 * dt;

        const lifeRatio = s.life / s.maxLife;
        const alpha = s.opacity * lifeRatio;

        if (alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = s.size * 4;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        aliveSparks.push(s);
      }
      sparksRef.current = aliveSparks;

      // Cap particle count
      if (heartsRef.current.length > 120) {
        heartsRef.current = heartsRef.current.slice(-100);
      }
      if (sparksRef.current.length > 60) {
        sparksRef.current = sparksRef.current.slice(-50);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 30 }}
    />
  );
}
