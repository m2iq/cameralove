export interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  color: string;
  speed: number;
  wobble: number;
  delay: number;
}

const HEART_COLORS = [
  "#e11d48",
  "#f43f5e",
  "#fb7185",
  "#fda4af",
  "#fecdd3",
  "#f9a8d4",
  "#f472b6",
  "#ec4899",
  "#c084fc",
  "#a855f7",
  "#d946ef",
  "#ff6b9d",
  "#ff85a1",
  "#ff99ac",
];

let nextId = 0;

export function createHeartParticle(overrides?: Partial<HeartParticle>): HeartParticle {
  return {
    id: nextId++,
    x: Math.random() * 100,
    y: 100 + Math.random() * 20,
    size: 12 + Math.random() * 36,
    opacity: 0.6 + Math.random() * 0.4,
    rotation: -30 + Math.random() * 60,
    color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    speed: 0.6 + Math.random() * 1.2,
    wobble: Math.random() * Math.PI * 2,
    delay: Math.random() * 0.5,
    ...overrides,
  };
}

export function createHeartBurst(count: number): HeartParticle[] {
  return Array.from({ length: count }, () => createHeartParticle());
}

export function createSparkle(): HeartParticle {
  return createHeartParticle({
    size: 4 + Math.random() * 8,
    opacity: 0.3 + Math.random() * 0.5,
    speed: 0.3 + Math.random() * 0.6,
  });
}
