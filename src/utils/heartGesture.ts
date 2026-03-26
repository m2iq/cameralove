interface Landmark {
  x: number;
  y: number;
  z: number;
}

type LandmarkList = Landmark[];

export type GestureResult = {
  detected: boolean;
  type: "none" | "heart" | "korean-heart";
  confidence: number;
};

const THUMB_TIP = 4;
const INDEX_TIP = 8;
const INDEX_DIP = 7;
const INDEX_PIP = 6;
const INDEX_MCP = 5;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
const RING_TIP = 16;
const RING_PIP = 14;
const PINKY_TIP = 20;
const PINKY_PIP = 18;
const WRIST = 0;
const THUMB_IP = 3;

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Two-hand heart: thumbs touch at bottom, index fingers touch at top.
 * Stricter thresholds to prevent false positives.
 */
function detectTwoHandHeart(
  landmarks: LandmarkList[]
): { detected: boolean; confidence: number } {
  if (landmarks.length < 2) return { detected: false, confidence: 0 };

  const hand1 = landmarks[0];
  const hand2 = landmarks[1];

  const palmSize1 = dist(hand1[WRIST], hand1[INDEX_MCP]);
  const palmSize2 = dist(hand2[WRIST], hand2[INDEX_MCP]);
  const avgPalm = (palmSize1 + palmSize2) / 2;
  if (avgPalm < 0.01) return { detected: false, confidence: 0 };

  const thumbDist = dist(hand1[THUMB_TIP], hand2[THUMB_TIP]) / avgPalm;
  const indexDist = dist(hand1[INDEX_TIP], hand2[INDEX_TIP]) / avgPalm;
  const middleDist = dist(hand1[MIDDLE_TIP], hand2[MIDDLE_TIP]) / avgPalm;

  const fingersAbove1 = hand1[INDEX_TIP].y < hand1[THUMB_TIP].y;
  const fingersAbove2 = hand2[INDEX_TIP].y < hand2[THUMB_TIP].y;

  const wristDist = dist(hand1[WRIST], hand2[WRIST]) / avgPalm;

  let confidence = 0;

  // Thumbs must be close (bottom of heart)
  if (thumbDist < 0.6) confidence += 0.30;
  else if (thumbDist < 1.0) confidence += 0.15;
  else return { detected: false, confidence };

  // Index fingers must be close (top of heart)
  if (indexDist < 0.8) confidence += 0.25;
  else if (indexDist < 1.2) confidence += 0.10;

  // Orientation: fingers above thumbs
  if (fingersAbove1 && fingersAbove2) confidence += 0.15;
  else if (fingersAbove1 || fingersAbove2) confidence += 0.05;

  // Hands close together
  if (wristDist < 2.5) confidence += 0.10;

  // Middle fingers somewhat close (shape symmetry)
  if (middleDist < 1.5) confidence += 0.10;

  // Shape symmetry: index center above thumb center
  const indexCenterY = (hand1[INDEX_TIP].y + hand2[INDEX_TIP].y) / 2;
  const thumbCenterY = (hand1[THUMB_TIP].y + hand2[THUMB_TIP].y) / 2;
  if (indexCenterY < thumbCenterY) confidence += 0.10;

  return { detected: confidence >= 0.70, confidence: Math.min(confidence, 1) };
}

/**
 * Korean finger heart: thumb tip + index tip touching, other fingers folded.
 * Early rejects if tips aren't close enough.
 */
function detectKoreanHeart(
  hand: LandmarkList
): { detected: boolean; confidence: number } {
  const palmSize = dist(hand[WRIST], hand[INDEX_MCP]);
  if (palmSize < 0.01) return { detected: false, confidence: 0 };

  const tipDist = dist(hand[THUMB_TIP], hand[INDEX_TIP]) / palmSize;

  // Tips must be very close — primary requirement
  if (tipDist > 0.5) return { detected: false, confidence: 0 };

  const middleFolded = hand[MIDDLE_TIP].y > hand[MIDDLE_PIP].y;
  const ringFolded = hand[RING_TIP].y > hand[RING_PIP].y;
  const pinkyFolded = hand[PINKY_TIP].y > hand[PINKY_PIP].y;
  const foldedCount = [middleFolded, ringFolded, pinkyFolded].filter(Boolean).length;

  // At least 2 fingers must be folded
  if (foldedCount < 2) return { detected: false, confidence: 0 };

  const indexCurled = dist(hand[INDEX_TIP], hand[INDEX_PIP]) / palmSize < 0.5;
  const bridgeDist = dist(hand[THUMB_IP], hand[INDEX_DIP]) / palmSize;

  let confidence = 0;

  if (tipDist < 0.2) confidence += 0.35;
  else if (tipDist < 0.35) confidence += 0.25;
  else confidence += 0.10;

  if (foldedCount >= 3) confidence += 0.25;
  else confidence += 0.15;

  if (indexCurled) confidence += 0.10;
  if (bridgeDist < 0.4) confidence += 0.10;

  return { detected: confidence >= 0.70, confidence: Math.min(confidence, 1) };
}

/**
 * Detect both gesture types, returning the first match.
 */
export function detectHeartGesture(landmarks: LandmarkList[]): GestureResult {
  if (landmarks.length >= 2) {
    const twoHand = detectTwoHandHeart(landmarks);
    if (twoHand.detected) {
      return { detected: true, type: "heart", confidence: twoHand.confidence };
    }
  }

  for (const hand of landmarks) {
    const korean = detectKoreanHeart(hand);
    if (korean.detected) {
      return {
        detected: true,
        type: "korean-heart",
        confidence: korean.confidence,
      };
    }
  }

  return { detected: false, type: "none", confidence: 0 };
}

/**
 * Gesture smoother requiring sustained detection over time.
 * bufferSize=12, threshold=0.6, holdTimeMs=1000 by default.
 */
export class GestureSmoother {
  private buffer: boolean[] = [];
  private readonly bufferSize: number;
  private readonly threshold: number;
  private holdFrames = 0;
  private readonly requiredHoldFrames: number;

  constructor(bufferSize = 12, threshold = 0.6, holdTimeMs = 1000) {
    this.bufferSize = bufferSize;
    this.threshold = threshold;
    this.requiredHoldFrames = Math.round((holdTimeMs / 1000) * 30);
  }

  update(detected: boolean): boolean {
    this.buffer.push(detected);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }

    const ratio = this.buffer.filter(Boolean).length / this.buffer.length;
    const passing = ratio >= this.threshold;

    if (passing) {
      this.holdFrames++;
    } else {
      this.holdFrames = Math.max(0, this.holdFrames - 2);
    }

    return this.holdFrames >= this.requiredHoldFrames;
  }

  reset(): void {
    this.buffer = [];
    this.holdFrames = 0;
  }
}
