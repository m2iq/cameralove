import { create } from "zustand";

export type GestureType = "none" | "heart" | "korean-heart";

interface AppState {
  screen: "landing" | "camera";
  setScreen: (screen: "landing" | "camera") => void;

  gestureDetected: boolean;
  gestureType: GestureType;
  confidence: number;
  setGesture: (detected: boolean, type: GestureType, confidence: number) => void;

  explosionTrigger: number;
  triggerExplosion: () => void;

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
  setGesture: (detected, type, confidence) =>
    set({ gestureDetected: detected, gestureType: type, confidence }),

  explosionTrigger: 0,
  triggerExplosion: () =>
    set((state) => ({ explosionTrigger: state.explosionTrigger + 1 })),

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
    }),
}));
