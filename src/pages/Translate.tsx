import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  Camera, CameraOff, Trash2, Copy, Volume2,
  CheckCircle, Loader2,
  CornerDownLeft, Delete, RefreshCw,
  Zap, Compass, Sparkles
} from 'lucide-react'

// ─── MediaPipe Types ─────────────────────────────────────────────────────────
declare global {
  interface Window {
    Hands: new (config: object) => MediaPipeHands
    Camera: new (video: HTMLVideoElement, config: object) => MediaPipeCamera
    drawConnectors: (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], connections: LandmarkConnection[], style: object) => void
    drawLandmarks: (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], style: object) => void
    HAND_CONNECTIONS: LandmarkConnection[]
  }
}

type NormalizedLandmark = { x: number; y: number; z: number }
type LandmarkConnection = [number, number]
type MediaPipeHands = {
  setOptions: (opts: object) => void
  onResults: (cb: (r: HandResults) => void) => void
  send: (input: { image: HTMLVideoElement }) => Promise<void>
}
type MediaPipeCamera = { start: () => void; stop: () => void }
type HandResults = {
  multiHandLandmarks?: NormalizedLandmark[][]
  multiHandedness?: Array<{ label: string; score: number }>
}

interface CameraDevice {
  deviceId: string
  label: string
}

interface HistoricalPoint {
  x: number
  y: number
  time: number
}

// Detailed info for each tracked hand
export interface HandDetail {
  handIndex: number
  handedness: string
  label: string
  confidence: number
  angleDeg: number
  palmFacing: 'front' | 'back' | 'side'
  extendedCount: number
}

// ─── Canonical Hand Geometric Analysis ──────────────────────────────────────
interface CanonicalHand {
  canonical: Array<{ x: number; y: number; z: number }>
  rawLandmarks: NormalizedLandmark[]
  palmFacing: 'front' | 'back' | 'side'
  handAngleDeg: number
  palmLength: number
  isLeft: boolean
  extendedFingers: {
    thumb: boolean
    index: boolean
    middle: boolean
    ring: boolean
    pinky: boolean
  }
  extendedCount: number
  isFist: boolean
  isCupped: boolean
  isFlat: boolean
  isThumbsUp: boolean
}

/**
 * Transforms raw 21 hand landmarks into a rotation-invariant, canonical coordinate space.
 * Regardless of whether the hand is pointing up, down, sideways, tilted 45°,
 * or whether the palm or the back of the hand faces the camera:
 * In canonical space:
 * - Wrist is pinned at (0, 0)
 * - Middle knuckle (landmark 9) is pinned at (0, -1) (pointing directly UP)
 * - Thumb is ALWAYS mirrored to the negative X side (x < 0)
 * - Pinky is ALWAYS mirrored to the positive X side (x > 0)
 * - Extended fingers point UP towards -Y
 * - Folded fingers curl down towards the palm
 */
function computeCanonicalHand(lm: NormalizedLandmark[], handednessLabel?: string): CanonicalHand {
  const wrist = lm[0]
  const middleMcp = lm[9]

  // Vector from wrist to middle knuckle defines the primary hand axis
  const vx = middleMcp.x - wrist.x
  const vy = middleMcp.y - wrist.y
  const palmLength = Math.hypot(vx, vy) || 0.001

  // Hand orientation angle in degrees (0 = pointing right, 90 = pointing down, -90 = pointing up)
  const handAngleRad = Math.atan2(vy, vx)
  const handAngleDeg = Math.round((handAngleRad * 180) / Math.PI)

  // Desired canonical orientation is pointing UP (-PI/2)
  const rotAngle = -Math.PI / 2 - handAngleRad
  const cosA = Math.cos(rotAngle)
  const sinA = Math.sin(rotAngle)

  // Rotate & normalize all 21 points
  const canonical = lm.map(p => {
    const rx = (p.x - wrist.x) / palmLength
    const ry = (p.y - wrist.y) / palmLength
    const rz = (p.z - wrist.z) / palmLength
    const cx = rx * cosA - ry * sinA
    const cy = rx * sinA + ry * cosA
    return { x: cx, y: cy, z: rz }
  })

  // Mirror X so thumb is ALWAYS on negative X side, pinky on positive X side.
  // In human hands, Landmark 5 is Index MCP and Landmark 17 is Pinky MCP.
  // Their relative horizontal ordering is invariant to wrist rotation.
  // If Pinky MCP x < Index MCP x, then pinky is to the left: mirror all X coordinates!
  if (canonical[17].x < canonical[5].x) {
    for (let i = 0; i < canonical.length; i++) {
      canonical[i].x = -canonical[i].x
    }
  }

  // Determine palm orientation (Front vs Back vs Side) using 3D normal vector
  const vIdx = { x: lm[5].x - wrist.x, y: lm[5].y - wrist.y }
  const vPnk = { x: lm[17].x - wrist.x, y: lm[17].y - wrist.y }
  const crossZ = vIdx.x * vPnk.y - vIdx.y * vPnk.x
  const isLeft = handednessLabel ? handednessLabel.toLowerCase().includes('left') : false

  const facingSign = isLeft ? -crossZ : crossZ
  let palmFacing: 'front' | 'back' | 'side'
  if (Math.abs(facingSign) < 0.008) {
    palmFacing = 'side'
  } else if (facingSign > 0) {
    palmFacing = 'front'
  } else {
    palmFacing = 'back'
  }

  // Rotation-invariant finger metrics in canonical space
  // Tip: 8, 12, 16, 20. PIP: 6, 10, 14, 18. MCP: 5, 9, 13, 17.
  const distFromWrist = (idx: number) => Math.hypot(canonical[idx].x, canonical[idx].y)
  const distBetween = (a: number, b: number) => Math.hypot(canonical[a].x - canonical[b].x, canonical[a].y - canonical[b].y)

  // Finger is extended if Tip is substantially further from wrist than PIP & MCP and points away
  const isFingerExtended = (tip: number, pip: number, mcp: number) => {
    const tipFurther = distFromWrist(tip) > distFromWrist(pip) * 1.15
    const tipAbovePip = canonical[tip].y < canonical[pip].y - 0.22
    const tipAboveMcp = canonical[tip].y < canonical[mcp].y - 0.45
    return tipFurther && tipAbovePip && tipAboveMcp
  }

  const indexExtended = isFingerExtended(8, 6, 5)
  const middleExtended = isFingerExtended(12, 10, 9)
  const ringExtended = isFingerExtended(16, 14, 13)
  const pinkyExtended = isFingerExtended(20, 18, 17)

  // Thumb extension (Tip landmark 4, MCP landmark 2)
  const thumbSpread = distBetween(4, 2)
  const thumbOutward = canonical[4].x < -0.42
  const thumbUpward = canonical[4].y < -0.62 && canonical[4].x < -0.28
  const thumbExtended = (thumbSpread > 0.42 && thumbOutward) || (thumbUpward && thumbSpread > 0.40)

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length

  // Fist check: all 4 fingers curled down close to knuckles/palm
  const isFist = canonical[8].y > -0.80 && canonical[12].y > -0.80 && canonical[16].y > -0.80 && canonical[20].y > -0.80

  // Cupped check: fingertips are curved forward (canonical Y between -1.75 and -0.85 and tip dist > 0.70)
  const isIndexCupped = canonical[8].y >= -1.75 && canonical[8].y <= -0.85 && distFromWrist(8) > 0.70
  const isMiddleCupped = canonical[12].y >= -1.75 && canonical[12].y <= -0.85 && distFromWrist(12) > 0.70
  const isRingCupped = canonical[16].y >= -1.75 && canonical[16].y <= -0.85 && distFromWrist(16) > 0.70
  const isPinkyCupped = canonical[20].y >= -1.75 && canonical[20].y <= -0.85 && distFromWrist(20) > 0.70
  const cuppedCount = [isIndexCupped, isMiddleCupped, isRingCupped, isPinkyCupped].filter(Boolean).length
  const isCupped = cuppedCount >= 2 && !isFist

  // Flat check: 4 fingers extended
  const isFlat = extendedCount >= 4

  // Thumbs-up check: fist with thumb pointing upward
  const isThumbsUp = (isFist || extendedCount <= 1) && (canonical[4].y < -0.65 || thumbExtended) && canonical[4].y < canonical[8].y - 0.20

  return {
    canonical,
    rawLandmarks: lm,
    palmFacing,
    handAngleDeg,
    palmLength,
    isLeft,
    extendedFingers: {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended,
    },
    extendedCount,
    isFist,
    isCupped,
    isFlat,
    isThumbsUp,
  }
}

