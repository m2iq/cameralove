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

// MediaPipe hand landmark indices
const THUMB_TIP = 4;
const THUMB_IP = 3;
const THUMB_MCP = 2;
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

function dist2D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Detect a normal heart gesture formed by two hands.
 * Thumbs touch at the bottom, index fingers touch at the top.
 */
function detectTwoHandHeart(landmarks: LandmarkList[]): { detected: boolean; confidence: number } {
  if (landmarks.length < 2) return { detected: false, confidence: 0 };

  const hand1 = landmarks[0];
  const hand2 = landmarks[1];

  const thumb1 = hand1[THUMB_TIP];
  const thumb2 = hand2[THUMB_TIP];
  const index1 = hand1[INDEX_TIP];
  const index2 = hand2[INDEX_TIP];
  const middle1 = hand1[MIDDLE_TIP];
  const middle2 = hand2[MIDDLE_TIP];

  const palmSize1 = dist2D(hand1[WRIST], hand1[INDEX_MCP]);
  const palmSize2 = dist2D(hand2[WRIST], hand2[INDEX_MCP]);
  const avgPalm = (palmSize1 + palmSize2) / 2;

  if (avgPalm < 0.01) return { detected: false, confidence: 0 };

  const thumbClose = dist2D(thumb1, thumb2) / avgPalm;
  const indexClose = dist2D(index1, index2) / avgPalm;
  const middleClose = dist2D(middle1, middle2) / avgPalm;

  const fingersAbove1 = index1.y < thumb1.y;
  const fingersAbove2 = index2.y < thumb2.y;

  const wristDist = dist2D(hand1[WRIST], hand2[WRIST]) / avgPalm;

  let confidence = 0;

  // Thumb proximity — bottom of heart
  if (thumbClose < 0.8) confidence += 0.35;
  else if (thumbClose < 1.2) confidence += 0.2;
  else if (thumbClose < 1.6) confidence += 0.1;

  // Index finger proximity — top of heart
  if (indexClose < 1.0) confidence += 0.25;
  else if (indexClose < 1.5) confidence += 0.15;
  else if (indexClose < 2.0) confidence += 0.05;

  // Orientation
  if (fingersAbove1) confidence += 0.1;
  if (fingersAbove2) confidence += 0.1;

  // Hands close
  if (wristDist < 3.0) confidence += 0.1;
  if (wristDist < 2.0) confidence += 0.05;

  // Middle fingers
  if (middleClose < 1.5) confidence += 0.05;

  return { detected: confidence >= 0.55, confidence: Math.min(confidence, 1) };
}

/**
 * Detect Korean finger heart — thumb tip + index tip touching,
 * other fingers curled/folded on a single hand.
 */
function detectKoreanHeart(hand: LandmarkList): { detected: boolean; confidence: number } {
  const palmSize = dist2D(hand[WRIST], hand[INDEX_MCP]);
  if (palmSize < 0.01) return { detected: false, confidence: 0 };

  // Thumb tip to index tip distance
  const tipDist = dist2D(hand[THUMB_TIP], hand[INDEX_TIP]) / palmSize;

  // Check other fingers are folded (tip below pip)
  const middleFolded = hand[MIDDLE_TIP].y > hand[MIDDLE_PIP].y;
  const ringFolded = hand[RING_TIP].y > hand[RING_PIP].y;
  const pinkyFolded = hand[PINKY_TIP].y > hand[PINKY_PIP].y;

  // Thumb and index should not be fully extended — slight curl
  const indexCurled = dist2D(hand[INDEX_TIP], hand[INDEX_PIP]) / palmSize < 0.6;

  let confidence = 0;

  // Tips touching or very close
  if (tipDist < 0.3) confidence += 0.4;
  else if (tipDist < 0.5) confidence += 0.25;
  else if (tipDist < 0.7) confidence += 0.1;

  // Other fingers folded
  if (middleFolded) confidence += 0.15;
  if (ringFolded) confidence += 0.1;
  if (pinkyFolded) confidence += 0.1;

  // Thumb and index form a small gap/circle
  if (indexCurled) confidence += 0.1;

  // Thumb IP to index DIP should be close
  const bridgeDist = dist2D(hand[THUMB_IP], hand[INDEX_DIP]) / palmSize;
  if (bridgeDist < 0.5) confidence += 0.1;

  return { detected: confidence >= 0.55, confidence: Math.min(confidence, 1) };
}

/**
 * Detect both gesture types. Returns the best match.
 */
export function detectHeartGesture(landmarks: LandmarkList[]): GestureResult {
  // Check two-hand heart first
  if (landmarks.length >= 2) {
    const twoHand = detectTwoHandHeart(landmarks);
    if (twoHand.detected) {
      return { detected: true, type: "heart", confidence: twoHand.confidence };
    }
  }

  // Check Korean heart on each hand
  for (const hand of landmarks) {
    const korean = detectKoreanHeart(hand);
    if (korean.detected) {
      return { detected: true, type: "korean-heart", confidence: korean.confidence };
    }
  }

  // Return best confidence even if not detected
  let bestConf = 0;
  if (landmarks.length >= 2) {
    bestConf = Math.max(bestConf, detectTwoHandHeart(landmarks).confidence);
  }
  for (const hand of landmarks) {
    bestConf = Math.max(bestConf, detectKoreanHeart(hand).confidence);
  }

  return { detected: false, type: "none", confidence: bestConf };
}

/**
 * Gesture smoother that requires sustained detection for stability.
 * Now supports configurable hold time (in frames).
 */
export class GestureSmoother {
  private buffer: boolean[] = [];
  private readonly bufferSize: number;
  private readonly threshold: number;
  private holdFrames = 0;
  private readonly requiredHoldFrames: number;

  /** @param holdTimeMs how long gesture must be held (at ~30fps) */
  constructor(bufferSize = 10, threshold = 0.5, holdTimeMs = 800) {
    this.bufferSize = bufferSize;
    this.threshold = threshold;
    // At roughly 30fps from MediaPipe
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
      this.holdFrames = 0;
    }

    return this.holdFrames >= this.requiredHoldFrames;
  }

  reset(): void {
    this.buffer = [];
    this.holdFrames = 0;
  }
}
