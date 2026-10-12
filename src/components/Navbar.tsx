import React from 'react'
import { Video, BookOpen, Layers, Sun, Moon } from 'lucide-react'

export type TabType = 'translate' | 'learn' | 'library'

interface NavbarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  theme?: 'dark' | 'light'
  onToggleTheme?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme = 'dark',
  onToggleTheme,
}) => {
  const tabs = [
    {
      id: 'translate' as TabType,
      label: 'Live Translation',
      icon: Video,
      badge: 'Live AI',
      desc: 'Camera to Words',
    },
    {
      id: 'learn' as TabType,
      label: 'Learning Hub',
      icon: BookOpen,
      badge: '3-in-1',
      desc: 'Book • Rylo Converter • Videos',
    },
    {
      id: 'library' as TabType,
      label: 'Sign Reference',
      icon: Layers,
      badge: 'A-Z + Phrases',
      desc: 'Complete Sign Guide',
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('translate')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-400 p-0.5 shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl select-none">🤟</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  Sign<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Bridge</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full tracking-wide uppercase">
                  AI v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Sign Language Recognition & Learning
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center p-1.5 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="font-semibold tracking-wide whitespace-nowrap">{tab.label}</span>
                  <span
                    className={`hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded-md font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Right Controls: MediaPipe Status & Theme Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MediaPipe Ready</span>
            </div>

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2.5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all shadow-md hover:scale-105 active:scale-95 flex items-center justify-center group"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-purple-600 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}

export default Navbar

