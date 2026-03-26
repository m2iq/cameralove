"use client";

import { useEffect, useRef } from "react";
import { HeartParticle } from "@/utils/particles";

interface HeartCanvasProps {
  particles: HeartParticle[];
  active: boolean;
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  opacity: number,
  rotation: number,
  glow: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.globalAlpha = opacity;

  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.8;
  }

  ctx.fillStyle = color;
  ctx.beginPath();

  const s = size / 30;
  ctx.moveTo(0, -s * 8);
  ctx.bezierCurveTo(-s * 15, -s * 25, -s * 30, -s * 5, 0, s * 15);
  ctx.moveTo(0, -s * 8);
  ctx.bezierCurveTo(s * 15, -s * 25, s * 30, -s * 5, 0, s * 15);
  ctx.fill();

  ctx.restore();
}

export default function HeartCanvas({ particles, active }: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<
    (HeartParticle & { currentY: number; currentOpacity: number; wobblePhase: number })[]
  >([]);
  const animRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);

  // Sync new particles
  useEffect(() => {
    const existingIds = new Set(particlesRef.current.map((p) => p.id));
    for (const p of particles) {
      if (!existingIds.has(p.id)) {
        particlesRef.current.push({
          ...p,
          currentY: p.y,
          currentOpacity: 0,
          wobblePhase: p.wobble,
        });
      }
    }
  }, [particles]);

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
      const dt = prevTimeRef.current ? (time - prevTimeRef.current) / 16.667 : 1;
      prevTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Screen glow when active
      if (active) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.6
        );
        gradient.addColorStop(0, "rgba(225, 29, 72, 0.06)");
        gradient.addColorStop(0.5, "rgba(225, 29, 72, 0.02)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const toRemove: number[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        // Update position
        p.currentY -= p.speed * dt;
        p.wobblePhase += 0.02 * dt;

        const wobbleX = Math.sin(p.wobblePhase) * 20;

        // Fade in quickly, then fade out as it rises
        const lifeProgress = 1 - p.currentY / 120;
        if (lifeProgress < 0.1) {
          p.currentOpacity = Math.min(p.currentOpacity + 0.05 * dt, p.opacity);
        } else if (p.currentY < 10) {
          p.currentOpacity = Math.max(0, p.currentOpacity - 0.02 * dt);
        }

        // Remove if off screen
        if (p.currentY < -10 || p.currentOpacity <= 0) {
          toRemove.push(i);
          continue;
        }

        const screenX = (p.x / 100) * canvas.width + wobbleX;
        const screenY = (p.currentY / 100) * canvas.height;

        drawHeart(
          ctx,
          screenX,
          screenY,
          p.size,
          p.color,
          p.currentOpacity,
          p.rotation + Math.sin(p.wobblePhase) * 10,
          p.size > 20
        );

        // Draw sparkle for larger hearts
        if (p.size > 25) {
          const sparkleOpacity = p.currentOpacity * 0.5 * (0.5 + 0.5 * Math.sin(p.wobblePhase * 3));
          ctx.save();
          ctx.globalAlpha = sparkleOpacity;
          ctx.fillStyle = "#ffffff";
          const sx = screenX + (Math.random() - 0.5) * p.size;
          const sy = screenY + (Math.random() - 0.5) * p.size;
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Remove dead particles in reverse
      for (let i = toRemove.length - 1; i >= 0; i--) {
        particlesRef.current.splice(toRemove[i], 1);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 30 }}
    />
  );
}
