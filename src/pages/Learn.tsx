import React, { useState, useRef, useEffect } from 'react'
import {
  BookOpen, Video, Play, Pause, ChevronLeft, ChevronRight,
  Search, Sparkles, CheckCircle2, ArrowRight, ArrowLeftRight,
  Trophy, Award, Flame, Check,
  ExternalLink, RefreshCw, Globe
} from 'lucide-react'
import { ALPHABETS_DATA, PHRASES_DATA } from './SignLibrary'

// ─── Extended Numbers Data ──────────────────────────────────────────────────
export const NUMBERS_DATA: Record<string, { handshape: string; desc: string; tip: string }> = {
  '1': { handshape: '☝️', desc: 'Index finger straight up, palm facing inward toward yourself.', tip: 'Palm orientation faces signer for numbers 1-5.' },
  '2': { handshape: '✌️', desc: 'Index and middle fingers extended upward in a V, palm inward.', tip: 'Do not face palm outward like peace sign.' },
  '3': { handshape: '🤟', desc: 'Thumb, index, and middle fingers extended outward.', tip: 'ASL 3 includes the thumb, unlike British or hearing sign.' },
  '4': { handshape: '🖐️', desc: 'Four fingers up, thumb folded across palm, palm inward.', tip: 'Thumb tightly tucked.' },
  '5': { handshape: '🖐️', desc: 'All five fingers spread wide open, palm facing inward.', tip: 'Relaxed open hand.' },
  '6': { handshape: '👌', desc: 'Thumb and pinky tips touch forming a ring; three middle fingers up.', tip: 'Palm faces outward for 6-9.' },
  '7': { handshape: '👌', desc: 'Thumb and ring finger tips touch; other three fingers up.', tip: 'Ring finger touches thumb.' },
  '8': { handshape: '👌', desc: 'Thumb and middle finger tips touch; other three fingers up.', tip: 'Middle finger touches thumb.' },
  '9': { handshape: '👌', desc: 'Thumb and index finger tips touch (like F), palm facing outward.', tip: 'Opposite of 6.' },
  '10': { handshape: '👍', desc: 'Make an "A" fist with thumb up, then give a quick friendly wag/twist of the wrist.', tip: 'Thumb shakes side-to-side.' },
}

// ─── Curated YouTube Tutorials ──────────────────────────────────────────────
const YOUTUBE_LESSONS = [
  {
    id: 'ianCExNsK_8',
    title: 'ASL Alphabet: Complete Beginner Masterclass',
    category: 'Alphabet',
    duration: '8:24',
    instructor: 'Learn ASL Free',
    desc: 'Clear, step-by-step demonstration of all 26 letters of the American Sign Language alphabet with thumb placement secrets.',
  },
  {
    id: 'v1desDduz5M',
    title: 'Top 25 Common Signs & Phrases for Everyday Conversations',
    category: 'Phrases',
    duration: '12:10',
    instructor: 'Signed With Heart',
    desc: 'Master everyday phrases like Hello, Nice to meet you, Thank you, and How are you with authentic facial expressions.',
  },
  {
    id: '0FcwzMq4iWg',
    title: 'How to Sign Numbers 1 to 20 in ASL',
    category: 'Numbers',
    duration: '6:15',
    instructor: 'ASL Meredith',
    desc: 'Learn proper palm orientation and finger positioning for counting from 1 through 20 effortlessly.',
  },
  {
    id: 'BrSMrmCI6GU',
    title: 'Basic ASL Greetings and Polite Expressions',
    category: 'Greetings',
    duration: '7:45',
    instructor: 'Bill Vicars / Lifeprint',
    desc: 'World-renowned Deaf educator Dr. Bill Vicars teaches beginner greeting signs and cultural etiquette.',
  },
  {
    id: 'GUa8DMmBGm8',
    title: 'Your First 5-Minute Conversation in Sign Language',
    category: 'Phrases',
    duration: '15:20',
    instructor: 'ASL THAT',
    desc: 'Put letters and signs together into full sentences for real-world interactions with Deaf individuals.',
  },
  {
    id: 'CE-1KGGLGlQ',
    title: 'Colors & Everyday Vocabulary in ASL',
    category: 'Vocabulary',
    duration: '5:40',
    instructor: 'Sign Language 101',
    desc: 'Fun and memorable gestures for all colors, days of the week, and common objects.',
  },
]

// ─── Interactive Lessons Curriculum ─────────────────────────────────────────
const CURRICULUM_MODULES = [
  {
    id: 'mod1',
    level: 'Level 1',
    title: 'Fingerspelling & The Alphabet',
    icon: '🔤',
    badge: 'Novice',
    desc: 'Master manual alphabet shapes A through Z and learn how to spell your name with high precision.',
    itemsCount: 26,
    topics: ['Hand positions A to M', 'Hand positions N to Z', 'Avoiding the bouncing wrist mistake', 'Reading receptive fingerspelling'],
  },
  {
    id: 'mod2',
    level: 'Level 2',
    title: 'Numbers & Counting (1 to 10)',
    icon: '🔢',
    badge: 'Beginner',
    desc: 'Learn the critical difference in palm orientation: 1–5 face inward, while 6–9 face outward.',
    itemsCount: 10,
    topics: ['Numbers 1 to 5 (Inward palm rule)', 'Numbers 6 to 9 (Finger-thumb pinch rule)', 'Number 10 (Thumb shake)', 'Counting drill'],
  },
  {
    id: 'mod3',
    level: 'Level 3',
    title: 'Greetings & Introductions',
    icon: '🤝',
    badge: 'Intermediate',
    desc: 'First encounters: Say "Hello", "My name is...", "Nice to meet you", and polite greetings.',
    itemsCount: 8,
    topics: ['Hello & Goodbye', 'My Name is [Name]', 'Nice to meet you', 'Good morning & Good night'],
  },
  {
    id: 'mod4',
    level: 'Level 4',
    title: 'Conversational Dialogues',
    icon: '💬',
    badge: 'Conversational',
    desc: 'Ask questions and give polite responses: "How are you?", "Yes", "No", "OK", "See you later".',
    itemsCount: 7,
    topics: ['How are you (Asking with eyebrows)', 'Yes, No, OK (Affirmations)', 'See you later', 'Expressing gratitude'],
  },
]

