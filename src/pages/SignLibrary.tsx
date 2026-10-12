import React, { useState } from 'react'
import { Search, BookOpen, ChevronRight } from 'lucide-react'

export const ALPHABETS_DATA: Record<string, { handshape: string; desc: string; tip: string }> = {
  A: { handshape: '✊', desc: 'Fist with thumb resting flat alongside the index finger.', tip: 'Keep palm facing outward toward the viewer.' },
  B: { handshape: '🖐️', desc: 'Four fingers straight up pressed together, thumb tucked across palm.', tip: 'Do not spread fingers apart.' },
  C: { handshape: '🤏', desc: 'Curve fingers and thumb into a semicircular "C" silhouette.', tip: 'Palm faces sideways slightly so curve is visible.' },
  D: { handshape: '☝️', desc: 'Index finger points straight up; middle, ring, pinky touch thumb tip.', tip: 'Forms the shape of a lowercase d.' },
  E: { handshape: '🤞', desc: 'Curl all finger tips down onto thumb top edge tightly.', tip: 'Thumb is tucked beneath fingernails.' },
  F: { handshape: '👌', desc: 'Index and thumb tips touch forming a circle; other 3 fingers extend up.', tip: 'Opposite of D.' },
  G: { handshape: '👉', desc: 'Index finger and thumb point sideways parallel to each other.', tip: 'Resembles gripping a small key.' },
  H: { handshape: '✌️', desc: 'Index and middle fingers extend horizontally sideways together.', tip: 'Thumb rests under fingers.' },
  I: { handshape: '🤙', desc: 'Pinky finger points straight up; rest of hand closed in a fist.', tip: 'Thumb crossed over other three fingers.' },
  J: { handshape: '🤙', desc: 'Hold "I" handshape, then trace a "J" hook path downwards in the air.', tip: 'Motion ends with pinky facing inward.' },
  K: { handshape: '✌️', desc: 'Index points up, middle angles forward, thumb touches middle finger joint.', tip: 'Distinct from V.' },
  L: { handshape: '👆', desc: 'Index points straight up and thumb extends sideways making a sharp "L".', tip: 'Most intuitive sign to remember.' },
  M: { handshape: '✊', desc: 'Three fingers (index, middle, ring) fold over thumb with pinky tucked.', tip: 'Three knuckles represent M.' },
  N: { handshape: '✊', desc: 'Two fingers (index and middle) fold over thumb with other fingers tucked.', tip: 'Two knuckles represent N.' },
  O: { handshape: '👌', desc: 'All fingertips curve to touch thumb tip forming a circular "O".', tip: 'Keep wrist steady.' },
  P: { handshape: '👇', desc: 'Same handshape as K, but oriented downwards pointing toward floor.', tip: 'Wrist tilts slightly down.' },
  Q: { handshape: '👇', desc: 'Same handshape as G, but pointing downwards toward ground.', tip: 'Thumb and index form a downward pinch.' },
  R: { handshape: '🤞', desc: 'Index and middle fingers crossed tightly.', tip: 'Like wishing for good luck.' },
  S: { handshape: '✊', desc: 'Tight fist with thumb folded over front of all fingers.', tip: 'Distinct from A where thumb is alongside.' },
  T: { handshape: '✊', desc: 'Thumb tucked strictly between index and middle finger knuckles.', tip: 'One knuckle over thumb.' },
  U: { handshape: '✌️', desc: 'Index and middle fingers straight up held together tightly.', tip: 'Fingers must touch, not open V.' },
  V: { handshape: '✌️', desc: 'Index and middle fingers extended apart in a clear "V" peace sign.', tip: 'Palm faces outward.' },
  W: { handshape: '🖐️', desc: 'Index, middle, and ring fingers spread up into a "W".', tip: 'Pinky touches thumb.' },
  X: { handshape: '☝️', desc: 'Index finger hooked/curled like a pirate hook; other fingers closed.', tip: 'Fingernail faces forward.' },
  Y: { handshape: '🤙', desc: 'Thumb and pinky extended wide; middle 3 fingers folded down.', tip: 'Classic "hang loose" or phone gesture.' },
  Z: { handshape: '☝️', desc: 'Index finger draws a zigzag "Z" shape in the air.', tip: 'Start top-left, stroke right, diag, right.' },
}

