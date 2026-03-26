"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  detectHeartGesture,
  GestureSmoother,
  GestureResult,
} from "@/utils/heartGesture";
import { useAppStore } from "@/lib/store";

/* eslint-disable @typescript-eslint/no-explicit-any */

const COOLDOWN_MS = 2500;
const MAX_WRIST_VELOCITY = 0.06;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function useHandGesture({ enabled }: { enabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const smootherRef = useRef(new GestureSmoother(12, 0.6, 1000));
  const wasDetectedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const setGesture = useAppStore((s) => s.setGesture);
  const triggerExplosion = useAppStore((s) => s.triggerExplosion);
  const setCooldown = useAppStore((s) => s.setCooldown);

  const cooldownRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevWristsRef = useRef<Array<{ x: number; y: number }>>([]);

  const startCooldown = useCallback(() => {
    cooldownRef.current = true;
    setCooldown(true);
    clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => {
      cooldownRef.current = false;
      setCooldown(false);
      smootherRef.current.reset();
    }, COOLDOWN_MS);
  }, [setCooldown]);

  const onResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const video = videoRef.current;
      if (!video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw mirrored camera feed
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const hands = results.multiHandLandmarks;
      const handedness = results.multiHandedness;

      if (hands && hands.length >= 1) {
        // Filter by MediaPipe per-hand detection score
        const validHands: any[] = [];
        for (let i = 0; i < hands.length; i++) {
          const score = handedness?.[i]?.score ?? 0;
          if (score >= 0.85) {
            validHands.push(hands[i]);
          }
        }

        // Draw landmarks
        for (const landmarks of validHands) {
          ctx.fillStyle = "rgba(251, 113, 133, 0.3)";
          for (const point of landmarks) {
            const px = canvas.width - point.x * canvas.width;
            const py = point.y * canvas.height;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (validHands.length === 0 || cooldownRef.current) {
          setGesture(false, "none", 0);
          smootherRef.current.update(false);
          if (!cooldownRef.current && wasDetectedRef.current) {
            wasDetectedRef.current = false;
          }
          prevWristsRef.current = [];
          return;
        }

        // Movement filtering: reject if hands move too fast
        const currentWrists = validHands.map((h: any) => ({
          x: h[0].x,
          y: h[0].y,
        }));
        let tooFast = false;
        if (prevWristsRef.current.length > 0) {
          for (const curr of currentWrists) {
            let nearest = Infinity;
            for (const prev of prevWristsRef.current) {
              const d = Math.sqrt(
                (curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2
              );
              nearest = Math.min(nearest, d);
            }
            if (nearest > MAX_WRIST_VELOCITY) {
              tooFast = true;
              break;
            }
          }
        }
        prevWristsRef.current = currentWrists;

        if (tooFast) {
          smootherRef.current.update(false);
          return;
        }

        // Detect gesture
        const result: GestureResult = detectHeartGesture(validHands);
        setGesture(result.detected, result.type, result.confidence);

        const smoothed = smootherRef.current.update(result.detected);

        if (smoothed && !wasDetectedRef.current) {
          wasDetectedRef.current = true;
          triggerExplosion();
          startCooldown();
        } else if (
          !smoothed &&
          wasDetectedRef.current &&
          !cooldownRef.current
        ) {
          wasDetectedRef.current = false;
          setGesture(false, "none", 0);
        }
      } else {
        setGesture(false, "none", 0);
        smootherRef.current.update(false);
        if (wasDetectedRef.current && !cooldownRef.current) {
          wasDetectedRef.current = false;
        }
        prevWristsRef.current = [];
      }
    },
    [setGesture, triggerExplosion, startCooldown]
  );

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const init = async () => {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      );

      const win = window as any;
      if (!win.Hands || !win.Camera) return;

      const hands = new win.Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.7,
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new win.Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        if (mounted) setIsLoading(false);
      }
    };

    init().catch(console.error);

    return () => {
      mounted = false;
      cameraRef.current?.stop();
      handsRef.current?.close();
      smootherRef.current.reset();
      wasDetectedRef.current = false;
      clearTimeout(cooldownTimerRef.current);
    };
  }, [enabled, onResults]);

  return { videoRef, canvasRef, isLoading };
}