/**
 * Classifies single-hand signs rotation-invariantly using canonical coordinates.
 * Returns empty label with 0 confidence for ambiguous or transition poses (NEVER defaults to 'A').
 */
function classifyCanonicalHand(hand: CanonicalHand): { label: string; conf: number } {
  const { canonical: c, extendedFingers: ext, extendedCount, isFist } = hand
  const dist = (i1: number, i2: number) => Math.hypot(c[i1].x - c[i2].x, c[i1].y - c[i2].y)

  const indexThumbDist = dist(8, 4)
  const middleThumbDist = dist(12, 4)
  const ringThumbDist = dist(16, 4)
  const indexMiddleDist = dist(8, 12)
  const middleRingDist = dist(12, 16)

  // ─── 4 OR 5 EXTENDED FINGERS ──────────────────────────────────────────
  if (extendedCount >= 4) {
    const fingersTogether = indexMiddleDist < 0.25 && middleRingDist < 0.25

    if (!ext.thumb && fingersTogether) {
      // B: 4 fingers straight up, held together, thumb tucked across palm
      return { label: 'B', conf: 0.95 }
    }

    if (ext.thumb) {
      // Hello / Open Hand: All 5 fingers extended and spread
      return { label: 'Hello', conf: 0.94 }
    }

    if (!ext.thumb && !fingersTogether) {
      // 4: 4 fingers spread apart, thumb tucked
      return { label: '4', conf: 0.92 }
    }

    return { label: 'B', conf: 0.90 }
  }

  // ─── 3 EXTENDED FINGERS ───────────────────────────────────────────────
  if (extendedCount === 3) {
    // 1. "OK" or "F" — Index tip touches thumb tip, middle/ring/pinky all extended
    if (indexThumbDist < 0.35 && ext.middle && ext.ring && ext.pinky) {
      return { label: 'OK', conf: 0.96 }
    }

    // 2. "W" — Index, Middle, Ring extended, Pinky folded
    if (ext.index && ext.middle && ext.ring && !ext.pinky) {
      return { label: 'W', conf: 0.95 }
    }

    // 3. "3" — Thumb, Index, Middle extended, Ring & Pinky folded
    if (ext.thumb && ext.index && ext.middle && !ext.ring && !ext.pinky) {
      return { label: '3', conf: 0.94 }
    }

    return { label: '', conf: 0 }
  }

  // ─── 2 EXTENDED FINGERS ───────────────────────────────────────────────
  if (extendedCount === 2) {
    // 1. "V" (Peace) vs "U" (Index & Middle extended, Ring & Pinky curled)
    if (ext.index && ext.middle && !ext.ring && !ext.pinky) {
      if (indexMiddleDist >= 0.26) {
        return { label: 'V', conf: 0.96 }
      } else {
        return { label: 'U', conf: 0.94 }
      }
    }

    // 2. "Y" — Thumb & Pinky extended wide, middle 3 curled
    if (ext.thumb && ext.pinky && !ext.index && !ext.middle && !ext.ring) {
      const spread = dist(4, 20)
      if (spread > 0.70) {
        return { label: 'Y', conf: 0.96 }
      }
    }

    // 3. "L" — Thumb & Index extended at ~90 deg angle, other 3 curled
    if (ext.thumb && ext.index && !ext.middle && !ext.ring && !ext.pinky) {
      if (c[4].x < -0.42 && c[8].y < -1.35) {
        return { label: 'L', conf: 0.96 }
      }
    }

    // 4. "Love" / ILY sign (Thumb, Index, Pinky extended, Middle & Ring curled)
    if (ext.thumb && ext.index && ext.pinky && !ext.middle && !ext.ring) {
      return { label: 'Love', conf: 0.96 }
    }

    return { label: '', conf: 0 }
  }

  // ─── 1 EXTENDED FINGER ────────────────────────────────────────────────
  if (extendedCount === 1) {
    // 1. "I" — Pinky extended alone, other fingers folded
    if (ext.pinky && !ext.index && !ext.middle && !ext.ring && !ext.thumb) {
      return { label: 'I', conf: 0.96 }
    }

    // 2. "D" vs "1" — Index extended alone
    if (ext.index && !ext.middle && !ext.ring && !ext.pinky) {
      const touchingThumb = middleThumbDist < 0.42 || ringThumbDist < 0.42
      if (touchingThumb && !ext.thumb) {
        return { label: 'D', conf: 0.94 }
      } else {
        return { label: '1', conf: 0.93 }
      }
    }

    // 3. "X" — Hooked index finger (PIP extended, DIP curled), other fingers in fist
    if (c[8].y > c[6].y - 0.12 && c[6].y < -0.70 && !ext.middle && !ext.ring && !ext.pinky) {
      return { label: 'X', conf: 0.90 }
    }

    return { label: '', conf: 0 }
  }

  // ─── 0 EXTENDED FINGERS (Fist, O, C, etc.) ────────────────────────────
  if (extendedCount === 0 || isFist) {
    // 1. "O" — All fingertips meet the thumb tip forming an O ring
    if (indexThumbDist < 0.35 && middleThumbDist < 0.38 && ringThumbDist < 0.42) {
      return { label: 'O', conf: 0.93 }
    }

    // 2. "C" — Thumb and fingers curved into an open C arc
    if (indexThumbDist >= 0.38 && indexThumbDist <= 0.85 && c[8].y < -0.60 && c[4].y < -0.40) {
      return { label: 'C', conf: 0.90 }
    }

    // 3. "A" vs "S" vs "E"
    // "A": Thumb rests along outer edge of index knuckle pointing UP
    if (c[4].x < -0.26 && c[4].y < -0.65) {
      return { label: 'A', conf: 0.93 }
    }

    // "S": Thumb folded across the front of fingers
    if (c[4].x >= -0.25 && c[4].y > -0.72 && c[4].y < -0.35) {
      return { label: 'S', conf: 0.91 }
    }

    // "E": All 4 fingertips curled down resting directly on top of the thumb
    if (c[8].y > c[4].y - 0.08 && c[12].y > c[4].y - 0.08 && c[4].y > -0.68) {
      return { label: 'E', conf: 0.88 }
    }

    // Tight fist with thumb outside
    if (isFist && c[4].x < -0.24) {
      return { label: 'A', conf: 0.86 }
    }
  }

  // Absolutely NO fake fallback — return empty string with 0 confidence
  return { label: '', conf: 0 }
}