// ─── Handbook Chapters ───────────────────────────────────────────────────────
const HANDBOOK_CHAPTERS = [
  {
    id: 1,
    title: 'Foundations of Sign Language',
    badge: 'Introduction',
    icon: '📖',
    sections: [
      {
        heading: 'What is American Sign Language (ASL)?',
        text: 'American Sign Language (ASL) is a rich, complete visual-spatial language that serves as the primary language for hundreds of thousands of Deaf and hard-of-hearing individuals. ASL is not simply English translated into hand gestures — it has its own distinct grammar, syntax, idioms, and cultural traditions.',
      },
      {
        heading: 'The 5 Core Parameters of Every Sign',
        text: 'Every sign in ASL is formed by five essential parameters:\n1. Handshape: Which fingers are extended or folded (e.g., A vs B).\n2. Location: Where the sign is performed (e.g., forehead, chest, neutral space).\n3. Movement: Direction and path of motion (e.g., tapping, circling, nodding).\n4. Palm Orientation: Direction your palm faces (inward, outward, up, down).\n5. Non-Manual Markers: Facial expressions, head nods, eyebrow raises, and mouth shapes.',
      },
      {
        heading: 'Deaf Culture and Etiquette',
        text: 'Sign language is deeply rooted in community. Maintain direct eye contact while someone is signing (looking away is equivalent to walking away in spoken conversation). Greet people warmly, be patient with your pace, and embrace learning mistakes as a natural part of becoming an ally.',
      },
    ],
  },
  {
    id: 2,
    title: 'The ASL Alphabet & Fingerspelling',
    badge: 'Alphabet',
    icon: '🔤',
    sections: [
      {
        heading: 'When is Fingerspelling Used?',
        text: 'Fingerspelling (spelling words letter-by-letter with the 26 manual alphabets) is used for personal names, brand names, street addresses, book titles, and words that lack a specific dedicated sign. It accounts for about 10-15% of casual signing.',
      },
      {
        heading: 'Top Rules for Effortless Fingerspelling',
        text: '• Keep your hand steady: Hold your hand at comfortable shoulder height near your chin.\n• Never bounce your hand: Move smoothly from one letter to the next without bouncing.\n• Pause for word breaks: A slight brief pause between words rather than swinging your arm.\n• Clarity over speed: Native signers value smooth clarity much more than frantic speed.',
      },
      {
        heading: 'Fingerspelling Your Own Name',
        text: 'Start by practicing your first name forward and backward. Spell it in front of a mirror or our live webcam translator until transitions become muscle memory.',
      },
    ],
  },
  {
    id: 3,
    title: 'Everyday Greetings & Core Phrases',
    badge: 'Greetings',
    icon: '💬',
    sections: [
      {
        heading: 'Essential Everyday Expressions',
        text: 'Master these 6 universal signs early:\n• Hello: Flat hand at temple, saluting smoothly outward.\n• Thank You: Flat hand fingertips touch chin, moving forward toward the other person.\n• Please: Flat hand rubs clockwise circles over your chest.\n• Yes: Fist nodding up and down from the wrist like a nodding head.\n• No: Index and middle fingers snap down onto thumb twice like a bird beak.\n• Goodbye: Open hand waving gently side to side.',
      },
      {
        heading: 'Introducing Yourself',
        text: 'To say "My name is John":\n1. Sign MY (flat hand on chest)\n2. Sign NAME (both hands in H handshape, dominant H taps non-dominant H twice)\n3. Fingerspell J-O-H-N smoothly.',
      },
    ],
  },
  {
    id: 4,
    title: 'Grammar, Structure & Facial Expressions',
    badge: 'Grammar',
    icon: '📐',
    sections: [
      {
        heading: 'Topic-Comment Word Order',
        text: 'Unlike English (Subject-Verb-Object), ASL often uses Topic-Comment structure. You introduce what you are talking about first, then provide the commentary:\n• English: "I like ice cream."\n• ASL: "ICE CREAM, I LIKE."\n• English: "Where is the bathroom?"\n• ASL: "BATHROOM, WHERE?"',
      },
      {
        heading: 'Non-Manual Signals (Facial Grammar)',
        text: 'Your face carries crucial grammatical information:\n• Yes/No Questions: Raise eyebrows, lean head slightly forward.\n• WH-Questions (Who, What, Where, Why): Furrow/lower eyebrows, tilt head.\n• Negation: Shake head slightly while producing the sign.',
      },
    ],
  },
  {
    id: 5,
    title: 'Daily Practice & Fluency Mastery',
    badge: 'Mastery',
    icon: '🎯',
    sections: [
      {
        heading: 'The 15-Minute Daily Routine',
        text: '1. Warm up: 2 minutes of hand and finger stretches.\n2. Alphabet drill: Spell 5 random words you see around the room.\n3. Phrase practice: Rehearse 3 conversational sentences aloud while signing.\n4. Camera check: Use SignBridge Live Translator to test if your signs are recognized accurately.',
      },
      {
        heading: 'Tips for Long-term Retention',
        text: 'Watch Deaf creators on YouTube and social media to absorb natural signing rhythm. Don\'t translate English word-by-word; visualize the concepts in space.',
      },
    ],
  },
]

type SubTab = 'rylo-translate' | 'curriculum' | 'quiz' | 'book' | 'videos'

