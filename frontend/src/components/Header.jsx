import React from 'react';
import { Bell, Globe, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header = () => {
  const { activePanel, setActivePanel, userRole, setUserRole, backendStatus, toastMessage } = useApp();

  const panelTitles = {
    1: 'Welcome & Overview',
    2: 'Teacher Dashboard',
    3: 'New Lesson / Class Setup',
    4: 'Live Translation (Speech-to-Text)',
    5: 'Translation & Pedagogical Adaptation',
    6: 'Curriculum Upload & RAG Documents',
    7: 'Student AI Vernacular Tutor',
    8: 'Interactive Quiz Mode',
    9: 'Quiz Results & Progress',
    10: 'Reports & Teacher Analytics',
    11: 'Profile & System Settings'
  };

  return (
    <header className="bg-[#0A192F] border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Current Panel Title & Navigation Breadcrumb */}
      <div className="flex items-center space-x-3">
        <span className="bg-blue-600/20 text-blue-400 font-mono font-semibold text-xs px-2.5 py-1 rounded-md border border-blue-500/30">
          Govt. Jharkhand EdTech • Panel {activePanel}/11
        </span>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <h2 className="text-lg font-bold text-white font-outfit tracking-tight">
          {panelTitles[activePanel]}
        </h2>
      </div>

      {/* Quick Jump Selector & User Controls */}
      <div className="flex items-center space-x-3">
        {/* Backend Status Badge */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-[11px] text-slate-300">
          <Activity className={`w-3.5 h-3.5 ${backendStatus.includes('Live') ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="font-mono">{backendStatus}</span>
        </div>

        {/* Quick Panel Dropdown Jump */}
        <select
          value={activePanel}
          onChange={(e) => setActivePanel(Number(e.target.value))}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
        >
          <option value={1}>1. Welcome / Landing Screen</option>
          <option value={2}>2. Teacher Dashboard</option>
          <option value={3}>3. New Lesson Setup</option>
          <option value={4}>4. Live Translation</option>
          <option value={5}>5. Adaptation & Translation</option>
          <option value={6}>6. Curriculum Management</option>
          <option value={7}>7. Student AI Tutor</option>
          <option value={8}>8. Quiz</option>
          <option value={9}>9. Quiz Results</option>
          <option value={10}>10. Reports & Analytics</option>
          <option value={11}>11. Settings / Profile</option>
        </select>

        {/* Role Toggle Switch */}
        <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-lg flex items-center">
          <button
            onClick={() => setUserRole('Teacher')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              userRole === 'Teacher'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Teacher
          </button>
          <button
            onClick={() => setUserRole('Student')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              userRole === 'Student'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student
          </button>
        </div>

        {/* Language selector icon */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 text-xs font-medium">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>English (Odia)</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
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