export const PHRASES_DATA = [
  {
    name: 'Hello',
    handshape: '👋',
    action: 'Open flat hand near temple, salute gently outward with a pleasant expression.',
    category: 'Greeting',
    example: 'Common everyday greeting in ASL.',
  },
  {
    name: 'How are you',
    handshape: '🤝',
    action: 'Both bent hands rotate outwards from chest, followed by pointing forward toward conversational partner.',
    category: 'Inquiry',
    example: 'In ASL grammar: "HOW YOU?" with slightly raised eyebrows.',
  },
  {
    name: 'My name is',
    handshape: '🙋',
    action: 'Flat hand on center chest (MY) + tap two H fingers together twice (NAME).',
    category: 'Introduction',
    example: 'Followed by fingerspelling your letters.',
  },
  {
    name: 'Nice to meet you',
    handshape: '🤝',
    action: 'Right hand slides across left palm (NICE) + both index fingers bring together (MEET) + point (YOU).',
    category: 'Greeting',
    example: 'Classic introductory polite greeting.',
  },
  {
    name: 'Bye',
    handshape: '👋',
    action: 'Open hand with fingers flexed waving smoothly side to side.',
    category: 'Farewell',
    example: 'Universal friendly sign.',
  },
  {
    name: 'See you later',
    handshape: '👀',
    action: 'V sign taps near cheek/eye outward (SEE) + point (YOU) + L hand pivots forward at wrist (LATER).',
    category: 'Farewell',
    example: 'Very common informal farewell.',
  },
  {
    name: 'Yes',
    handshape: '✊',
    action: 'Make an "S" fist and nod it up and down from the wrist like a nodding head.',
    category: 'Response',
    example: 'Always accompany with an affirmative head nod.',
  },
  {
    name: 'No',
    handshape: '✌️',
    action: 'Index and middle fingers tap firmly against thumb twice, resembling a quick beak closing.',
    category: 'Response',
    example: 'Accompany with a subtle head shake.',
  },
  {
    name: 'OK',
    handshape: '👌',
    action: 'Finger spelling O followed immediately by K, or the standard OK ring sign.',
    category: 'Response',
    example: 'Quick acknowledgment sign.',
  },
  {
    name: 'Good morning',
    handshape: '🌅',
    action: 'Flat hand from chin to palm (GOOD) + dominant hand rises up behind forearm like sunrise (MORNING).',
    category: 'Greeting',
    example: 'Warm morning greeting.',
  },
  {
    name: 'Good night',
    handshape: '🌙',
    action: 'Flat hand from chin (GOOD) + dominant hand cups downward over opposite wrist (NIGHT).',
    category: 'Farewell',
    example: 'Evening parting phrase.',
  },
  {
    name: 'Thank you',
    handshape: '🙏',
    action: 'Both flat hands with fingertips near chin moving smoothly forward toward the other person.',
    category: 'Polite',
    example: 'Universal sign of gratitude.',
  },
  {
    name: 'Book',
    handshape: '📖',
    action: 'Two flat hands held together with palms facing inward, opening outward like opening the pages of a book.',
    category: 'Two-Handed',
    example: 'Two-handed vocabulary sign.',
  },
  {
    name: 'More',
    handshape: '🤲',
    action: 'Both hands in flattened-O pinch shapes, fingertips tapping together repeatedly in front of chest.',
    category: 'Two-Handed',
    example: 'Essential request sign.',
  },
  {
    name: 'Help',
    handshape: '🤝',
    action: 'Closed fist with thumb up placed on top of opposite flat hand palm, moving upward together.',
    category: 'Two-Handed',
    example: 'Vital assistance sign.',
  },
  {
    name: 'Peace',
    handshape: '✌️',
    action: 'Both hands extended in V peace signs held outward steadily.',
    category: 'Two-Handed',
    example: 'Double victory / peace greeting.',
  },
  {
    name: 'Love',
    handshape: '🤟',
    action: 'Both hands showing the ILY (I Love You) sign, or wrists crossed over heart.',
    category: 'Two-Handed',
    example: 'Classic ASL expression of affection.',
  },
  {
    name: 'Clap',
    handshape: '👏',
    action: 'Both open hands raised and waving smoothly in the air (Deaf applause) or clapping palms.',
    category: 'Two-Handed',
    example: 'Deaf community applause & celebration.',
  },
]

