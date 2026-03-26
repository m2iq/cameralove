"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { detectHeartGesture, GestureSmoother, GestureResult } from "@/utils/heartGesture";
import { useAppStore, GestureType } from "@/lib/store";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface UseHandGestureOptions {
  enabled: boolean;
}

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

export function useHandGesture({ enabled }: UseHandGestureOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const smootherRef = useRef(new GestureSmoother(10, 0.5, 800));
  const wasDetectedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const setGesture = useAppStore((s) => s.setGesture);
  const triggerExplosion = useAppStore((s) => s.triggerExplosion);
  const lastTypeRef = useRef<GestureType>("none");

  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const video = videoRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw camera feed (mirrored)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length >= 1) {
      // Draw subtle landmarks
      for (const landmarks of results.multiHandLandmarks) {
        ctx.fillStyle = "rgba(251, 113, 133, 0.35)";
        for (const point of landmarks) {
          const x = canvas.width - point.x * canvas.width;
          const y = point.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      const result: GestureResult = detectHeartGesture(results.multiHandLandmarks);
      setGesture(result.detected, result.type, result.confidence);

      const smoothed = smootherRef.current.update(result.detected);

      if (smoothed && !wasDetectedRef.current) {
        wasDetectedRef.current = true;
        lastTypeRef.current = result.type;
        triggerExplosion();
      } else if (!smoothed && wasDetectedRef.current) {
        wasDetectedRef.current = false;
        lastTypeRef.current = "none";
        setGesture(false, "none", 0);
      }
    } else {
      setGesture(false, "none", 0);
      const smoothed = smootherRef.current.update(false);
      if (!smoothed && wasDetectedRef.current) {
        wasDetectedRef.current = false;
        lastTypeRef.current = "none";
      }
    }
  }, [setGesture, triggerExplosion]);

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
      if (!win.Hands || !win.Camera) {
        console.error("MediaPipe scripts failed to load");
        return;
      }

      const hands = new win.Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
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
    };
  }, [enabled, onResults]);

  return { videoRef, canvasRef, isLoading };
}
