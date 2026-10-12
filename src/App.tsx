import React, { useState, useEffect } from 'react'
import { Navbar, type TabType } from './components/Navbar'
import { Translate } from './pages/Translate'
import { Learn } from './pages/Learn'
import { SignLibrary } from './pages/SignLibrary'
import { Video, BookOpen, Layers } from 'lucide-react'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('translate')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sb_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem('sb_theme', theme)
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  // Check URL hash for initial tab
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as TabType
    if (hash === 'translate' || hash === 'learn' || hash === 'library') {
      setActiveTab(hash)
    }
  }, [])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    window.location.hash = tab
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Section Switcher Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTabChange('translate')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
              activeTab === 'translate'
                ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-900/20'
                : 'bg-gray-900/70 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'translate' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-purple-300'
              }`}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">1. Live Translation</span>
                <span className="text-[11px] text-gray-400">Webcam to words & sentences</span>
              </div>
            </div>
            {activeTab === 'translate' && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('learn')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
              activeTab === 'learn'
                ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-900/20'
                : 'bg-gray-900/70 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'learn' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-purple-300'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">2. Learning Hub</span>
                <span className="text-[11px] text-gray-400">Book • Rylo Converter • Videos</span>
              </div>
            </div>
            {activeTab === 'learn' && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('library')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
              activeTab === 'library'
                ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-900/20'
                : 'bg-gray-900/70 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                activeTab === 'library' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 group-hover:text-purple-300'
              }`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">3. Sign Reference</span>
                <span className="text-[11px] text-gray-400">All 26 Letters & 11 Phrases</span>
              </div>
            </div>
            {activeTab === 'library' && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="transition-all duration-300">
          {activeTab === 'translate' && <Translate />}
          {activeTab === 'learn' && <Learn />}
          {activeTab === 'library' && <SignLibrary />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-gray-950 py-8 px-4 text-center mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-base">🤟</span>
            <span className="font-bold text-gray-300">SignBridge</span>
            <span>— Real-time Sign Language Recognition & Education</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleTabChange('translate')} className="hover:text-purple-400 transition-colors">
              Live Translator
            </button>
            <button onClick={() => handleTabChange('learn')} className="hover:text-purple-400 transition-colors">
              Learning Hub
            </button>
            <button onClick={() => handleTabChange('library')} className="hover:text-purple-400 transition-colors">
              Sign Dictionary
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