interface SignLibraryProps {
  onSelectForTranslation?: (sign: string) => void
}

export const SignLibrary: React.FC<SignLibraryProps> = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'alphabets' | 'phrases'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<{ title: string; handshape: string; desc: string } | null>(null)

  const filteredAlphabets = Object.entries(ALPHABETS_DATA).filter(([letter, data]) => {
    if (activeCategory === 'phrases') return false
    const match = letter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  data.desc.toLowerCase().includes(searchTerm.toLowerCase())
    return match
  })

  const filteredPhrases = PHRASES_DATA.filter((phrase) => {
    if (activeCategory === 'alphabets') return false
    const match = phrase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  phrase.action.toLowerCase().includes(searchTerm.toLowerCase())
    return match
  })

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-gray-900/40 border border-purple-500/20 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Complete Sign Dictionary & Visual Reference
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore All 26 Alphabets & Key Phrases
          </h2>
          <p className="text-gray-300 text-base leading-relaxed">
            Every sign supported by our MediaPipe AI gesture detector. Learn the exact finger positions, thumb alignments, and hand motions to get 100% detection accuracy.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sign (e.g. 'Hello', 'A', 'Good morning')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-700/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900/90 border border-gray-800">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({Object.keys(ALPHABETS_DATA).length + PHRASES_DATA.length})
            </button>
            <button
              onClick={() => setActiveCategory('alphabets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'alphabets'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Alphabets (A-Z)
            </button>
            <button
              onClick={() => setActiveCategory('phrases')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === 'phrases'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Phrases (11)
            </button>
          </div>
        </div>
      </div>

      {/* Alphabets Section */}
      {filteredAlphabets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">
                English Alphabets (Fingerspelling)
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Showing {filteredAlphabets.length} letters
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredAlphabets.map(([letter, data]) => (
              <div
                key={letter}
                onClick={() => setSelectedItem({ title: `Letter ${letter}`, handshape: data.handshape, desc: `${data.desc} Tip: ${data.tip}` })}
                className="group p-4 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-purple-500/40 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer shadow-md hover:shadow-purple-500/10 flex flex-col items-center text-center space-y-2 relative"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-950 border border-gray-800/80 group-hover:border-purple-500/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {data.handshape}
                </div>
                <div>
                  <div className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">
                    {letter}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-tight">
                    {data.desc}
                  </p>
                </div>
                <div className="text-[10px] text-purple-400 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phrases Section */}
      {filteredPhrases.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <h3 className="text-xl font-bold text-white tracking-tight">
                Common Conversational Phrases
              </h3>
            </div>
            <span className="text-xs text-gray-400">
              Showing {filteredPhrases.length} phrases
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPhrases.map((phrase) => (
              <div
                key={phrase.name}
                onClick={() => setSelectedItem({ title: phrase.name, handshape: phrase.handshape, desc: `${phrase.action} (${phrase.example})` })}
                className="group p-5 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-indigo-500/40 hover:bg-gray-800/70 transition-all duration-200 cursor-pointer shadow-md hover:shadow-indigo-500/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {phrase.handshape}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                        "{phrase.name}"
                      </h4>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mt-0.5">
                        {phrase.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {phrase.action}
                </p>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{phrase.example}</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-3xl bg-gray-900 border border-purple-500/30 shadow-2xl space-y-5 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Sign Breakdown
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gray-950 border border-gray-800 flex items-center justify-center text-6xl shadow-inner">
                {selectedItem.handshape}
              </div>
              <h3 className="text-2xl font-black text-white">
                {selectedItem.title}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 text-sm text-gray-300 leading-relaxed">
              {selectedItem.desc}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-600/30"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignLibrary
