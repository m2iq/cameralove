import { create } from "zustand";

export type GestureType = "none" | "heart" | "korean-heart";

interface AppState {
  screen: "landing" | "camera";
  setScreen: (screen: "landing" | "camera") => void;

  gestureDetected: boolean;
  gestureType: GestureType;
  confidence: number;
  /** Normalized heart position (0-1, in mirrored canvas space) */
  heartX: number;
  heartY: number;
  setGesture: (
    detected: boolean,
    type: GestureType,
    confidence: number,
    hx: number,
    hy: number
  ) => void;

  explosionTrigger: number;
  /** Screen-pixel position of the explosion origin */
  explosionX: number;
  explosionY: number;
  triggerExplosion: (x: number, y: number) => void;

  cooldownActive: boolean;
  setCooldown: (active: boolean) => void;

  photoCaptureEnabled: boolean;
  togglePhotoCapture: () => void;
  capturedPhoto: string | null;
  setCapturedPhoto: (photo: string | null) => void;

  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "landing",
  setScreen: (screen) => set({ screen }),

  gestureDetected: false,
  gestureType: "none",
  confidence: 0,
  heartX: 0.5,
  heartY: 0.5,
  setGesture: (detected, type, confidence, hx, hy) =>
    set({ gestureDetected: detected, gestureType: type, confidence, heartX: hx, heartY: hy }),

  explosionTrigger: 0,
  explosionX: 0,
  explosionY: 0,
  triggerExplosion: (x, y) =>
    set((state) => ({
      explosionTrigger: state.explosionTrigger + 1,
      explosionX: x,
      explosionY: y,
    })),

  cooldownActive: false,
  setCooldown: (active) => set({ cooldownActive: active }),

  photoCaptureEnabled: false,
  togglePhotoCapture: () =>
    set((state) => ({ photoCaptureEnabled: !state.photoCaptureEnabled })),
  capturedPhoto: null,
  setCapturedPhoto: (photo) => set({ capturedPhoto: photo }),

  reset: () =>
    set({
      screen: "landing",
      gestureDetected: false,
      gestureType: "none",
      confidence: 0,
      capturedPhoto: null,
      cooldownActive: false,
      heartX: 0.5,
      heartY: 0.5,
    }),
}));
