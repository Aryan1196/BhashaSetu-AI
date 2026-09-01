import React from 'react';
import { Globe, Sparkles, ChevronRight, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const { activePanel, currentLesson, setCurrentLesson, toastMessage, theme, toggleTheme } = useApp();

  const panelTitles = {
    1: 'Welcome & Overview',
    2: 'Teacher Dashboard',
    3: 'New Lesson / Class Setup',
    4: 'Live Translation (Speech-to-Text)',
    5: 'Translation & Pedagogical Adaptation',
    7: 'Student AI Vernacular Tutor',
    11: 'Profile & System Settings',
    12: 'Student Dashboard'
  };

  return (
    <header className="bg-[#0A192F] border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Current Panel Title & Navigation Breadcrumb */}
      <div className="flex items-center space-x-3">
        <span className="bg-blue-600/20 text-blue-400 font-mono font-semibold text-xs px-2.5 py-1 rounded-md border border-blue-500/30">
          BhashaSetu AI
        </span>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <h2 className="text-lg font-bold text-white font-outfit tracking-tight">
          {panelTitles[activePanel] || 'Dashboard'}
        </h2>
      </div>

      {/* User Controls & Language Dropdown */}
      <div className="flex items-center space-x-3">
        {/* Target Language Selection Dropdown */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium">
          <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <select
            value={currentLesson.targetLang || 'Odia'}
            onChange={(e) => setCurrentLesson((prev) => ({ ...prev, targetLang: e.target.value }))}
            className="bg-transparent text-teal-400 font-bold outline-none cursor-pointer text-xs"
          >
            <option value="Odia" className="bg-slate-900 text-slate-200">Odia (ଓଡ଼ିଆ)</option>
            <option value="Hindi" className="bg-slate-900 text-slate-200">Hindi (हिंदी)</option>
            <option value="English" className="bg-slate-900 text-slate-200">English</option>
          </select>
        </div>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-blue-400/30">
          <Sparkles className="w-5 h-5 text-blue-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
