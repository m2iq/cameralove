import { create } from "zustand";

export type GestureType = "none" | "heart" | "korean-heart";

interface AppState {
  // Screen
  screen: "landing" | "camera";
  setScreen: (screen: "landing" | "camera") => void;

  // Gesture
  gestureDetected: boolean;
  gestureType: GestureType;
  confidence: number;
  setGesture: (detected: boolean, type: GestureType, confidence: number) => void;

  // Effects
  explosionTrigger: number;
  triggerExplosion: () => void;

  // Photo capture
  photoCaptureEnabled: boolean;
  togglePhotoCapture: () => void;
  capturedPhoto: string | null;
  setCapturedPhoto: (photo: string | null) => void;

  // Audio
  musicEnabled: boolean;
  toggleMusic: () => void;

  // Reset
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

  photoCaptureEnabled: false,
  togglePhotoCapture: () =>
    set((state) => ({ photoCaptureEnabled: !state.photoCaptureEnabled })),
  capturedPhoto: null,
  setCapturedPhoto: (photo) => set({ capturedPhoto: photo }),

  musicEnabled: false,
  toggleMusic: () =>
    set((state) => ({ musicEnabled: !state.musicEnabled })),

  reset: () =>
    set({
      screen: "landing",
      gestureDetected: false,
      gestureType: "none",
      confidence: 0,
      capturedPhoto: null,
    }),
}));
