"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

const COLORS = [
  "#e11d48", "#f43f5e", "#fb7185", "#fda4af",
  "#f9a8d4", "#f472b6", "#ec4899", "#c084fc", "#a855f7",
];

const DUST_COLORS = ["#fda4af", "#fecdd3", "#fff1f2", "#c084fc", "#e9d5ff"];

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

interface Dust {
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
  const dustRef = useRef<Dust[]>([]);
  const animRef = useRef(0);
  const lastTimeRef = useRef(0);
  const continuousTimerRef = useRef(0);

  const explosionTrigger = useAppStore((s) => s.explosionTrigger);
  const explosionX = useAppStore((s) => s.explosionX);
  const explosionY = useAppStore((s) => s.explosionY);
  const gestureDetected = useAppStore((s) => s.gestureDetected);
  const heartX = useAppStore((s) => s.heartX);
  const heartY = useAppStore((s) => s.heartY);
  const lastTriggerRef = useRef(0);
  const gestureRef = useRef(false);
  const heartPosRef = useRef({ x: 0.5, y: 0.5 });
  const explosionPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    gestureRef.current = gestureDetected;
  }, [gestureDetected]);

  useEffect(() => {
    heartPosRef.current = { x: heartX, y: heartY };
  }, [heartX, heartY]);

  useEffect(() => {
    explosionPosRef.current = { x: explosionX, y: explosionY };
  }, [explosionX, explosionY]);

  // Cinematic burst at explosion position
  useEffect(() => {
    if (explosionTrigger <= lastTriggerRef.current) return;
    lastTriggerRef.current = explosionTrigger;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use explosion position (screen pixels from hook) mapped to overlay canvas
    const cx = explosionPosRef.current.x
      ? (explosionPosRef.current.x / 640) * canvas.width
      : canvas.width / 2;
    const cy = explosionPosRef.current.y
      ? (explosionPosRef.current.y / 480) * canvas.height
      : canvas.height / 2;

    // Big burst: 50 hearts
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5;
      const life = 2.5 + Math.random() * 2.5;
      heartsRef.current.push({
        x: cx + (Math.random() - 0.5) * 50,
        y: cy + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 6 + Math.random() * 30,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 0.75 + Math.random() * 0.25,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        life,
        maxLife: life,
        glow: 8 + Math.random() * 16,
      });
    }

    // Spark burst: 35 sparks
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      const life = 0.5 + Math.random() * 1.2;
      sparksRef.current.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3.5,
        opacity: 0.8 + Math.random() * 0.2,
        life,
        maxLife: life,
        color: Math.random() > 0.3 ? "#fda4af" : "#ffffff",
      });
    }

    // Light dust burst: 20 particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2;
      const life = 2 + Math.random() * 3;
      dustRef.current.push({
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3,
        size: 2 + Math.random() * 5,
        opacity: 0.3 + Math.random() * 0.3,
        life,
        maxLife: life,
        color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
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

      // Continuous heart trail at hand position (TikTok-style)
      if (gestureRef.current) {
        continuousTimerRef.current += dt;
        if (continuousTimerRef.current > 0.25) {
          continuousTimerRef.current = 0;

          // Spawn hearts at the hand position
          const hx = heartPosRef.current.x * canvas.width;
          const hy = heartPosRef.current.y * canvas.height;

          for (let i = 0; i < 3; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
            const speed = 1 + Math.random() * 2;
            const life = 3 + Math.random() * 2;
            heartsRef.current.push({
              x: hx + (Math.random() - 0.5) * 40,
              y: hy + (Math.random() - 0.5) * 40,
              vx: Math.cos(angle) * speed * 0.5,
              vy: Math.sin(angle) * speed - 1,
              size: 10 + Math.random() * 20,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              opacity: 0.5 + Math.random() * 0.3,
              rotation: (Math.random() - 0.5) * 0.3,
              rotSpeed: (Math.random() - 0.5) * 0.015,
              life,
              maxLife: life,
              glow: 4 + Math.random() * 10,
            });
          }

          // Light dust trail
          for (let i = 0; i < 4; i++) {
            const life = 1.5 + Math.random() * 2;
            dustRef.current.push({
              x: hx + (Math.random() - 0.5) * 60,
              y: hy + (Math.random() - 0.5) * 60,
              vx: (Math.random() - 0.5) * 0.5,
              vy: -(0.3 + Math.random() * 0.8),
              size: 2 + Math.random() * 4,
              opacity: 0.2 + Math.random() * 0.25,
              life,
              maxLife: life,
              color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
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
        h.vy -= 0.005; // slight upward drift
        h.x += h.vx * 60 * dt;
        h.y += h.vy * 60 * dt;
        h.rotation += h.rotSpeed;

        const lifeRatio = h.life / h.maxLife;
        const fadeIn = Math.min(1, (h.maxLife - h.life) / 0.2);
        const fadeOut = lifeRatio < 0.2 ? lifeRatio / 0.2 : 1;
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

        s.vx *= 0.95;
        s.vy *= 0.95;
        s.x += s.vx * 60 * dt;
        s.y += s.vy * 60 * dt;

        const lifeRatio = s.life / s.maxLife;
        const alpha = s.opacity * lifeRatio;

        if (alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = s.size * 5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * lifeRatio, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        aliveSparks.push(s);
      }
      sparksRef.current = aliveSparks;

      // Update & draw dust
      const aliveDust: Dust[] = [];
      for (const d of dustRef.current) {
        d.life -= dt;
        if (d.life <= 0) continue;

        d.x += d.vx * 60 * dt;
        d.y += d.vy * 60 * dt;
        d.vx += (Math.random() - 0.5) * 0.02; // gentle drift

        const lifeRatio = d.life / d.maxLife;
        const fadeIn = Math.min(1, (d.maxLife - d.life) / 0.3);
        const fadeOut = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1;
        const alpha = d.opacity * fadeIn * fadeOut;

        if (alpha > 0.005) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = d.color;
          ctx.shadowColor = d.color;
          ctx.shadowBlur = d.size * 3;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size * (0.7 + 0.3 * lifeRatio), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        aliveDust.push(d);
      }
      dustRef.current = aliveDust;

      // Cap particle counts
      if (heartsRef.current.length > 150) {
        heartsRef.current = heartsRef.current.slice(-120);
      }
      if (sparksRef.current.length > 80) {
        sparksRef.current = sparksRef.current.slice(-60);
      }
      if (dustRef.current.length > 60) {
        dustRef.current = dustRef.current.slice(-45);
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
