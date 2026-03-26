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
  /** Normalized position of the heart center (0-1 range, mirrored for display) */
  heartX: number;
  heartY: number;
};

// MediaPipe landmark indices
const THUMB_TIP = 4;
const THUMB_IP = 3;
const THUMB_MCP = 2;
const INDEX_TIP = 8;
const INDEX_DIP = 7;
const INDEX_PIP = 6;
const INDEX_MCP = 5;
const MIDDLE_TIP = 12;
const MIDDLE_DIP = 11;
const MIDDLE_PIP = 10;
const RING_TIP = 16;
const RING_PIP = 14;
const PINKY_TIP = 20;
const PINKY_PIP = 18;
const WRIST = 0;

function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function angleBetween(a: Landmark, b: Landmark, c: Landmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const cross = ab.x * cb.y - ab.y * cb.x;
  return Math.abs(Math.atan2(cross, dot)) * (180 / Math.PI);
}

function midpoint(a: Landmark, b: Landmark): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Two-hand heart gesture with multi-condition scoring.
 */
function scoreTwoHandHeart(
  landmarks: LandmarkList[]
): { score: number; cx: number; cy: number } {
  if (landmarks.length < 2) return { score: 0, cx: 0.5, cy: 0.5 };

  const h1 = landmarks[0];
  const h2 = landmarks[1];

  const palm1 = dist(h1[WRIST], h1[INDEX_MCP]);
  const palm2 = dist(h2[WRIST], h2[INDEX_MCP]);
  const avgPalm = (palm1 + palm2) / 2;
  if (avgPalm < 0.01) return { score: 0, cx: 0.5, cy: 0.5 };

  // Heart center = midpoint between all 4 key tips
  const thumbMid = midpoint(h1[THUMB_TIP], h2[THUMB_TIP]);
  const indexMid = midpoint(h1[INDEX_TIP], h2[INDEX_TIP]);
  const cx = (thumbMid.x + indexMid.x) / 2;
  const cy = (thumbMid.y + indexMid.y) / 2;

  const thumbDist = dist(h1[THUMB_TIP], h2[THUMB_TIP]) / avgPalm;
  const indexDist = dist(h1[INDEX_TIP], h2[INDEX_TIP]) / avgPalm;
  const middleDist = dist(h1[MIDDLE_TIP], h2[MIDDLE_TIP]) / avgPalm;
  const wristDist = dist(h1[WRIST], h2[WRIST]) / avgPalm;

  let score = 0;

  // 1. Thumb proximity (bottom of heart) — 25%
  if (thumbDist < 0.5) score += 0.25;
  else if (thumbDist < 0.8) score += 0.20;
  else if (thumbDist < 1.2) score += 0.10;

  // 2. Index finger proximity (top of heart) — 20%
  if (indexDist < 0.7) score += 0.20;
  else if (indexDist < 1.0) score += 0.12;
  else if (indexDist < 1.5) score += 0.05;

  // 3. Orientation: fingers above thumbs — 15%
  const fingersAbove1 = h1[INDEX_TIP].y < h1[THUMB_TIP].y;
  const fingersAbove2 = h2[INDEX_TIP].y < h2[THUMB_TIP].y;
  if (fingersAbove1 && fingersAbove2) score += 0.15;
  else if (fingersAbove1 || fingersAbove2) score += 0.05;

  // 4. Hand symmetry — 15%
  const wrist1X = h1[WRIST].x;
  const wrist2X = h2[WRIST].x;
  const handsOpposite = Math.abs(wrist1X - wrist2X) > 0.05;
  if (handsOpposite && wristDist < 3.0) score += 0.15;
  else if (wristDist < 2.5) score += 0.08;

  // 5. Middle finger proximity (shape continuity) — 10%
  if (middleDist < 1.2) score += 0.10;
  else if (middleDist < 2.0) score += 0.05;

  // 6. Finger bending — 10% (index should be somewhat extended, not fisted)
  const indexExt1 = dist(h1[INDEX_TIP], h1[WRIST]) / palm1;
  const indexExt2 = dist(h2[INDEX_TIP], h2[WRIST]) / palm2;
  if (indexExt1 > 1.0 && indexExt2 > 1.0) score += 0.10;
  else if (indexExt1 > 0.7 && indexExt2 > 0.7) score += 0.05;

  // 7. Shape: index center must be above thumb center — 5%
  if (indexMid.y < thumbMid.y) score += 0.05;

  return { score: Math.min(score, 1), cx, cy };
}

/**
 * Korean finger heart with angle check and scissors rejection.
 */