export const Learn: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('rylo-translate')

  // ── Kinetic 3D Avatar & Sign Studio State ─────────────────────────────────
  const [translationDirection, setTranslationDirection] = useState<'text-to-sign' | 'sign-to-text'>('text-to-sign')
  const [ryloInput, setRyloInput] = useState('Hello nice to meet you')
  const [parsedTokens, setParsedTokens] = useState<Array<{ type: 'phrase' | 'letter'; text: string; data: any }>>([])
  const [activeTokenIdx, setActiveTokenIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLooping, setIsLooping] = useState(true)
  const [speed, setSpeed] = useState<number>(1000)
  const [cameraPreset, setCameraPreset] = useState<'front' | 'angled' | 'closeup'>('front')
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null)

  // Parse Text for Sign Studio
  const parseTextToTokens = (input: string) => {
    if (!input.trim()) {
      setParsedTokens([])
      return
    }

    const tokens: Array<{ type: 'phrase' | 'letter'; text: string; data: any }> = []
    const clean = input.trim()
    const lower = clean.toLowerCase()

    // 1. Prioritize multi-word phrase matches from PHRASES_DATA (sorted longest first)
    const sortedPhrases = [...PHRASES_DATA].sort((a, b) => b.name.length - a.name.length)
    let remaining = lower

    for (const phrase of sortedPhrases) {
      const pName = phrase.name.toLowerCase()
      if (remaining.includes(pName)) {
        tokens.push({ type: 'phrase', text: phrase.name, data: phrase })
        remaining = remaining.replace(pName, ' ')
      }
    }

    // 2. Tokenize remaining words or individual fingerspelling letters
    const remainingWords = remaining.trim().split(/\s+/).filter(Boolean)
    for (const w of remainingWords) {
      const matched = PHRASES_DATA.find(p => p.name.toLowerCase() === w)
      if (matched) {
        tokens.push({ type: 'phrase', text: matched.name, data: matched })
      } else {
        w.toUpperCase().split('').forEach(char => {
          if (ALPHABETS_DATA[char]) {
            tokens.push({ type: 'letter', text: char, data: ALPHABETS_DATA[char] })
          }
        })
      }
    }

    // Fallback if empty
    if (tokens.length === 0) {
      const fallback = PHRASES_DATA.find(p => p.name.toLowerCase() === 'hello') || {
        name: 'Hello', handshape: '👋', action: 'Open palm waving from temple', tip: 'Friendly smile'
      }
      tokens.push({ type: 'phrase', text: 'Hello', data: fallback })
    }

    setParsedTokens(tokens)
    setActiveTokenIdx(0)
    setIsPlaying(true) // ALWAYS auto-play on text change!
  }

  useEffect(() => {
    parseTextToTokens(ryloInput)
  }, [])

  // ── 60 FPS Volumetric 3D Kinetic Avatar Engine ────────────────────────────
  interface FingerPose {
    thumb: number
    index: number
    middle: number
    ring: number
    pinky: number
  }

  interface AvatarPose {
    lwx: number
    lwy: number
    lAngle: number
    lFingers: FingerPose
    rwx: number
    rwy: number
    rAngle: number
    rFingers: FingerPose
    headTiltX: number
    headTiltY: number
    eyebrows: number
    mouth: number
    chestTwist: number
  }

  const curPoseRef = useRef<AvatarPose | null>(null)
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; alpha: number; color: string }>>([])
  const trailRef = useRef<Array<{ x: number; y: number; alpha: number; color: string }>>([])
  const lastTimeRef = useRef<number>(0)
  const tokenTimerRef = useRef<number>(0)
  const animFrameRef = useRef<number | null>(null)

  // Reset timer on active index scrub
  useEffect(() => {
    tokenTimerRef.current = 0
  }, [activeTokenIdx])

  useEffect(() => {
    const canvas = avatarCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isRunning = true

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const lerpFingers = (a: FingerPose, b: FingerPose, t: number): FingerPose => ({
      thumb: lerp(a.thumb, b.thumb, t),
      index: lerp(a.index, b.index, t),
      middle: lerp(a.middle, b.middle, t),
      ring: lerp(a.ring, b.ring, t),
      pinky: lerp(a.pinky, b.pinky, t),
    })

    const lerpPose = (cur: AvatarPose, tgt: AvatarPose, t: number): AvatarPose => ({
      lwx: lerp(cur.lwx, tgt.lwx, t),
      lwy: lerp(cur.lwy, tgt.lwy, t),
      lAngle: lerp(cur.lAngle, tgt.lAngle, t),
      lFingers: lerpFingers(cur.lFingers, tgt.lFingers, t),
      rwx: lerp(cur.rwx, tgt.rwx, t),
      rwy: lerp(cur.rwy, tgt.rwy, t),
      rAngle: lerp(cur.rAngle, tgt.rAngle, t),
      rFingers: lerpFingers(cur.rFingers, tgt.rFingers, t),
      headTiltX: lerp(cur.headTiltX, tgt.headTiltX, t),
      headTiltY: lerp(cur.headTiltY, tgt.headTiltY, t),
      eyebrows: lerp(cur.eyebrows, tgt.eyebrows, t),
      mouth: lerp(cur.mouth, tgt.mouth, t),
      chestTwist: lerp(cur.chestTwist, tgt.chestTwist, t),
    })

    // Compute target pose given active gesture and current time
    const getPoseForToken = (
      tokenStr: string,
      time: number,
      cx: number,
      cy: number,
      breath: number
    ): AvatarPose => {
      const lower = tokenStr.toLowerCase()

      // Default resting / natural breathing pose
      const defaultRest: AvatarPose = {
        lwx: cx - 74,
        lwy: cy + 62 + breath,
        lAngle: -0.15,
        lFingers: { thumb: 0.7, index: 0.7, middle: 0.7, ring: 0.7, pinky: 0.7 },
        rwx: cx + 74,
        rwy: cy + 62 + breath,
        rAngle: 0.15,
        rFingers: { thumb: 0.7, index: 0.7, middle: 0.7, ring: 0.7, pinky: 0.7 },
        headTiltX: 0,
        headTiltY: breath * 0.4,
        eyebrows: 0,
        mouth: 0,
        chestTwist: 0,
      }

      if (lower.includes('hello') || lower.includes('hi')) {
        const wave = Math.sin(time * 0.007)
        return {
          ...defaultRest,
          rwx: cx + 66 + wave * 18,
          rwy: cy - 96 + Math.cos(time * 0.007) * 6,
          rAngle: 0.28 + wave * 0.22,
          rFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
          headTiltY: 3 + wave * 2,
          mouth: 0.25,
        }
      }

      if (lower.includes('bye') || lower.includes('goodbye')) {
        const wave = Math.sin(time * 0.008)
        return {
          ...defaultRest,
          rwx: cx + 78 + wave * 28,
          rwy: cy - 105,
          rAngle: wave * 0.38,
          rFingers: { thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1 },
          headTiltX: wave * 3,
        }
      }

      if (lower.includes('how are you')) {
        const roll = time * 0.004
        return {
          ...defaultRest,
          lwx: cx - 58 + Math.cos(roll) * 16,
          lwy: cy - 24 + Math.sin(roll) * 12,
          lAngle: -0.3,
          lFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          rwx: cx + 58 - Math.cos(roll) * 16,
          rwy: cy - 24 + Math.sin(roll) * 12,
          rAngle: 0.3,
          rFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          eyebrows: 1.0, // Non-manual marker for question!
          headTiltY: 6,
          mouth: 0.4,
        }
      }

      if (lower.includes('nice to meet you')) {
        const slide = (Math.sin(time * 0.004) + 1) / 2
        return {
          ...defaultRest,
          lwx: cx - 14,
          lwy: cy - 26,
          lAngle: 0,
          lFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          rwx: cx + 42 - slide * 54,
          rwy: cy - 28,
          rAngle: 0,
          rFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          headTiltY: 3,
          mouth: 0.2,
        }
      }

      if (lower.includes('thank')) {
        const glide = (Math.sin(time * 0.004) + 1) / 2
        return {
          ...defaultRest,
          rwx: cx + 10 + glide * 34,
          rwy: cy - 86 + glide * 56,
          rAngle: -0.15 + glide * 0.35,
          rFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          headTiltY: 7,
          mouth: 0.3,
        }
      }

      if (lower.includes('please')) {
        const circleT = time * 0.006
        return {
          ...defaultRest,
          rwx: cx + 10 + Math.cos(circleT) * 16,
          rwy: cy - 46 + Math.sin(circleT) * 16,
          rAngle: 0,
          rFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          headTiltY: 3,
          mouth: 0.2,
        }
      }

      if (lower.includes('sorry')) {
        const circleT = time * 0.006
        return {
          ...defaultRest,
          rwx: cx + 10 + Math.cos(circleT) * 15,
          rwy: cy - 46 + Math.sin(circleT) * 15,
          rAngle: 0,
          rFingers: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 },
          headTiltX: 5,
          headTiltY: 4,
          mouth: 0.15,
        }
      }

      if (lower.includes('yes')) {
        const nod = Math.sin(time * 0.01)
        return {
          ...defaultRest,
          rwx: cx + 48,
          rwy: cy - 40 + nod * 16,
          rAngle: nod * 0.25,
          rFingers: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 },
          headTiltY: nod * 5,
        }
      }

      if (lower.includes('no')) {
        const snap = (Math.sin(time * 0.009) + 1) / 2
        return {
          ...defaultRest,
          rwx: cx + 50,
          rwy: cy - 44,
          rAngle: 0.1,
          rFingers: { thumb: 0.3, index: snap, middle: snap, ring: 0, pinky: 0 },
          headTiltX: Math.sin(time * 0.009) * 6,
        }
      }

      if (lower.includes('book')) {
        const open = (Math.sin(time * 0.004) + 1) / 2
        return {
          ...defaultRest,
          lwx: cx - 8 - open * 46,
          lwy: cy - 32,
          lAngle: -open * 0.45,
          lFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          rwx: cx + 8 + open * 46,
          rwy: cy - 32,
          rAngle: open * 0.45,
          rFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
        }
      }

      if (lower.includes('more')) {
        const tap = Math.abs(Math.sin(time * 0.006))
        return {
          ...defaultRest,
          lwx: cx - 8 - tap * 16,
          lwy: cy - 28,
          lAngle: -0.2,
          lFingers: { thumb: 0.3, index: 0.3, middle: 0.3, ring: 0.3, pinky: 0.3 },
          rwx: cx + 8 + tap * 16,
          rwy: cy - 28,
          rAngle: 0.2,
          rFingers: { thumb: 0.3, index: 0.3, middle: 0.3, ring: 0.3, pinky: 0.3 },
        }
      }

      if (lower.includes('help')) {
        const lift = (Math.sin(time * 0.005) + 1) / 2
        return {
          ...defaultRest,
          lwx: cx - 14,
          lwy: cy - 24 - lift * 22,
          lAngle: 0,
          lFingers: { thumb: 0.9, index: 1, middle: 1, ring: 1, pinky: 1 },
          rwx: cx - 14,
          rwy: cy - 48 - lift * 22,
          rAngle: 0,
          rFingers: { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 },
        }
      }

      if (lower.includes('love') || lower.includes('i love you')) {
        const sway = Math.sin(time * 0.003) * 6
        return {
          ...defaultRest,
          rwx: cx + 38 + sway,
          rwy: cy - 46,
          rAngle: sway * 0.03,
          rFingers: { thumb: 1, index: 1, middle: 0, ring: 0, pinky: 1 },
          headTiltX: sway * 0.5,
          mouth: 0.2,
        }
      }

      if (lower.includes('peace') || lower === 'v') {
        const sway = Math.sin(time * 0.003) * 4
        return {
          ...defaultRest,
          rwx: cx + 58,
          rwy: cy - 72 + sway,
          rAngle: 0.1,
          rFingers: { thumb: 0, index: 1, middle: 1, ring: 0, pinky: 0 },
        }
      }

      if (lower.includes('friend')) {
        const hook = (Math.sin(time * 0.005) + 1) / 2
        return {
          ...defaultRest,
          lwx: cx - 10 + hook * 4,
          lwy: cy - 30,
          lFingers: { thumb: 0.3, index: 0.6, middle: 0, ring: 0, pinky: 0 },
          rwx: cx + 10 - hook * 4,
          rwy: cy - 30,
          rFingers: { thumb: 0.3, index: 0.6, middle: 0, ring: 0, pinky: 0 },
        }
      }

      if (lower.includes('my name is')) {
        const tap = Math.sin(time * 0.008) * 12
        return {
          ...defaultRest,
          lwx: cx - 12,
          lwy: cy - 30,
          lFingers: { thumb: 0, index: 0.8, middle: 0.8, ring: 0, pinky: 0 },
          rwx: cx + 12,
          rwy: cy - 30 + tap,
          rFingers: { thumb: 0, index: 0.8, middle: 0.8, ring: 0, pinky: 0 },
        }
      }

      if (lower.includes('good morning')) {
        const sun = (Math.sin(time * 0.004) + 1) / 2
        return {
          ...defaultRest,
          lwx: cx - 45,
          lwy: cy - 10,
          lFingers: { thumb: 0.8, index: 1, middle: 1, ring: 1, pinky: 1 },
          rwx: cx + 25 - sun * 40,
          rwy: cy - 70 + sun * 50,
          rFingers: { thumb: 0.8, index: 1, middle: 1, ring: 1, pinky: 1 },
          headTiltY: 4,
        }
      }

      // Manual Alphabet A through Z
      const char = (tokenStr || 'A').toUpperCase().charAt(0)
      const bob = Math.sin(time * 0.003) * 3
      let rFingers: FingerPose = { thumb: 0.7, index: 0.7, middle: 0.7, ring: 0.7, pinky: 0.7 }

      if (char === 'A') rFingers = { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 0 }
      else if (char === 'B') rFingers = { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 1 }
      else if (char === 'C') rFingers = { thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, pinky: 0.5 }
      else if (char === 'D') rFingers = { thumb: 0.2, index: 1, middle: 0.2, ring: 0.2, pinky: 0.2 }
      else if (char === 'E') rFingers = { thumb: 0.1, index: 0.1, middle: 0.1, ring: 0.1, pinky: 0.1 }
      else if (char === 'F') rFingers = { thumb: 0.2, index: 0.2, middle: 1, ring: 1, pinky: 1 }
      else if (char === 'G') rFingers = { thumb: 0.8, index: 0.8, middle: 0, ring: 0, pinky: 0 }
      else if (char === 'H') rFingers = { thumb: 0, index: 0.8, middle: 0.8, ring: 0, pinky: 0 }
      else if (char === 'I') rFingers = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 1 }
      else if (char === 'J') rFingers = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 1 }
      else if (char === 'K') rFingers = { thumb: 0.5, index: 1, middle: 0.7, ring: 0, pinky: 0 }
      else if (char === 'L') rFingers = { thumb: 1, index: 1, middle: 0, ring: 0, pinky: 0 }
      else if (char === 'M' || char === 'N' || char === 'S') rFingers = { thumb: 0.1, index: 0, middle: 0, ring: 0, pinky: 0 }
      else if (char === 'O') rFingers = { thumb: 0.3, index: 0.3, middle: 0.3, ring: 0.3, pinky: 0.3 }
      else if (char === 'P') rFingers = { thumb: 0.5, index: 1, middle: 0.7, ring: 0, pinky: 0 }
      else if (char === 'Q') rFingers = { thumb: 0.8, index: 0.8, middle: 0, ring: 0, pinky: 0 }
      else if (char === 'R') rFingers = { thumb: 0, index: 1, middle: 1, ring: 0, pinky: 0 }
      else if (char === 'U') rFingers = { thumb: 0, index: 1, middle: 1, ring: 0, pinky: 0 }
      else if (char === 'V') rFingers = { thumb: 0, index: 1, middle: 1, ring: 0, pinky: 0 }
      else if (char === 'W') rFingers = { thumb: 0, index: 1, middle: 1, ring: 1, pinky: 0 }
      else if (char === 'X') rFingers = { thumb: 0, index: 0.4, middle: 0, ring: 0, pinky: 0 }
      else if (char === 'Y') rFingers = { thumb: 1, index: 0, middle: 0, ring: 0, pinky: 1 }
      else if (char === 'Z') rFingers = { thumb: 0, index: 1, middle: 0, ring: 0, pinky: 0 }

      return {
        ...defaultRest,
        rwx: cx + 58,
        rwy: cy - 64 + bob,
        rAngle: 0.1,
        rFingers,
      }
    }

    // ── Drawing Subroutines ─────────────────────────────────────────────────
    // Volumetric 3D Arm Cylinder
    const draw3DLimb = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      radius: number,
      colorStart: string,
      colorEnd: string
    ) => {
      const dx = x2 - x1
      const dy = y2 - y1
      const dist = Math.hypot(dx, dy)
      if (dist < 1) return

      const nx = -dy / dist
      const ny = dx / dist

      ctx.save()
      const grad = ctx.createLinearGradient(
        x1 + nx * radius, y1 + ny * radius,
        x1 - nx * radius, y1 - ny * radius
      )
      grad.addColorStop(0, colorStart)
      grad.addColorStop(0.5, '#64748b')
      grad.addColorStop(1, colorEnd)

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(x1 + nx * radius, y1 + ny * radius)
      ctx.lineTo(x2 + nx * (radius * 0.8), y2 + ny * (radius * 0.8))
      ctx.lineTo(x2 - nx * (radius * 0.8), y2 - ny * (radius * 0.8))
      ctx.lineTo(x1 - nx * radius, y1 - ny * radius)
      ctx.closePath()
      ctx.fill()

      // Rim glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()
    }

    // Volumetric 3D Ball Joint
    const drawBallJoint = (x: number, y: number, r: number, glowColor: string) => {
      ctx.save()
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.4, glowColor)
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 1.2
      ctx.stroke()
      ctx.restore()
    }

    // 5-Finger Volumetric Hand
    const drawVolumetricHand = (
      wristX: number,
      wristY: number,
      handAngle: number,
      fingers: FingerPose,
      isLeft: boolean,
      themeColor: string
    ) => {
      ctx.save()
      ctx.translate(wristX, wristY)
      ctx.rotate(handAngle)
      const dir = isLeft ? -1 : 1

      // Wrist Cuff ring
      ctx.fillStyle = '#1e293b'
      ctx.strokeStyle = themeColor
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Palm base
      const palmGrad = ctx.createRadialGradient(0, -9, 2, 0, -9, 14)
      palmGrad.addColorStop(0, '#38bdf8')
      palmGrad.addColorStop(0.7, themeColor)
      palmGrad.addColorStop(1, '#0f172a')
      ctx.fillStyle = palmGrad
      ctx.beginPath()
      ctx.ellipse(0, -9, 13, 11, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.stroke()

      // 5 Articulated Fingers (Thumb, Index, Middle, Ring, Pinky)
      const fingerBones = [
        { angle: -0.72 * dir, len: 18, state: fingers.thumb, kx: -7 * dir, ky: -6 },
        { angle: -0.24 * dir, len: 24, state: fingers.index, kx: -5 * dir, ky: -16 },
        { angle: 0, len: 26, state: fingers.middle, kx: 0, ky: -18 },
        { angle: 0.24 * dir, len: 23, state: fingers.ring, kx: 5 * dir, ky: -16 },
        { angle: 0.52 * dir, len: 19, state: fingers.pinky, kx: 7 * dir, ky: -12 },
      ]

      fingerBones.forEach(f => {
        const ext = 0.35 + f.state * 0.65
        const seg1 = (f.len * ext) * 0.52
        const seg2 = (f.len * ext) * 0.48

        // Knuckle
        const kx = f.kx
        const ky = f.ky

        // Mid Joint
        const jx = kx + Math.sin(f.angle) * seg1
        const jy = ky - Math.cos(f.angle) * seg1

        // Fingertip with curl offset
        const curl = (1 - f.state) * 7 * dir
        const tx = jx + Math.sin(f.angle) * seg2 + curl
        const ty = jy - Math.cos(f.angle) * seg2 + (1 - f.state) * 5

        // Draw Knuckle joint
        drawBallJoint(kx, ky, 3, themeColor)

        // Proximal bone segment
        ctx.strokeStyle = themeColor
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(kx, ky)
        ctx.lineTo(jx, jy)
        ctx.stroke()

        // Mid joint node
        drawBallJoint(jx, jy, 2.5, '#a855f7')

        // Distal bone segment
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(jx, jy)
        ctx.lineTo(tx, ty)
        ctx.stroke()

        // Fingertip glowing sensor pad
        ctx.fillStyle = '#67e8f9'
        ctx.beginPath()
        ctx.arc(tx, ty, 3.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      ctx.restore()
    }

    // ── Main 60 FPS Render Cycle ────────────────────────────────────────────
    const render = (timestamp: number) => {
      if (!isRunning) return

      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const dt = Math.min(0.08, (timestamp - lastTimeRef.current) / 1000)
      lastTimeRef.current = timestamp

      // Auto playback sequence step
      if (isPlaying && parsedTokens.length > 0) {
        tokenTimerRef.current += dt * 1000
        if (tokenTimerRef.current >= speed) {
          tokenTimerRef.current = 0
          setActiveTokenIdx(prev => {
            if (prev >= parsedTokens.length - 1) {
              if (isLooping) return 0
              setIsPlaying(false)
              return prev
            }
            return prev + 1
          })
        }
      }

      // Responsive Retina resolution
      const width = 480
      const height = 400
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr
        canvas.height = height * dpr
      }

      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      // Perspective Cyber Background Stage
      ctx.fillStyle = '#050816'
      ctx.fillRect(0, 0, width, height)

      // Holographic floor grid with receding perspective
      const vpY = height * 0.46
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x <= width; x += 40) {
        ctx.beginPath()
        ctx.moveTo(width / 2, vpY)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = vpY + 20; y <= height; y += 28) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Camera transformation
      const cx = width / 2
      const cy = height / 2 + 10
      const time = timestamp

      if (cameraPreset === 'angled') {
        ctx.translate(cx, cy)
        ctx.scale(0.96, 0.98)
        ctx.transform(1, 0, -0.1, 1, 0, 0)
        ctx.translate(-cx, -cy)
      } else if (cameraPreset === 'closeup') {
        ctx.translate(cx, cy)
        ctx.scale(1.28, 1.28)
        ctx.translate(-cx, -cy + 36)
      }

      // Living natural idle breathing & weight shift
      const breath = Math.sin(time * 0.0024) * 3
      const token = parsedTokens[activeTokenIdx]
      const tokenText = token?.text || 'Hello'

      // Calculate desired target pose
      const targetPose = getPoseForToken(tokenText, time, cx, cy, breath)

      // Smooth interpolation (lerp) toward target pose
      if (!curPoseRef.current) {
        curPoseRef.current = targetPose
      } else {
        const blend = Math.min(1, dt * 11)
        curPoseRef.current = lerpPose(curPoseRef.current, targetPose, blend)
      }
      const pose = curPoseRef.current

      // Soft contact shadow on floor beneath avatar
      const shadowGrad = ctx.createRadialGradient(cx, cy + 120, 10, cx, cy + 120, 85)
      shadowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)')
      shadowGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.12)')
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = shadowGrad
      ctx.beginPath()
      ctx.ellipse(cx, cy + 120, 85, 24, 0, 0, Math.PI * 2)
      ctx.fill()

      // Particle sparks emission from active right hand
      if (Math.random() < 0.35) {
        particlesRef.current.push({
          x: pose.rwx + (Math.random() - 0.5) * 12,
          y: pose.rwy + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2 - 0.5,
          alpha: 1,
          color: Math.random() > 0.5 ? '#38bdf8' : '#c084fc',
        })
      }

      // Update & render particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= dt * 1.8
        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1)
        } else {
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha * 0.8
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      // Motion trail ribbon on active right wrist
      trailRef.current.push({ x: pose.rwx, y: pose.rwy, alpha: 0.8, color: '#06b6d4' })
      if (trailRef.current.length > 24) trailRef.current.shift()

      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      for (let i = 1; i < trailRef.current.length; i++) {
        const pt1 = trailRef.current[i - 1]
        const pt2 = trailRef.current[i]
        pt1.alpha *= 0.94
        ctx.strokeStyle = `rgba(6, 182, 212, ${pt1.alpha * 0.6})`
        ctx.beginPath()
        ctx.moveTo(pt1.x, pt1.y)
        ctx.lineTo(pt2.x, pt2.y)
        ctx.stroke()
      }

      // Avatar Body Anchors
      const headX = cx + pose.headTiltX
      const headY = cy - 110 + breath + pose.headTiltY

      // Shoulders
      const lsx = cx - 62
      const lsy = cy - 58 + breath
      const rsx = cx + 62
      const rsy = cy - 58 + breath

      // Elbow Inverse Kinematics
      const lex = (lsx + pose.lwx) / 2 - 28
      const ley = Math.max(lsy, pose.lwy) - 6
      const rex = (rsx + pose.rwx) / 2 + 28
      const rey = Math.max(rsy, pose.rwy) - 6

      // ── Draw Volumetric Torso ─────────────────────────────────────────────
      // Neck
      const neckGrad = ctx.createLinearGradient(cx - 10, headY + 28, cx + 10, cy - 65)
      neckGrad.addColorStop(0, '#475569')
      neckGrad.addColorStop(1, '#1e293b')
      ctx.fillStyle = neckGrad
      ctx.fillRect(cx - 8, headY + 24, 16, cy - 65 - (headY + 24) + breath)

      // Athletic Chest Plate
      const chestGrad = ctx.createLinearGradient(cx - 50, cy - 65, cx + 50, cy + 45)
      chestGrad.addColorStop(0, '#1e1b4b')
      chestGrad.addColorStop(0.5, '#312e81')
      chestGrad.addColorStop(1, '#0f172a')
      ctx.fillStyle = chestGrad
      ctx.beginPath()
      ctx.moveTo(lsx, lsy)
      ctx.lineTo(rsx, rsy)
      ctx.lineTo(cx + 34, cy + 48)
      ctx.lineTo(cx - 34, cy + 48)
      ctx.closePath()
      ctx.fill()

      // Chest neon border seams
      ctx.strokeStyle = '#06b6d4'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Pulsing Power Core Emblem
      const coreR = 10 + Math.sin(time * 0.003) * 1.5
      const coreGrad = ctx.createRadialGradient(cx, cy - 18 + breath, 2, cx, cy - 18 + breath, coreR)
      coreGrad.addColorStop(0, '#ffffff')
      coreGrad.addColorStop(0.4, '#38bdf8')
      coreGrad.addColorStop(1, 'rgba(168, 85, 247, 0)')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy - 18 + breath, coreR, 0, Math.PI * 2)
      ctx.fill()

      // ── Draw Volumetric Limbs ─────────────────────────────────────────────
      // Left Arm: Shoulder -> Elbow -> Wrist
      draw3DLimb(lsx, lsy, lex, ley, 8, '#312e81', '#1e293b')
      draw3DLimb(lex, ley, pose.lwx, pose.lwy, 7, '#1e293b', '#10b981')

      // Right Arm: Shoulder -> Elbow -> Wrist
      draw3DLimb(rsx, rsy, rex, rey, 8, '#312e81', '#1e293b')
      draw3DLimb(rex, rey, pose.rwx, pose.rwy, 7, '#1e293b', '#06b6d4')

      // Ball joints
      drawBallJoint(lsx, lsy, 9, '#818cf8')
      drawBallJoint(rsx, rsy, 9, '#818cf8')
      drawBallJoint(lex, ley, 7.5, '#22d3ee')
      drawBallJoint(rex, rey, 7.5, '#22d3ee')

      // ── Draw Volumetric 3D Head ───────────────────────────────────────────
      // Head sphere with 3D radial gradient
      const headGrad = ctx.createRadialGradient(headX - 8, headY - 8, 4, headX, headY, 32)
      headGrad.addColorStop(0, '#c084fc')
      headGrad.addColorStop(0.6, '#6b21a8')
      headGrad.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = headGrad
      ctx.beginPath()
      ctx.arc(headX, headY, 28, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#a855f7'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Cyber Visor / Eyes (Blinks naturally every ~3.5s)
      const isBlink = (time % 3600) < 140
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.roundRect(headX - 16, headY - 6, 32, 11, 4)
      ctx.fill()
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      if (!isBlink) {
        ctx.fillStyle = '#38bdf8'
        ctx.beginPath()
        ctx.roundRect(headX - 12, headY - 4, 10, 7, 2)
        ctx.roundRect(headX + 2, headY - 4, 10, 7, 2)
        ctx.fill()
      } else {
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(headX - 12, headY)
        ctx.lineTo(headX - 2, headY)
        ctx.moveTo(headX + 2, headY)
        ctx.lineTo(headX + 12, headY)
        ctx.stroke()
      }

      // Expressive Eyebrows (Crucial ASL Grammatical Marker!)
      const browOffset = pose.eyebrows * 5
      ctx.strokeStyle = '#67e8f9'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(headX - 14, headY - 11 - browOffset)
      ctx.lineTo(headX - 3, headY - 11 - browOffset * 1.3)
      ctx.moveTo(headX + 3, headY - 11 - browOffset * 1.3)
      ctx.lineTo(headX + 14, headY - 11 - browOffset)
      ctx.stroke()

      // Animated mouth line / speaking opening
      if (pose.mouth > 0.1) {
        ctx.fillStyle = '#38bdf8'
        ctx.beginPath()
        ctx.ellipse(headX, headY + 14, 6, 3 * pose.mouth + 1, 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.strokeStyle = '#a855f7'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(headX - 6, headY + 14)
        ctx.lineTo(headX + 6, headY + 14)
        ctx.stroke()
      }

      // Cyber ear headset modules
      ctx.fillStyle = '#06b6d4'
      ctx.beginPath()
      ctx.arc(headX - 28, headY, 5, 0, Math.PI * 2)
      ctx.arc(headX + 28, headY, 5, 0, Math.PI * 2)
      ctx.fill()

      // ── Draw Volumetric Hands & Fingers ───────────────────────────────────
      drawVolumetricHand(pose.lwx, pose.lwy, pose.lAngle, pose.lFingers, true, '#10b981')
      drawVolumetricHand(pose.rwx, pose.rwy, pose.rAngle, pose.rFingers, false, '#06b6d4')

      // Holographic targeting reticle around active right hand
      const retRot = time * 0.002
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(pose.rwx, pose.rwy, 28, retRot, retRot + Math.PI * 1.7)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.restore()
      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)

    return () => {
      isRunning = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, isLooping, activeTokenIdx, parsedTokens, speed, cameraPreset])

  // ── Quiz / Practice Arena State ───────────────────────────────────────────
  const [quizScore, setQuizScore] = useState(0)
  const [quizStreak, setQuizStreak] = useState(0)
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false)

  const QUIZ_QUESTIONS = [
    {
      question: 'Which sign has the palm facing INWARD toward the signer?',
      options: ['Number 2 (ASL)', 'Letter B', 'Letter L', 'Letter V'],
      answer: 'Number 2 (ASL)',
      explanation: 'In ASL, numbers 1 through 5 are strictly signed with the palm facing inward toward the signer, whereas the V peace sign faces outward.',
    },
    {
      question: 'How do you sign "YES" in American Sign Language?',
      options: ['Wave your open hand left and right', 'Make an "S" fist and nod it up and down from the wrist', 'Tap your index finger and thumb twice', 'Point your thumb straight up'],
      answer: 'Make an "S" fist and nod it up and down from the wrist',
      explanation: 'The sign for YES is made with a fist (S handshape) bobbing up and down, mimicking a head nodding yes.',
    },
    {
      question: 'When introducing your name ("My name is Alex"), what is the ASL sign for "NAME"?',
      options: ['Point to your forehead', 'Tap two "H" handshapes together across fingers twice', 'Spell out the letters N-A-M-E', 'Salute from the temple'],
      answer: 'Tap two "H" handshapes together across fingers twice',
      explanation: 'NAME is formed by tapping the dominant H handshape twice on top of the non-dominant H handshape.',
    },
    {
      question: 'What manual parameter indicates a question in ASL?',
      options: ['Bouncing your hand up and down', 'Non-manual facial expressions (raised or furrowed eyebrows)', 'Signing with two hands instead of one', 'Adding a question mark gesture at the end'],
      answer: 'Non-manual facial expressions (raised or furrowed eyebrows)',
      explanation: 'Eyebrow position (raised for Yes/No, furrowed for WH questions) is the definitive grammatical marker of questions in ASL.',
    },
  ]

  const handleQuizAnswer = (option: string) => {
    if (isAnswerRevealed) return
    setSelectedOption(option)
    setIsAnswerRevealed(true)
    if (option === QUIZ_QUESTIONS[currentQuizIdx].answer) {
      setQuizScore(prev => prev + 10)
      setQuizStreak(prev => prev + 1)
    } else {
      setQuizStreak(0)
    }
  }

  const nextQuizQuestion = () => {
    setIsAnswerRevealed(false)
    setSelectedOption(null)
    setCurrentQuizIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length)
  }

  // ── Handbook State ────────────────────────────────────────────────────────
  const [currentChapter, setCurrentChapter] = useState(0)
  const [readChapters, setReadChapters] = useState<number[]>([0])

  const toggleChapterRead = (idx: number) => {
    if (readChapters.includes(idx)) {
      setReadChapters(readChapters.filter(i => i !== idx))
    } else {
      setReadChapters([...readChapters, idx])
    }
  }

  // ── Video Library State ───────────────────────────────────────────────────
  const [videoFilter, setVideoFilter] = useState('All')
  const [videoSearch, setVideoSearch] = useState('')
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const videoCategories = ['All', 'Alphabet', 'Phrases', 'Greetings', 'Numbers', 'Vocabulary']
  const filteredVideos = YOUTUBE_LESSONS.filter(v => {
    const matchCat = videoFilter === 'All' || v.category === videoFilter
    const matchSearch = v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
                        v.desc.toLowerCase().includes(videoSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const currentToken = parsedTokens[activeTokenIdx]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 3D Master Navigation Banner */}
      <div className="card-3d p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive Sign Learning Suite
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Learning Hub & Rylo Studio
            </h2>
            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              Explore 2-Way translation like Rylo's Sign.mt, test your skills in the Practice Quiz Arena, progress through multi-level curriculum lessons, read the interactive handbook, or stream video masterclasses.
            </p>
          </div>

          {/* Sub-Tab Navigation Switcher */}
          <div className="flex flex-wrap items-center p-1.5 rounded-2xl bg-gray-950 border border-gray-800 shadow-inner gap-1">
            <button
              onClick={() => setActiveSubTab('rylo-translate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'rylo-translate'
                  ? 'btn-3d text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Rylo Translate Studio</span>
            </button>

            <button
              onClick={() => setActiveSubTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'quiz'
                  ? 'btn-3d text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Practice Arena</span>
            </button>

            <button
              onClick={() => setActiveSubTab('curriculum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'curriculum'
                  ? 'btn-3d text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>4-Level Curriculum</span>
            </button>

            <button
              onClick={() => setActiveSubTab('book')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'book'
                  ? 'btn-3d text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ASL Handbook</span>
            </button>

            <button
              onClick={() => setActiveSubTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeSubTab === 'videos'
                  ? 'btn-3d text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Library</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          1. RYLO TRANSLATE STUDIO (Volumetric 60 FPS 3D Kinetic Studio)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'rylo-translate' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Studio Master Header Bar */}
          <div className="card-3d p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-xl shadow-cyan-500/20 shrink-0">
                <span>⚡</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    SignBridge 60 FPS Kinetic 3D Avatar Studio
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>60 FPS Active Motion Engine</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Volumetric 3D humanoid avatar with articulated finger bones, living idle dynamics, facial markers & real-time gesture choreography.
                </p>
              </div>
            </div>

            {/* Rylo Cloud External Launcher */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              <a
                href="https://rylo.com/sign/translate/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 bg-gradient-to-r from-orange-600 to-purple-600 hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
                title="Launch official Rylo Sign Language Translator in dedicated full browser tab"
              >
                <Globe className="w-4 h-4 text-orange-200" />
                <span>Launch Official Rylo (External Tab)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Studio Workspace */}
          <div className="space-y-6">
            {/* Translation Direction Selector */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Real-Time Neural Translation Direction
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-xl border border-gray-800 text-xs">
                <span className="px-3 py-1 font-bold text-purple-300">
                  {translationDirection === 'text-to-sign' ? 'English (Spoken / Written)' : 'American Sign Language (ASL)'}
                </span>
                <button
                  onClick={() => setTranslationDirection(translationDirection === 'text-to-sign' ? 'sign-to-text' : 'text-to-sign')}
                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-transform hover:scale-110"
                  title="Switch Translation Direction"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <span className="px-3 py-1 font-bold text-emerald-300">
                  {translationDirection === 'text-to-sign' ? 'American Sign Language (ASL)' : 'English (Spoken / Written)'}
                </span>
              </div>
            </div>

            {/* Two-Column Studio Layout */}
            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* Left Column: Input, Suggestions & Timeline (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="card-3d p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Text to 3D Sign Synthesizer
                    </span>
                    <span className="text-[11px] font-mono text-purple-400">
                      {ryloInput.length} Characters • {parsedTokens.length} Gestures
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={ryloInput}
                    onChange={(e) => {
                      setRyloInput(e.target.value)
                      parseTextToTokens(e.target.value)
                    }}
                    placeholder="Enter English sentence or phrase to watch avatar sign..."
                    className="w-full p-4 rounded-2xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 resize-none font-medium leading-relaxed"
                  />

                  {/* Preset Expression Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-400 font-semibold">Test Common Expressions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Hello nice to meet you',
                        'How are you',
                        'Thank you please',
                        'Book more help',
                        'Peace and love',
                        'Good morning',
                        'Yes and no',
                        'My name is Alex',
                      ].map((phrase) => (
                        <button
                          key={phrase}
                          onClick={() => {
                            setRyloInput(phrase)
                            parseTextToTokens(phrase)
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                            ryloInput.toLowerCase() === phrase.toLowerCase()
                              ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                              : 'bg-gray-950 border-gray-800 text-gray-300 hover:border-purple-500/50 hover:text-white'
                          }`}
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Timeline Breakdown */}
                  {parsedTokens.length > 0 && (
                    <div className="pt-3 border-t border-gray-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-bold">Choreographed Timeline ({parsedTokens.length} Signs)</span>
                        <span className="font-mono text-cyan-400">
                          Sign {activeTokenIdx + 1} of {parsedTokens.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-gray-950 border border-gray-800">
                        {parsedTokens.map((t, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setActiveTokenIdx(idx)
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              activeTokenIdx === idx
                                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-400/50'
                                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                            }`}
                          >
                            <span className="text-sm">
                              {t.data?.handshape || '🤟'}
                            </span>
                            <span>{t.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ASL Non-Manual Grammar Guide */}
                <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80 space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Non-Manual Grammar Markers</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    In American Sign Language, expressions carry grammar! Notice the avatar raising its eyebrows for question phrases like <em>"How are you"</em> and nodding for <em>"Yes"</em> and <em>"Thank you"</em>.
                  </p>
                </div>
              </div>

              {/* Right Column: Volumetric 3D Avatar Stage & Timeline (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="card-3d p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                  
                  {/* Visualizer Top Bar & Camera Controls */}
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                        Volumetric 3D Avatar Stage
                      </span>
                    </div>

                    {/* Camera View Angle Selector */}
                    <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
                      <button
                        onClick={() => setCameraPreset('front')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          cameraPreset === 'front' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Frontal perspective"
                      >
                        🎥 Front View
                      </button>
                      <button
                        onClick={() => setCameraPreset('angled')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          cameraPreset === 'angled' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="3/4 3D angled perspective"
                      >
                        📐 3/4 3D View
                      </button>
                      <button
                        onClick={() => setCameraPreset('closeup')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                          cameraPreset === 'closeup' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Zoomed close-up on hands"
                      >
                        🔍 Hand Detail
                      </button>
                    </div>
                  </div>

                  {/* Main 3D Canvas Stage */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl bg-gray-950 border border-purple-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
                    <canvas ref={avatarCanvasRef} className="w-full h-full object-contain" />
                    
                    {/* Live FPS & Engine HUD Overlay */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gray-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>60 FPS • LIVE KINEMATICS</span>
                    </div>

                    {/* Loop Indicator Overlay */}
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isLooping
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : 'bg-gray-950/80 border-gray-800 text-gray-500'
                      }`}
                      title={isLooping ? 'Continuous loop enabled' : 'Play once and stop'}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLooping ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                      <span>{isLooping ? 'Loop ON' : 'Loop OFF'}</span>
                    </button>

                    {/* Active Sign Floating Badge */}
                    <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-gray-950/90 border border-purple-500/50 text-xs font-bold text-purple-200 shadow-xl flex items-center gap-2">
                      <span className="text-base">{currentToken?.data?.handshape || '🤟'}</span>
                      <span>Sign: "{currentToken?.text || 'Hello'}"</span>
                    </div>
                  </div>

                  {/* Player Timeline Bar & Speed Controls */}
                  <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTokenIdx(Math.max(0, activeTokenIdx - 1))
                        }}
                        disabled={activeTokenIdx === 0}
                        className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 disabled:opacity-30 transition-colors"
                        title="Previous Pose"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`btn-3d px-6 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg ${
                          isPlaying
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 shadow-cyan-500/25 ring-2 ring-cyan-500/40'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                        }`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-white" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>Play Animation</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTokenIdx(Math.min(parsedTokens.length - 1, activeTokenIdx + 1))
                        }}
                        disabled={activeTokenIdx === parsedTokens.length - 1}
                        className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 disabled:opacity-30 transition-colors"
                        title="Next Pose"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400 font-semibold mr-1">Speed:</span>
                      {[
                        { label: '0.5x', ms: 1600 },
                        { label: '1.0x', ms: 1000 },
                        { label: '1.5x', ms: 600 },
                      ].map(s => (
                        <button
                          key={s.label}
                          onClick={() => setSpeed(s.ms)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                            speed === s.ms
                              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md'
                              : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Sign Detailed Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-gray-950 border border-purple-500/20 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-purple-900/20">
                      {currentToken?.data?.handshape || '🤟'}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm font-extrabold">
                          "{currentToken?.text || 'Hello'}"
                        </strong>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase">
                          {currentToken?.type === 'phrase' ? 'ASL Phrase Sign' : 'Manual Alphabet'}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {currentToken?.type === 'phrase'
                          ? currentToken.data.action
                          : currentToken?.data?.desc || 'Hold hand steady with proper finger alignment.'}
                      </p>
                      {currentToken?.data?.tip && (
                        <p className="text-[11px] text-purple-300 italic">
                          💡 Tip: {currentToken.data.tip}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. PRACTICE ARENA & INTERACTIVE QUIZ
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'quiz' && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Score & Streak Board (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-3d p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Practice Stats
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Level 1 Novice
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5" />
                    <span>{quizScore}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Total Score</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                  <div className="text-3xl font-black text-rose-400 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" />
                    <span>{quizStreak}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Streak</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-950 border border-purple-500/20 space-y-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                  Did You Know?
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Practicing manual recognition with rapid multiple-choice drills accelerates brain recall by over 300% compared to passive reading alone.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Question Card (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="card-3d p-8 rounded-3xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                  Question {currentQuizIdx + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  +10 Points per Correct Answer
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {QUIZ_QUESTIONS[currentQuizIdx].question}
              </h3>

              {/* Options Grid */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                {QUIZ_QUESTIONS[currentQuizIdx].options.map((option) => {
                  const isChosen = selectedOption === option
                  const isCorrect = option === QUIZ_QUESTIONS[currentQuizIdx].answer

                  let btnStyle = 'bg-gray-950 border-gray-800 hover:border-purple-500/50 text-gray-200'
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/40'
                    } else if (isChosen) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300'
                    } else {
                      btnStyle = 'bg-gray-950/40 border-gray-800 text-gray-500 opacity-50'
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleQuizAnswer(option)}
                      disabled={isAnswerRevealed}
                      className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isAnswerRevealed && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswerRevealed && (
                <div className="p-5 rounded-2xl bg-gray-950 border border-purple-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                      Explanation:
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {QUIZ_QUESTIONS[currentQuizIdx].explanation}
                  </p>
                  <button
                    onClick={nextQuizQuestion}
                    className="btn-3d px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 ml-auto"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          3. MULTI-LEVEL CURRICULUM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'curriculum' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-5">
            {CURRICULUM_MODULES.map((mod) => (
              <div key={mod.id} className="card-3d p-6 rounded-3xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                      {mod.level} • {mod.badge}
                    </span>
                    <span className="text-3xl">{mod.icon}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {mod.desc}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Core Topics Covered:
                    </span>
                    <ul className="space-y-1">
                      {mod.topics.map((t, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('rylo-translate')}
                  className="w-full py-3 rounded-xl bg-gray-950 hover:bg-purple-900/30 border border-gray-800 hover:border-purple-500/50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Practice in Rylo Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4. ASL HANDBOOK (BOOK)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'book' && (
        <div className="grid lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Chapter Table of Contents (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-3d p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Book Chapters
                </span>
                <span className="text-xs font-bold text-purple-400">
                  {readChapters.length} / {HANDBOOK_CHAPTERS.length} Read
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(readChapters.length / HANDBOOK_CHAPTERS.length) * 100}%` }}
                />
              </div>

              {/* Chapter Buttons List */}
              <div className="space-y-2">
                {HANDBOOK_CHAPTERS.map((chap, idx) => {
                  const isSelected = currentChapter === idx
                  const isRead = readChapters.includes(idx)
                  return (
                    <div
                      key={chap.id}
                      onClick={() => setCurrentChapter(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-900/30 border-purple-500/50 shadow-md shadow-purple-900/20'
                          : 'bg-gray-950/60 border-gray-800/80 hover:bg-gray-800/50 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{chap.icon}</span>
                        <div>
                          <div className={`text-xs font-bold tracking-tight ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {chap.title}
                          </div>
                          <span className="text-[10px] text-gray-500 block uppercase font-mono">
                            {chap.badge}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleChapterRead(idx)
                        }}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          isRead
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                        }`}
                        title={isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reading Pane (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {HANDBOOK_CHAPTERS[currentChapter] && (
              <div className="card-3d p-8 rounded-3xl space-y-6">
                
                {/* Chapter Banner */}
                <div className="flex items-start justify-between border-b border-gray-800 pb-5">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block">
                      Chapter {HANDBOOK_CHAPTERS[currentChapter].id} • {HANDBOOK_CHAPTERS[currentChapter].badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <span>{HANDBOOK_CHAPTERS[currentChapter].icon}</span>
                      <span>{HANDBOOK_CHAPTERS[currentChapter].title}</span>
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleChapterRead(currentChapter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      readChapters.includes(currentChapter)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{readChapters.includes(currentChapter) ? 'Read Completed' : 'Mark as Done'}</span>
                  </button>
                </div>

                {/* Chapter Sections */}
                <div className="space-y-6">
                  {HANDBOOK_CHAPTERS[currentChapter].sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-2 p-5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
                      <h4 className="text-base font-bold text-purple-300 tracking-tight">
                        {section.heading}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {section.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Navigation Bar */}
                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                    disabled={currentChapter === 0}
                    className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Chapter</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!readChapters.includes(currentChapter)) {
                        setReadChapters([...readChapters, currentChapter])
                      }
                      if (currentChapter < HANDBOOK_CHAPTERS.length - 1) {
                        setCurrentChapter(currentChapter + 1)
                      }
                    }}
                    disabled={currentChapter === HANDBOOK_CHAPTERS.length - 1}
                    className="btn-3d px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 transition-colors"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          5. YOUTUBE VIDEO LIBRARY
      ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'videos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Search & Category Filter */}
          <div className="card-3d p-6 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search video tutorials (e.g. 'Alphabet', 'Greetings')..."
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {videoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setVideoFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    videoFilter === cat
                      ? 'btn-3d text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Active Video Player Modal/Card */}
          {activeVideoId && (
            <div className="card-3d p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Now Playing ASL Masterclass
                </span>
                <button
                  onClick={() => setActiveVideoId(null)}
                  className="px-3 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  ✕ Close Video
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                  title="ASL Masterclass"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Video Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => setActiveVideoId(video.id)}
                className="group card-3d rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-950 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gray-950/40 group-hover:bg-gray-950/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/90 group-hover:bg-purple-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-gray-950/80 font-mono text-[10px] font-bold text-white border border-gray-800">
                    {video.duration}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold uppercase">
                        {video.category}
                      </span>
                      <span className="text-gray-400 font-medium">
                        {video.instructor}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                      {video.title}
                    </h4>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {video.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-semibold text-purple-400">
                    <span>Watch Tutorial</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-16 text-gray-500 text-sm">
              No tutorials matched your search criteria. Try a different query.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Learn
