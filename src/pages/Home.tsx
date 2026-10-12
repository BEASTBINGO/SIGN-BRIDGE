import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Hand, BookOpen, ArrowRight, Zap, Eye, Globe } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' as const },
  }),
}

const floatingLetters = ['A', 'B', 'C', '👋', 'Z', 'Y', '🤟', 'W']

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-glow/8 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl" />
        
        {/* Floating ASL letters */}
        {floatingLetters.map((letter, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl font-bold text-purple-light/20 select-none"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.4, 0.15],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Text */}
            <div className="space-y-8">
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-purple-light font-medium"
              >
                <Zap className="w-4 h-4 text-neon-green" />
                Real-time Sign Language Recognition
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="font-display text-5xl md:text-7xl font-bold leading-tight"
              >
                Break the{' '}
                <span className="gradient-text">silence</span>
                {' '}barrier
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="section-subtitle max-w-xl"
              >
                SignBridge uses your laptop camera and AI to translate hand gestures into words — instantly.
                Learn, practice, and communicate in American Sign Language.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-4"
              >
                <Link to="/translate">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary flex items-center gap-2 text-base px-8 py-4"
                  >
                    <Hand className="w-5 h-5" />
                    Start Translating
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/learn">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary flex items-center gap-2 text-base px-8 py-4"
                  >
                    <BookOpen className="w-5 h-5" />
                    Learn ASL
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex gap-8 pt-4"
              >
                {[
                  { value: '26+', label: 'Alphabet Signs' },
                  { value: '11', label: 'Common Phrases' },
                  { value: 'Real-time', label: 'Detection Speed' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-purple-light">{stat.value}</div>
                    <div className="text-sm text-white/50">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
              className="relative"
            >
              <div className="glass-card p-8 purple-glow">
                {/* Fake camera feed */}
                <div className="aspect-video bg-navy-900 rounded-xl overflow-hidden relative mb-6 neon-border">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-7xl"
                      >
                        🤟
                      </motion.div>
                      <div className="text-neon-green font-mono text-sm">Detecting hand...</div>
                    </div>
                    {/* Scan line */}
                    <div className="scan-line" />
                  </div>
                  {/* Corner brackets */}
                  {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-5 h-5 border-neon-green/60 ${i < 2 ? 'border-t' : 'border-b'} ${i % 2 === 0 ? 'border-l' : 'border-r'}`} />
                  ))}
                </div>

                {/* Detection output */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    <span className="text-xs text-white/50 font-mono">LIVE DETECTION</span>
                  </div>
                  <div className="flex gap-3">
                    {['H', 'E', 'L', 'L', 'O'].map((letter, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.15, type: 'spring' }}
                        className="w-10 h-10 glass-card flex items-center justify-center text-purple-light font-bold text-lg"
                      >
                        {letter}
                      </motion.div>
                    ))}
                    <div className="flex-1 glass-card flex items-center px-3">
                      <span className="text-white/30 text-sm">→ "Hello"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-4 glass-card px-4 py-3 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-sm font-medium text-white">AI Powered</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="section-title">How <span className="gradient-text">SignBridge</span> works</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Powered by MediaPipe hand tracking and deep learning — no server, just your browser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: 'Camera Detection',
                desc: 'Your webcam captures hand movements in real-time using MediaPipe Hands — 21 landmarks tracked per hand.',
                color: 'from-blue-500/20 to-purple-500/20',
                iconColor: 'text-blue-400',
                delay: 0,
              },
              {
                icon: Zap,
                title: 'AI Recognition',
                desc: 'TensorFlow.js runs the ASL model entirely in your browser — no data leaves your device. Lightning fast.',
                color: 'from-purple-500/20 to-pink-500/20',
                iconColor: 'text-purple-light',
                delay: 0.1,
              },
              {
                icon: Globe,
                title: 'Instant Translation',
                desc: 'Detected signs are assembled into letters, words, and sentences in real-time. Speak, copy or export.',
                color: 'from-green-500/20 to-teal-500/20',
                iconColor: 'text-neon-green',
                delay: 0.2,
              },
            ].map(({ icon: Icon, title, desc, color, iconColor, delay }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay }}
                whileHover={{ y: -5 }}
                className="glass-card p-8 space-y-4"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-white/60 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 text-center space-y-8 purple-glow"
          >
            <div className="text-6xl">🤟</div>
            <h2 className="font-display text-4xl font-bold">Ready to start signing?</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Whether you're learning ASL for the first time or want to translate your signs to text — SignBridge has you covered.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/translate">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-10 py-4 text-base"
                >
                  Open Translator
                </motion.button>
              </Link>
              <Link to="/learn">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary px-10 py-4 text-base"
                >
                  Explore Learning
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-white/40 text-sm">
          <p>SignBridge — Bridging communication through sign language 🤟</p>
        </div>
      </footer>
    </div>
  )
}