function scoreKoreanHeart(
  hand: LandmarkList
): { score: number; cx: number; cy: number } {
  const palmSize = dist(hand[WRIST], hand[INDEX_MCP]);
  if (palmSize < 0.01) return { score: 0, cx: 0.5, cy: 0.5 };

  const tipDist = dist(hand[THUMB_TIP], hand[INDEX_TIP]) / palmSize;
  const center = midpoint(hand[THUMB_TIP], hand[INDEX_TIP]);

  // Early reject if tips too far apart
  if (tipDist > 0.55) return { score: 0, cx: center.x, cy: center.y };

  // Scissors rejection: if both index AND middle are extended, reject
  const middleExtended = hand[MIDDLE_TIP].y < hand[MIDDLE_PIP].y;
  const middleFullExtended =
    dist(hand[MIDDLE_TIP], hand[WRIST]) / palmSize > 1.3;
  const indexExtended = dist(hand[INDEX_TIP], hand[WRIST]) / palmSize > 1.3;
  if (middleExtended && middleFullExtended && indexExtended) {
    return { score: 0, cx: center.x, cy: center.y };
  }

  // Finger fold checks
  const middleFolded = hand[MIDDLE_TIP].y > hand[MIDDLE_PIP].y;
  const ringFolded = hand[RING_TIP].y > hand[RING_PIP].y;
  const pinkyFolded = hand[PINKY_TIP].y > hand[PINKY_PIP].y;
  const foldedCount = [middleFolded, ringFolded, pinkyFolded].filter(
    Boolean
  ).length;
  if (foldedCount < 2) return { score: 0, cx: center.x, cy: center.y };

  // Angle between thumb and index (at the base/MCP)
  const angle = angleBetween(hand[THUMB_TIP], hand[THUMB_MCP], hand[INDEX_TIP]);

  let score = 0;

  // 1. Tip proximity — 30%
  if (tipDist < 0.15) score += 0.30;
  else if (tipDist < 0.30) score += 0.22;
  else if (tipDist < 0.45) score += 0.12;

  // 2. Folded fingers — 25%
  if (foldedCount >= 3) score += 0.25;
  else score += 0.15;

  // 3. Angle between thumb-index (30-60° ideal) — 20%
  if (angle >= 25 && angle <= 70) score += 0.20;
  else if (angle >= 15 && angle <= 85) score += 0.10;

  // 4. Bridge distance (thumb IP to index DIP) — 10%
  const bridgeDist = dist(hand[THUMB_IP], hand[INDEX_DIP]) / palmSize;
  if (bridgeDist < 0.4) score += 0.10;
  else if (bridgeDist < 0.6) score += 0.05;

  // 5. Index curl — 10%
  const indexCurled = dist(hand[INDEX_TIP], hand[INDEX_PIP]) / palmSize < 0.5;
  if (indexCurled) score += 0.10;

  // 6. Middle finger away from index — 5%
  const midIndexDist =
    dist(hand[MIDDLE_DIP], hand[INDEX_DIP]) / palmSize;
  if (midIndexDist > 0.2) score += 0.05;

  return { score: Math.min(score, 1), cx: center.x, cy: center.y };
}

/**
 * Main detection: returns the best gesture with score >= 0.85.
 */
export function detectHeartGesture(landmarks: LandmarkList[]): GestureResult {
  const none: GestureResult = {
    detected: false,
    type: "none",
    confidence: 0,
    heartX: 0.5,
    heartY: 0.5,
  };

  if (landmarks.length >= 2) {
    const twoHand = scoreTwoHandHeart(landmarks);
    if (twoHand.score >= 0.85) {
      return {
        detected: true,
        type: "heart",
        confidence: twoHand.score,
        heartX: twoHand.cx,
        heartY: twoHand.cy,
      };
    }
    // Even if not detected, keep partial score for UI feedback
    if (twoHand.score > none.confidence) {
      none.confidence = twoHand.score;
      none.heartX = twoHand.cx;
      none.heartY = twoHand.cy;
    }
  }

  for (const hand of landmarks) {
    const korean = scoreKoreanHeart(hand);
    if (korean.score >= 0.85) {
      return {
        detected: true,
        type: "korean-heart",
        confidence: korean.score,
        heartX: korean.cx,
        heartY: korean.cy,
      };
    }
    if (korean.score > none.confidence) {
      none.confidence = korean.score;
      none.heartX = korean.cx;
      none.heartY = korean.cy;
    }
  }

  return none;
}

/**
 * Frame-based stability smoother.
 * Requires `requiredFrames` consecutive positive detections.
 */
export class GestureSmoother {
  private consecutiveFrames = 0;
  private readonly requiredFrames: number;

  constructor(requiredFrames = 12) {
    this.requiredFrames = requiredFrames;
  }

  update(detected: boolean): boolean {
    if (detected) {
      this.consecutiveFrames++;
    } else {
      this.consecutiveFrames = 0;
    }
    return this.consecutiveFrames >= this.requiredFrames;
  }

  reset(): void {
    this.consecutiveFrames = 0;
  }
}