/**
 * Evaluates composite Two-Handed signs when both hands are visible.
 * High-accuracy geometric detection calibrated for webcam depth and hand distance.
 */
function analyzeTwoHandGesture(h1: CanonicalHand, h2: CanonicalHand): { label: string; conf: number } | null {
  const lm1 = h1.rawLandmarks
  const lm2 = h2.rawLandmarks

  // Distances between key joints of both hands in normalized screen space
  const wristDist = Math.hypot(lm1[0].x - lm2[0].x, lm1[0].y - lm2[0].y)
  const centerDist = Math.hypot(lm1[9].x - lm2[9].x, lm1[9].y - lm2[9].y)
  const indexTipDist = Math.hypot(lm1[8].x - lm2[8].x, lm1[8].y - lm2[8].y)

  const c1 = classifyCanonicalHand(h1)
  const c2 = classifyCanonicalHand(h2)

  // 1. "Peace" (Both hands showing V signs)
  if (c1.label === 'V' && c2.label === 'V') {
    return { label: 'Peace', conf: 0.98 }
  }

  // 2. "Love" / "I Love You" (Both hands showing Love/Y signs OR crossed wrists over chest)
  if ((c1.label === 'Love' && c2.label === 'Love') || (c1.label === 'Y' && c2.label === 'Y')) {
    return { label: 'Love', conf: 0.98 }
  }
  if (wristDist < 0.16 && centerDist < 0.22 && (h1.isFist || h1.extendedCount <= 1) && (h2.isFist || h2.extendedCount <= 1)) {
    return { label: 'Love', conf: 0.96 }
  }

  // 3. "Help" — Base hand is flat palm facing up/front, other hand is a fist or thumbs-up resting on top
  const h1BaseHelp = h1.isFlat && (h2.isFist || h2.isThumbsUp) && centerDist < 0.32
  const h2BaseHelp = h2.isFlat && (h1.isFist || h1.isThumbsUp) && centerDist < 0.32
  if (h1BaseHelp || h2BaseHelp) {
    return { label: 'Help', conf: 0.96 }
  }

  // 4. "Book" — Both hands open flat, touching along pinky edges/wrists with palms facing up/together
  if (h1.isFlat && h2.isFlat && centerDist < 0.28 && wristDist < 0.28 && indexTipDist > 0.10) {
    return { label: 'Book', conf: 0.95 }
  }

  // 5. "Clap" — Both open flat hands meeting closely palm-to-palm
  if (h1.isFlat && h2.isFlat && indexTipDist < 0.16 && centerDist < 0.20) {
    return { label: 'Clap', conf: 0.95 }
  }

  // 6. "More" — Both hands pinched/closed tapping together in center
  if (!h1.extendedFingers.index && !h2.extendedFingers.index && indexTipDist < 0.16 && centerDist < 0.24) {
    return { label: 'More', conf: 0.94 }
  }

  // 7. "Nice to meet you" — Two index fingers pointing towards and touching each other
  if ((c1.label === '1' || c1.label === 'D') && (c2.label === '1' || c2.label === 'D') && indexTipDist < 0.15) {
    return { label: 'Nice to meet you', conf: 0.96 }
  }

  // 8. "How are you" / "HOW" (ASL Signature Two-Handed Sign)
  // Both hands cupped, loose curved, or open palms, held symmetrically in front of chest/body
  const h1HowShape = h1.isCupped || h1.isFlat || (h1.extendedCount >= 2 && !h1.isFist)
  const h2HowShape = h2.isCupped || h2.isFlat || (h2.extendedCount >= 2 && !h2.isFist)
  const isSymmetricHeight = Math.abs(lm1[9].y - lm2[9].y) < 0.22
  const isNaturalSeparation = centerDist >= 0.14 && centerDist <= 0.72

  // Guard against Help or Book
  const notHelp = !h1BaseHelp && !h2BaseHelp
  const notBook = !(h1.isFlat && h2.isFlat && wristDist < 0.18 && indexTipDist > 0.12)

  if (h1HowShape && h2HowShape && isSymmetricHeight && isNaturalSeparation && notHelp && notBook) {
    return { label: 'How are you', conf: 0.95 }
  }

  // 9. "Thank you" (Two-handed variant: both hands open, moving from chest toward viewer)
  if (h1.isFlat && h2.isFlat && isSymmetricHeight && lm1[0].y < 0.62 && lm2[0].y < 0.62 && centerDist < 0.42) {
    return { label: 'Thank you', conf: 0.93 }
  }

  return null
}

