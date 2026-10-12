# 👐 SignBridge — AI-Powered ASL Translation & Learning Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-0097A7?logo=google&logoColor=white)](https://developers.google.com/mediapipe)

**SignBridge** is a real-time American Sign Language (ASL) recognition and interactive learning platform. Featuring dual-hand tracking, 360° rotation-invariant gesture recognition, an interactive 60 FPS 3D Kinetic Avatar Studio, comprehensive ASL curriculum, and high-contrast Light/Dark theming.

---

## ✨ Key Features

### 1. 🎥 Live ASL Translation Engine
- **Dual-Hand Tracking:** Tracks and translates both hands simultaneously with spatial relationship modeling.
- **360° Rotation Invariance:** Canonical landmark normalization allows accurate recognition regardless of hand angle, camera tilt, or palm facing.
- **Dynamic & Two-Handed Gestures:** Real-time classification for complex signs like *"How are you"*, *"Help"*, *"Book"*, *"Thank you"*, *"Peace"*, *"Love"*, *"Clap"*, *"Nice to meet you"*, and alphabet fingerspelling (A–Z).
- **Predictive ASL Autocomplete:** Suggestion chips automatically appear as you fingerspell to complete common words quickly.
- **Text-to-Speech (TTS) & Auto-Voice:** Speaks completed sentences aloud in real time.

### 2. 🤖 Interactive 3D Kinetic Avatar Studio
- **60 FPS Articulated Kinematic Humanoid:** Visualizes authentic ASL handshapes, arm movements, and facial non-manual markers.
- **Interactive Pose Dictionary:** View and replay signs with playback controls, scrubbable timeline, and close-up camera angles.
- **Rylo Translate Integration:** Direct connectivity with Rylo's Sign.mt ecosystem.

### 3. 📚 Complete ASL Learning Hub
- **4-Level Structured Curriculum:** Lessons progressing from novice fingerspelling to conversational dialogue.
- **ASL Video Masterclasses:** Curated tutorial library taught by Deaf educators.
- **Interactive ASL Handbook:** In-depth guide on etiquette, grammar, spatial reference, and history.

### 4. 📖 Sign Reference Library
- Complete reference cards for manual alphabets (A–Z) and high-frequency conversational phrases with execution tips.

### 5. 🌓 Dual Theming Engine
- Full instant toggle between sleek Cyber Dark and crisp High-Contrast Light themes with persistent state.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Vanilla CSS 3D Glassmorphism + Tailwind CSS v4
- **Computer Vision:** Google MediaPipe Hands
- **Icons:** Lucide React
- **Animations:** Framer Motion & HTML5 Canvas Kinematics

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BEASTBINGO/SIGN-BRIDGE.git
   cd SIGN-BRIDGE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173/`

### Production Build
```bash
npm run build
npm run preview
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
