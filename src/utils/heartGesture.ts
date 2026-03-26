interface Landmark {
  x: number;
  y: number;
  z: number;
}

type LandmarkList = Landmark[];

// MediaPipe hand landmark indices
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;
const THUMB_MCP = 2;
const INDEX_MCP = 5;
const WRIST = 0;

interface Point {
  x: number;
  y: number;
  z: number;
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

function dist2D(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Detects a heart gesture formed by two hands.
 * The heart shape is formed when:
 * 1. Both thumbs touch each other (tips close together) — bottom of heart
 * 2. Both index fingers touch each other (tips close together) — top of heart
 * 3. The hands are oriented to form the heart shape
 */
export function detectHeartGesture(
  landmarks: LandmarkList[]
): { detected: boolean; confidence: number } {
  if (landmarks.length < 2) {
    return { detected: false, confidence: 0 };
  }

  const hand1 = landmarks[0];
  const hand2 = landmarks[1];

  // Get key landmarks
  const thumb1 = hand1[THUMB_TIP];
  const thumb2 = hand2[THUMB_TIP];
  const index1 = hand1[INDEX_TIP];
  const index2 = hand2[INDEX_TIP];
  const middle1 = hand1[MIDDLE_TIP];
  const middle2 = hand2[MIDDLE_TIP];
  const wrist1 = hand1[WRIST];
  const wrist2 = hand2[WRIST];

  // Palm size for normalization
  const palmSize1 = dist2D(hand1[WRIST], hand1[INDEX_MCP]);
  const palmSize2 = dist2D(hand2[WRIST], hand2[INDEX_MCP]);
  const avgPalm = (palmSize1 + palmSize2) / 2;

  if (avgPalm < 0.01) return { detected: false, confidence: 0 };

  // Check 1: Thumbs should be close together (bottom of heart)
  const thumbDist = dist2D(thumb1, thumb2);
  const thumbClose = thumbDist / avgPalm;

  // Check 2: Index fingers should be close together (top of heart) 
  // OR index+middle fingers curled to form top bumps
  const indexDist = dist2D(index1, index2);
  const indexClose = indexDist / avgPalm;

  // Check 3: Fingertips above thumbs (heart shape orientation)
  const fingersAboveThumb1 = index1.y < thumb1.y;
  const fingersAboveThumb2 = index2.y < thumb2.y;

  // Check 4: Hands should be relatively close together
  const wristDist = dist2D(wrist1, wrist2);
  const handsClose = wristDist / avgPalm;

  // Calculate confidence score
  let confidence = 0;

  // Thumb proximity (most important — forms the bottom point)
  if (thumbClose < 0.8) confidence += 0.35;
  else if (thumbClose < 1.2) confidence += 0.2;
  else if (thumbClose < 1.6) confidence += 0.1;

  // Index finger proximity (top of heart) or finger curl
  if (indexClose < 1.0) confidence += 0.25;
  else if (indexClose < 1.5) confidence += 0.15;
  else if (indexClose < 2.0) confidence += 0.05;

  // Fingers above thumbs (proper orientation)
  if (fingersAboveThumb1) confidence += 0.1;
  if (fingersAboveThumb2) confidence += 0.1;

  // Hands close together
  if (handsClose < 3.0) confidence += 0.1;
  if (handsClose < 2.0) confidence += 0.1;

  // Bonus: middle fingers also curving in
  const middleDist = dist2D(middle1, middle2);
  const middleClose = middleDist / avgPalm;
  if (middleClose < 1.5) confidence += 0.05;

  const detected = confidence >= 0.55;

  return { detected, confidence: Math.min(confidence, 1) };
}

/**
 * Smooths gesture detection to avoid flickering.
 * Requires the gesture to be detected for a number of consecutive frames.
 */
export class GestureSmoother {
  private buffer: boolean[] = [];
  private readonly bufferSize: number;
  private readonly threshold: number;

  constructor(bufferSize = 8, threshold = 0.6) {
    this.bufferSize = bufferSize;
    this.threshold = threshold;
  }

  update(detected: boolean): boolean {
    this.buffer.push(detected);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }

    const positiveCount = this.buffer.filter(Boolean).length;
    return positiveCount / this.buffer.length >= this.threshold;
  }

  reset(): void {
    this.buffer = [];
  }
}