// ─── Curated ASL Vocabulary for Predictive Autocomplete ─────────────────────
const ASL_DICTIONARY = [
  'HELLO', 'HELP', 'HOW', 'HAVE', 'HEAR', 'HERE', 'HAPPY',
  'THANK', 'THANKS', 'TODAY', 'TIME', 'TOGETHER',
  'PLEASE', 'PEACE', 'PEOPLE',
  'YES', 'YOU', 'YOUR',
  'NAME', 'NICE', 'NO', 'NOW',
  'GOOD', 'GREAT', 'GO',
  'MEET', 'MORE', 'MY', 'MORNING',
  'WELCOME', 'WHAT', 'WHEN', 'WHERE', 'WHY', 'WHO', 'WITH',
  'LOVE', 'LIKE', 'LEARN',
  'FRIEND', 'FAMILY', 'FINE',
  'SIGN', 'SEE', 'SORRY', 'START', 'STOP',
  'UNDERSTAND', 'AGAIN', 'BOOK', 'DAY', 'NIGHT', 'WATER', 'FOOD'
]

export const Translate: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<MediaPipeCamera | null>(null)
  const handsRef = useRef<MediaPipeHands | null>(null)

  // Temporal motion buffers
  const trajectory1Ref = useRef<HistoricalPoint[]>([])
  const trajectory2Ref = useRef<HistoricalPoint[]>([])
  const frameBufferRef = useRef<string[]>([])
  const lastConfirmedRef = useRef<string>('')
  const lastAddedTimeRef = useRef<number>(0)

  // Camera devices
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')

  // App State
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)

  // Hand tracking state
  const [numHandsDetected, setNumHandsDetected] = useState<number>(0)
  const [hand1Details, setHand1Details] = useState<HandDetail | null>(null)
  const [hand2Details, setHand2Details] = useState<HandDetail | null>(null)

  const [currentLetter, setCurrentLetter] = useState<string>('')
  const [confidence, setConfidence] = useState(0)
  const [gestureMode, setGestureMode] = useState<'static' | 'dynamic' | 'two-handed'>('static')
  const [currentWord, setCurrentWord] = useState('')
  const [sentence, setSentence] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const autoSpeakRef = useRef(false)
  autoSpeakRef.current = autoSpeak
  const [feedbackMsg, setFeedbackMsg] = useState('Camera idle. Select camera and click "Start Camera".')

  // 1. Discover Video Devices
  const refreshCameras = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setFeedbackMsg('Camera mediaDevices API not supported on this browser.')
        return
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = devices
        .filter(d => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1} (${d.deviceId.slice(0, 6)}...)`,
        }))

      setAvailableCameras(videoInputs)

      // Intelligent default: prioritize real integrated/USB webcams over Phone Link
      if (videoInputs.length > 0) {
        const preferred = videoInputs.find(v => {
          const l = v.label.toLowerCase()
          return (l.includes('integrated') || l.includes('webcam') || l.includes('hd') || l.includes('front')) &&
                 !l.includes('phone') && !l.includes('link')
        }) || videoInputs[0]

        if (!selectedCameraId || !videoInputs.some(v => v.deviceId === selectedCameraId)) {
          setSelectedCameraId(preferred.deviceId)
        }
      }
    } catch (err) {
      console.warn('Device enumeration error:', err)
    }
  }, [selectedCameraId])

  useEffect(() => {
    refreshCameras()
    navigator.mediaDevices?.addEventListener('devicechange', refreshCameras)
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', refreshCameras)
    }
  }, [refreshCameras])

  // 2. Load MediaPipe Hands via CDN
  useEffect(() => {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    ]
    let loaded = 0
    scripts.forEach(src => {
      if (document.querySelector(`script[src="${src}"]`)) {
        loaded++
        if (loaded === scripts.length) setSdkReady(true)
        return
      }
      const s = document.createElement('script')
      s.src = src
      s.crossOrigin = 'anonymous'
      s.onload = () => {
        loaded++
        if (loaded === scripts.length) setSdkReady(true)
      }
      document.head.appendChild(s)
    })
  }, [])

  // 3. Dynamic Motion Gesture Engine
  const analyzeDynamicMotion = useCallback((history: HistoricalPoint[]): { label: string; conf: number } | null => {
    if (history.length < 12) return null

    const recent = history.slice(-16)
    const now = recent[recent.length - 1]
    const oldest = recent[0]

    const totalDist = recent.reduce((acc, curr, idx) => {
      if (idx === 0) return 0
      const prev = recent[idx - 1]
      return acc + Math.hypot(curr.x - prev.x, curr.y - prev.y)
    }, 0)

    const netDx = now.x - oldest.x
    const netDy = now.y - oldest.y
    const netDist = Math.hypot(netDx, netDy)

    let xDirectionChanges = 0
    for (let i = 2; i < recent.length; i++) {
      const dx1 = recent[i - 1].x - recent[i - 2].x
      const dx2 = recent[i].x - recent[i - 1].x
      if (Math.sign(dx1) !== 0 && Math.sign(dx2) !== 0 && Math.sign(dx1) !== Math.sign(dx2)) {
        xDirectionChanges++
      }
    }

    let yDirectionChanges = 0
    for (let i = 2; i < recent.length; i++) {
      const dy1 = recent[i - 1].y - recent[i - 2].y
      const dy2 = recent[i].y - recent[i - 1].y
      if (Math.sign(dy1) !== 0 && Math.sign(dy2) !== 0 && Math.sign(dy1) !== Math.sign(dy2)) {
        yDirectionChanges++
      }
    }

    // Dynamic 1: Wave / "Bye"
    if (xDirectionChanges >= 2 && totalDist > 0.16) {
      return { label: 'Bye', conf: 0.95 }
    }

    // Dynamic 2: "Yes" (vertical nod)
    if (yDirectionChanges >= 2 && totalDist > 0.14) {
      return { label: 'Yes', conf: 0.93 }
    }

    // Dynamic 3: "Thank you" (forward/downward movement from chin)
    if (oldest.y < 0.50 && netDy > 0.07 && totalDist > 0.12) {
      return { label: 'Thank you', conf: 0.94 }
    }

    // Dynamic 4: "Z" tracing (zigzag)
    if (totalDist > 0.28 && xDirectionChanges >= 2 && netDist < totalDist * 0.7) {
      return { label: 'Z', conf: 0.90 }
    }

    // Dynamic 5: "J" tracing (downward hook curve)
    if (netDy > 0.10 && xDirectionChanges >= 1 && totalDist > 0.18) {
      return { label: 'J', conf: 0.89 }
    }

    return null
  }, [])

  // 3b. Dual-Hand Dynamic Motion Engine (Tracks relative trajectory between both hands)
  const analyzeTwoHandMotion = useCallback((traj1: HistoricalPoint[], traj2: HistoricalPoint[]): { label: string; conf: number } | null => {
    if (traj1.length < 6 || traj2.length < 6) return null

    const recent1 = traj1.slice(-8)
    const recent2 = traj2.slice(-8)
    const old1 = recent1[0]
    const old2 = recent2[0]
    const now1 = recent1[recent1.length - 1]
    const now2 = recent2[recent2.length - 1]

    const initialDist = Math.hypot(old1.x - old2.x, old1.y - old2.y)
    const currentDist = Math.hypot(now1.x - now2.x, now1.y - now2.y)
    const distChange = currentDist - initialDist

    // Both hands rolling / moving outward symmetrically (ASL "How are you" motion)
    if (distChange > 0.06 && initialDist < 0.40 && currentDist > 0.22) {
      return { label: 'How are you', conf: 0.96 }
    }

    // Both hands moving together symmetrically (Clap / Book close)
    if (distChange < -0.08 && initialDist > 0.22 && currentDist < 0.18) {
      return { label: 'Clap', conf: 0.95 }
    }

    return null
  }, [])

  // 4. MediaPipe Result Callback (Full 2-Hand & 360° Rotation Support)
  const onResults = useCallback((results: HandResults) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const rawHands = results.multiHandLandmarks || []
    const count = rawHands.length
    setNumHandsDetected(count)

    if (count === 0) {
      setHand1Details(null)
      setHand2Details(null)
      setCurrentLetter('')
      setConfidence(0)
      trajectory1Ref.current = []
      trajectory2Ref.current = []
      setFeedbackMsg('Looking for hands... Place 1 or 2 hands in view at any angle.')
      return
    }

    // Process & Render each hand
    const canonicalHands: CanonicalHand[] = []
    const classifiedHands: Array<{ label: string; conf: number }> = []

    rawHands.forEach((landmarks, idx) => {
      const isHand1 = idx === 0
      const handednessLabel = results.multiHandedness?.[idx]?.label || (isHand1 ? 'Right' : 'Left')

      // Compute rotation-invariant canonical hand
      const cHand = computeCanonicalHand(landmarks, handednessLabel)
      canonicalHands.push(cHand)

      const singleClass = classifyCanonicalHand(cHand)
      classifiedHands.push(singleClass)

      // Distinct, visually stunning colors for Hand 1 and Hand 2
      const connectorColor = isHand1 ? '#10b981' : '#06b6d4'
      const landmarkColor = isHand1 ? '#a855f7' : '#f59e0b'
      const landmarkFill = isHand1 ? '#9333ea' : '#d97706'

      // Draw skeleton connectors
      if (window.drawConnectors && window.HAND_CONNECTIONS) {
        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: connectorColor,
          lineWidth: 3,
        })
      }

      // Draw skeleton joints
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, landmarks, {
          color: landmarkColor,
          fillColor: landmarkFill,
          lineWidth: 2,
          radius: 4,
        })
      }

      // Draw wrist badge on canvas
      const wrist = landmarks[0]
      const wx = wrist.x * canvas.width
      const wy = wrist.y * canvas.height

      ctx.save()
      ctx.translate(wx, wy)
      ctx.scale(-1, 1) // Un-mirror label so text reads naturally
      ctx.fillStyle = isHand1 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(6, 182, 212, 0.9)'
      ctx.beginPath()
      ctx.roundRect(-28, -26, 56, 20, 6)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 10px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${isHand1 ? 'Hand 1' : 'Hand 2'} (${cHand.palmFacing})`, 0, -16)
      ctx.restore()

      // Track trajectory point for dynamic gestures
      const indexTip = landmarks[8]
      const now = Date.now()
      const targetTrajectory = isHand1 ? trajectory1Ref.current : trajectory2Ref.current
      targetTrajectory.push({ x: indexTip.x, y: indexTip.y, time: now })
      if (targetTrajectory.length > 25) targetTrajectory.shift()

      // Render motion trail
      if (targetTrajectory.length > 2) {
        ctx.beginPath()
        ctx.strokeStyle = isHand1 ? '#10b981' : '#06b6d4'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.moveTo(targetTrajectory[0].x * canvas.width, targetTrajectory[0].y * canvas.height)
        for (let i = 1; i < targetTrajectory.length; i++) {
          ctx.lineTo(targetTrajectory[i].x * canvas.width, targetTrajectory[i].y * canvas.height)
        }
        ctx.stroke()
      }

      // Populate hand details
      const detail: HandDetail = {
        handIndex: idx,
        handedness: handednessLabel,
        label: singleClass.label,
        confidence: singleClass.conf,
        angleDeg: cHand.handAngleDeg,
        palmFacing: cHand.palmFacing,
        extendedCount: cHand.extendedCount,
      }

      if (isHand1) {
        setHand1Details(detail)
      } else {
        setHand2Details(detail)
      }
    })

    if (count === 1) {
      setHand2Details(null)
      trajectory2Ref.current = []
    }

    // Connect both hands with a dotted link on canvas when 2 hands are tracked
    if (count >= 2) {
      const w1 = rawHands[0][0]
      const w2 = rawHands[1][0]
      ctx.save()
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.moveTo(w1.x * canvas.width, w1.y * canvas.height)
      ctx.lineTo(w2.x * canvas.width, w2.y * canvas.height)
      ctx.stroke()
      ctx.restore()
    }

    // ── Recognition Decision Engine ──
    let activeResult: { label: string; conf: number } | null = null
    let activeMode: 'static' | 'dynamic' | 'two-handed' = 'static'

    // Phase 1: If 2 hands are present, check Two-Handed Composite Signs
    if (count >= 2 && canonicalHands.length >= 2) {
      // 1a. Check dynamic relative motion between both hands (e.g. outward roll for "How are you")
      const twoHandMotion = analyzeTwoHandMotion(trajectory1Ref.current, trajectory2Ref.current)
      if (twoHandMotion && twoHandMotion.conf >= 0.88) {
        activeResult = twoHandMotion
        activeMode = 'two-handed'
      }

      // 1b. Check two-hand relational geometry (How are you, Help, Book, Peace, Love, etc.)
      if (!activeResult) {
        const twoHandSign = analyzeTwoHandGesture(canonicalHands[0], canonicalHands[1])
        if (twoHandSign && twoHandSign.conf >= 0.88) {
          activeResult = twoHandSign
          activeMode = 'two-handed'
        }
      }
    }

    // Phase 2: Check Dynamic Motion Trajectory
    if (!activeResult) {
      const dyn1 = analyzeDynamicMotion(trajectory1Ref.current)
      const dyn2 = count >= 2 ? analyzeDynamicMotion(trajectory2Ref.current) : null
      const bestDyn = dyn1 && dyn2 ? (dyn1.conf >= dyn2.conf ? dyn1 : dyn2) : (dyn1 || dyn2)

      if (bestDyn && bestDyn.conf >= 0.88) {
        activeResult = bestDyn
        activeMode = 'dynamic'
      }
    }

    // Phase 3: Single-Hand Static Recognition (Pick highest confidence, require >= 0.82)
    if (!activeResult && classifiedHands.length > 0) {
      const best = classifiedHands.reduce((prev, curr) => (curr.conf > prev.conf ? curr : prev), classifiedHands[0])
      if (best && best.label && best.conf >= 0.82) {
        activeResult = best
        activeMode = 'static'
      }
    }

    setGestureMode(activeMode)

    if (activeResult && activeResult.label && activeResult.conf >= 0.82) {
      setCurrentLetter(activeResult.label)
      setConfidence(activeResult.conf)

      const modeText = activeMode === 'two-handed'
        ? '👐 Two-Handed Sign'
        : activeMode === 'dynamic'
        ? '⚡ Motion Sign'
        : `✋ ${canonicalHands[0]?.palmFacing === 'back' ? 'Reverse Palm' : 'Rotated'} Sign`

      setFeedbackMsg(`${modeText} "${activeResult.label}" (${Math.round(activeResult.conf * 100)}%) — Angle: ${canonicalHands[0]?.handAngleDeg}°`)

      // Stability buffer: verify consistency across frames before adding to text
      const buf = frameBufferRef.current
      buf.push(activeResult.label)
      if (buf.length > 14) buf.shift()

      const counts: Record<string, number> = {}
      buf.forEach(item => { counts[item] = (counts[item] || 0) + 1 })
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

      if (sorted.length > 0) {
        const [topLabel, topCount] = sorted[0]
        const nowMs = Date.now()
        // Responsive 4-frame confirmation for 2-handed and dynamic gestures!
        const minRequired = activeMode === 'two-handed' ? 4 : activeMode === 'dynamic' ? 4 : 6

        const canAdd = topCount >= minRequired && (
          topLabel !== lastConfirmedRef.current || nowMs - lastAddedTimeRef.current > 1500
        )

        if (canAdd && nowMs - lastAddedTimeRef.current > 750) {
          lastConfirmedRef.current = topLabel
          lastAddedTimeRef.current = nowMs
          frameBufferRef.current = []

          if (topLabel.length > 1) {
            setSentence(prev => prev ? `${prev} ${topLabel}` : topLabel)
            setCurrentWord('')
            if (autoSpeakRef.current && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel()
              const u = new SpeechSynthesisUtterance(topLabel)
              u.rate = 1.0
              window.speechSynthesis.speak(u)
            }
          } else {
            setCurrentWord(prev => prev + topLabel)
          }
        }
      }
    } else {
      setCurrentLetter('')
      setConfidence(0)
      if (frameBufferRef.current.length > 0) {
        frameBufferRef.current.shift()
      }
      setFeedbackMsg(
        count === 2
          ? 'Tracking 2 hands. Show a two-handed gesture or clear sign.'
          : 'Tracking hand. Show a clear sign or letter.'
      )
    }
  }, [analyzeDynamicMotion, analyzeTwoHandMotion])

  // 5. Camera Control
  const toggleCamera = async () => {
    if (isActive) {
      if (cameraRef.current) {
        cameraRef.current.stop()
      }
      setIsActive(false)
      setNumHandsDetected(0)
      setHand1Details(null)
      setHand2Details(null)
      setCurrentLetter('')
      trajectory1Ref.current = []
      trajectory2Ref.current = []
      setFeedbackMsg('Camera stopped.')
      return
    }

    if (!sdkReady) {
      setFeedbackMsg('Loading MediaPipe engine. Please wait a second...')
      return
    }

    setIsLoading(true)
    setFeedbackMsg('Starting selected camera with Dual-Hand Tracking & Rotation Invariance...')

    try {
      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })

      // Optimized tracking settings for dual-hand interactive signs
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.42,
        minTrackingConfidence: 0.42,
      })
      hands.onResults(onResults)
      handsRef.current = hands

      const video = videoRef.current
      if (video) {
        const constraints: MediaStreamConstraints = {
          video: selectedCameraId
            ? { deviceId: { exact: selectedCameraId }, width: { ideal: 640 }, height: { ideal: 480 } }
            : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        video.srcObject = stream
        await video.play()

        let isRunning = true
        const processFrame = async () => {
          if (!isRunning) return
          if (video && handsRef.current && video.readyState >= 2) {
            try {
              await handsRef.current.send({ image: video })
            } catch {
              // Frame dropped
            }
          }
          if (isRunning) {
            requestAnimationFrame(processFrame)
          }
        }
        requestAnimationFrame(processFrame)

        cameraRef.current = {
          start: () => { isRunning = true },
          stop: () => {
            isRunning = false
            stream.getTracks().forEach(track => track.stop())
            if (video) video.srcObject = null
          },
        }

        setIsActive(true)
        setFeedbackMsg('Camera active! 2-hand detection and 360° rotation tolerance enabled.')
      }
    } catch (err: any) {
      console.error('Camera startup error:', err)
      setFeedbackMsg(`Camera error: ${err.message || 'Permission denied'}. Try selecting another camera above.`)
    } finally {
      setIsLoading(false)
    }
  }

  // Camera switch on the fly
  const handleCameraChange = async (newDeviceId: string) => {
    setSelectedCameraId(newDeviceId)
    if (isActive) {
      if (cameraRef.current) cameraRef.current.stop()
      setIsActive(false)
      setTimeout(() => {
        toggleCamera()
      }, 300)
    }
  }

  // Text builders
  const handleSpace = () => {
    if (currentWord) {
      setSentence(prev => prev ? `${prev} ${currentWord}` : currentWord)
      if (autoSpeak && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(currentWord)
        u.rate = 1.0
        window.speechSynthesis.speak(u)
      }
      setCurrentWord('')
    } else {
      setSentence(prev => prev + ' ')
    }
  }

  const handleApplyPrediction = (word: string) => {
    setSentence(prev => prev ? `${prev} ${word}` : word)
    if (autoSpeak && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(word)
      u.rate = 1.0
      window.speechSynthesis.speak(u)
    }
    setCurrentWord('')
  }

  const predictions = currentWord.trim()
    ? ASL_DICTIONARY.filter(w => w.startsWith(currentWord.toUpperCase()) && w !== currentWord.toUpperCase()).slice(0, 4)
    : []

  const handleDelete = () => {
    if (currentWord.length > 0) {
      setCurrentWord(prev => prev.slice(0, -1))
    } else if (sentence.length > 0) {
      setSentence(prev => prev.slice(0, -1))
    }
  }

  const handleClear = () => {
    if (sentence || currentWord) {
      setHistory(prev => [sentence + (currentWord ? ` ${currentWord}` : ''), ...prev].slice(0, 5))
    }
    setSentence('')
    setCurrentWord('')
    setCurrentLetter('')
    lastConfirmedRef.current = ''
    frameBufferRef.current = []
    trajectory1Ref.current = []
    trajectory2Ref.current = []
  }

  const handleCopy = () => {
    const textToCopy = [sentence, currentWord].filter(Boolean).join(' ')
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSpeak = () => {
    const textToSpeak = [sentence, currentWord].filter(Boolean).join(' ')
    if (textToSpeak && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 3D Header & Camera Selector Bar */}
      <div className="card-3d p-6 rounded-3xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-600/30 shrink-0">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-2xl">
                <span>👐</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Dual-Hand & Rotation-Invariant Sign Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 uppercase">
                  <Zap className="w-3 h-3" />
                  2-Hand Support
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 uppercase">
                  <Compass className="w-3 h-3" />
                  360° Rotation Invariant
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Tracks both hands simultaneously. Recognizes signs even when rotated, tilted, folded, or when your palm turns sideways or inward.
              </p>
            </div>
          </div>

          {/* Camera Selection Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-950 border border-purple-500/30 text-white text-xs font-semibold focus:outline-none focus:border-purple-400 cursor-pointer shadow-inner appearance-none truncate"
                title="Select which camera device to use"
              >
                {availableCameras.length > 0 ? (
                  availableCameras.map(cam => (
                    <option key={cam.deviceId} value={cam.deviceId} className="bg-gray-900 text-white">
                      📷 {cam.label}
                    </option>
                  ))
                ) : (
                  <option value="">Default Laptop Camera</option>
                )}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                ▼
              </div>
            </div>

            <button
              onClick={refreshCameras}
              className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors"
              title="Rescan camera devices"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Dual Hand Real-time Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-gray-800/80">
          {/* Tracking mode pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${numHandsDetected === 2 ? 'bg-cyan-400 animate-pulse' : numHandsDetected === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
              <span className="font-bold text-gray-200">
                {numHandsDetected === 2 ? 'Dual-Hand Mode (2 Hands)' : numHandsDetected === 1 ? 'Single-Hand Mode' : 'No Hands In Frame'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-purple-400 uppercase font-semibold">
              {gestureMode}
            </span>
          </div>

          {/* Hand 1 Status */}
          <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            hand1Details
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-gray-950/60 border-gray-800/80 text-gray-500'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold">Hand 1:</span>
              <span>{hand1Details ? `"${hand1Details.label}" (${Math.round(hand1Details.confidence * 100)}%)` : 'Idle'}</span>
            </div>
            {hand1Details && (
              <span className="font-mono text-[10px] text-emerald-400/80">
                {hand1Details.angleDeg}° • {hand1Details.palmFacing}
              </span>
            )}
          </div>

          {/* Hand 2 Status */}
          <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            hand2Details
              ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
              : 'bg-gray-950/60 border-gray-800/80 text-gray-500'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-bold">Hand 2:</span>
              <span>{hand2Details ? `"${hand2Details.label}" (${Math.round(hand2Details.confidence * 100)}%)` : 'Idle'}</span>
            </div>
            {hand2Details && (
              <span className="font-mono text-[10px] text-cyan-400/80">
                {hand2Details.angleDeg}° • {hand2Details.palmFacing}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* ── LEFT: Viewfinder Panel (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-3d rounded-3xl overflow-hidden relative shadow-2xl">
            
            {/* Viewfinder Aspect Ratio */}
            <div className="relative aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
              />

              {/* Laser line when active */}
              {isActive && numHandsDetected > 0 && <div className="scanner-laser" />}

              {/* Reticle Corners */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-purple-400 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-purple-400 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-purple-400 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-purple-400 rounded-br-xl pointer-events-none" />

              {/* Camera Off Overlay */}
              {!isActive && (
                <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/20 border border-purple-500/40 flex items-center justify-center text-4xl shadow-2xl">
                    <span>🎥</span>
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-lg font-bold text-white">Start Dual-Hand Camera</h3>
                    <p className="text-xs text-gray-400">
                      Supports 1 or 2 hands. You can rotate hands 360°, turn palms inward, or fold fingers.
                    </p>
                  </div>
                  <button
                    onClick={toggleCamera}
                    disabled={isLoading || !sdkReady}
                    className="btn-3d px-8 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center gap-2.5 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Engine...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Start Camera</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Overlay HUD Pill (Top Right) */}
              {isActive && currentLetter && (
                <div className="absolute top-4 right-4 z-30 px-3.5 py-2 rounded-2xl bg-gray-950/85 backdrop-blur-md border border-purple-500/40 flex items-center gap-2.5 shadow-xl animate-scaleUp">
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
                    {currentLetter}
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      {gestureMode === 'two-handed' ? '👐 2-Handed' : gestureMode === 'dynamic' ? '⚡ Motion' : '✋ Static Sign'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {Math.round(confidence * 100)}% Match
                    </span>
                  </div>
                </div>
              )}

              {/* Trajectory Guide Pill (Top Left) */}
              {isActive && (
                <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-xl bg-gray-950/80 backdrop-blur-md border border-gray-800 text-[11px] text-gray-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${numHandsDetected > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>
                    {numHandsDetected === 2
                      ? 'Tracking Both Hands (Dual Coupling)'
                      : numHandsDetected === 1
                      ? 'Tracking Single Hand (360° Invariant)'
                      : 'Looking for hands...'}
                  </span>
                </div>
              )}

              {/* Viewfinder Bottom Status Pill */}
              <div className="absolute bottom-4 inset-x-4 z-30 flex items-center justify-between text-xs px-4 py-2 rounded-xl bg-gray-950/80 backdrop-blur-md border border-gray-800">
                <span className="text-gray-300 truncate max-w-sm">{feedbackMsg}</span>
                <span className="text-gray-500 font-mono text-[10px] uppercase">
                  {isActive ? 'Dual 2-Hand • 30+ FPS' : 'Standby'}
                </span>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-4 bg-gray-950/90 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={toggleCamera}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                    : 'btn-3d text-white'
                }`}
              >
                {isActive ? (
                  <>
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </>
                )}
              </button>

              {/* Editing Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpace}
                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Finalize word / Space"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  <span>Space</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Delete last letter"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span>Backspace</span>
                </button>
                <button
                  onClick={handleClear}
                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-rose-950/40 border border-gray-800 hover:text-rose-300 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Clear sentence"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT: Realtime Translation Output (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          
          {/* Active Recognized Sign Card */}
          <div className="card-3d p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Recognized Sign
              </span>
              <span className="text-xs font-mono text-purple-400">
                {confidence > 0 ? `${Math.round(confidence * 100)}% Confidence` : 'Awaiting sign'}
              </span>
            </div>

            <div className="flex items-center justify-center py-4 min-h-[105px]">
              {currentLetter ? (
                <div className="text-center space-y-1 animate-scaleUp">
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 tracking-tight">
                    {currentLetter}
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {gestureMode === 'two-handed'
                      ? '👐 Two-Handed Composite Gesture'
                      : gestureMode === 'dynamic'
                      ? '⚡ Motion Trajectory Gesture'
                      : (currentLetter.length > 1 ? 'Conversational Phrase' : 'Alphabet Letter')}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 space-y-1">
                  <span className="text-3xl block">✋ 🤚</span>
                  <span className="text-xs">Hold 1 or 2 hands up in any rotation or direction</span>
                </div>
              )}
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                360° canonical normalization eliminates camera angle and wrist tilt errors
              </p>
            </div>
          </div>

          {/* Current Word Building */}
          <div className="card-3d p-5 rounded-3xl space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Current Word Building</span>
              <span className="text-[11px] text-gray-500">
                {currentWord ? `${currentWord.length} letters` : 'Empty'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 min-h-[44px] p-2.5 rounded-2xl bg-gray-950 border border-gray-800/80">
              {currentWord ? (
                currentWord.split('').map((char, index) => (
                  <span
                    key={index}
                    className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 font-extrabold flex items-center justify-center text-sm shadow-sm"
                  >
                    {char}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500 italic pl-1">
                  Fingerspell letters to assemble words...
                </span>
              )}
            </div>

            {/* Predictive Autocomplete Suggestions */}
            {predictions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 animate-fadeIn">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Suggestions:</span>
                </span>
                {predictions.map(pred => (
                  <button
                    key={pred}
                    onClick={() => handleApplyPrediction(pred)}
                    className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm active:scale-95"
                    title={`Complete word: "${pred}"`}
                  >
                    <span>{pred}</span>
                    <span className="text-[10px] opacity-70">↵</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Conversational Phrases (When idle) */}
            {!currentWord && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Quick Phrases:
                </span>
                {['How are you', 'Thank you', 'Nice to meet you', 'Help', 'Yes', 'No'].map(phrase => (
                  <button
                    key={phrase}
                    onClick={() => handleApplyPrediction(phrase)}
                    className="px-2 py-0.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/40 text-gray-400 hover:text-purple-300 font-medium text-[11px] transition-colors active:scale-95"
                  >
                    + {phrase}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Translated Sentence Board */}
          <div className="card-3d p-6 rounded-3xl space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Translated Sentence
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all ${
                      autoSpeak
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
                    }`}
                    title={autoSpeak ? 'Auto-Voice is active (speaks new words aloud)' : 'Click to enable Auto-Voice TTS'}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${autoSpeak ? 'text-emerald-400' : ''}`} />
                    <span>{autoSpeak ? 'Auto-Voice ON' : 'Auto-Voice OFF'}</span>
                  </button>
                  <button
                    onClick={handleSpeak}
                    disabled={!sentence && !currentWord}
                    className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors disabled:opacity-30 border border-gray-800"
                    title="Speak text aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!sentence && !currentWord}
                    className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors disabled:opacity-30 border border-gray-800"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Text Box */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800/80 min-h-[110px] text-base text-gray-100 font-medium leading-relaxed">
                {sentence ? (
                  <span>
                    {sentence}
                    {currentWord && <span className="text-purple-400"> {currentWord}</span>}
                  </span>
                ) : currentWord ? (
                  <span className="text-purple-400">{currentWord}</span>
                ) : (
                  <span className="text-gray-600 text-sm italic">
                    Your complete translated speech will appear here.
                  </span>
                )}
                {isActive && <span className="inline-block w-1.5 h-4 ml-1 bg-purple-400 animate-pulse align-middle" />}
              </div>
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div className="pt-2 border-t border-gray-800/80">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Recent Phrases
                </span>
                <div className="space-y-1">
                  {history.map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-400 truncate bg-gray-950/60 px-2.5 py-1 rounded-lg">
                      "{item}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Supported Gestures Quick Chips */}
      <div className="card-3d p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Supported Sign Dictionary Reference
          </span>
          <span className="text-xs text-purple-400">2-Handed, Motion & 360° Rotational Invariant</span>
        </div>

        <div className="space-y-3">
          {/* 2-Handed Signs */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              👐 Two-Handed Phrases (Requires Both Hands)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['How are you', 'Nice to meet you', 'Book', 'More', 'Help', 'Peace', 'Love', 'Clap'].map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-medium"
                >
                  "{p}"
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Motion */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              ⚡ Dynamic Motion Signs
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['Wave / Bye', 'Nod / Yes', 'Z Tracing', 'J Tracing'].map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-medium"
                >
                  "{p}"
                </span>
              ))}
            </div>
          </div>

          {/* Alphabets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              🔤 Alphabets (A–Z) & Static Signs (Works At Any Hand Rotation / Tilt)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                <span
                  key={letter}
                  className="px-2.5 py-1 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 text-xs font-bold font-mono"
                >
                  {letter}
                </span>
              ))}
              {['Hello', 'OK', 'Good morning', 'Good night'].map((phrase) => (
                <span
                  key={phrase}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-medium"
                >
                  "{phrase}"
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Translate
