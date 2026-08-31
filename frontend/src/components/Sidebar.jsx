import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  BookOpen, 
  Mic, 
  FileText, 
  Bot, 
  HelpCircle, 
  Award,
  BarChart3, 
  Settings,
  Sparkles,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { activePanel, setActivePanel, userProfile } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 1, label: 'Welcome Screen', icon: Home, panel: 1, path: '/' },
    { id: 2, label: 'Teacher Dashboard', icon: LayoutDashboard, panel: 2, path: '/teacher/dashboard' },
    { id: 12, label: 'Student Dashboard', icon: GraduationCap, panel: 12, path: '/student/dashboard' },
    { id: 3, label: 'New Lesson Setup', icon: BookOpen, panel: 3, path: '/teacher/new-lesson' },
    { id: 4, label: 'Live Translation', icon: Mic, panel: 4, path: '/teacher/live' },
    { id: 5, label: 'Adaptation View', icon: Sparkles, panel: 5, path: '/pedagogy' },
    { id: 6, label: 'Curriculum (RAG)', icon: FileText, panel: 6, path: '/curriculum' },
    { id: 7, label: 'Student AI Tutor', icon: Bot, panel: 7, path: '/tutor' },
    { id: 8, label: 'Quiz Mode', icon: HelpCircle, panel: 8, path: '/quiz' },
    { id: 9, label: 'Quiz Results', icon: Award, panel: 9, path: '/quiz/results' },
    { id: 10, label: 'Reports & Analytics', icon: BarChart3, panel: 10, path: '/reports' },
    { id: 11, label: 'Settings', icon: Settings, panel: 11, path: '/settings' },
  ];

  const handleSelectPanel = (item) => {
    setActivePanel(item.panel);
    navigate(item.path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Toggle Bar */}
      <div className="md:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 shadow-lg"
        >
          {mobileOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-blue-400" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#0A192F] text-slate-300 flex flex-col border-r border-slate-800/80 min-h-screen shrink-0 select-none
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center space-x-3 cursor-pointer" onClick={() => handleSelectPanel(navItems[0])}>
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-lg text-white font-bold text-xl border border-blue-500/30">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1 font-outfit">
              BhashaSetu AI
            </h1>
            <p className="text-[11px] text-teal-400 font-semibold">Govt. of Jharkhand • SIH26042</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || activePanel === item.panel;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectPanel(item)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : 'hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-[#071120] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center font-bold shadow">
            👩‍🏫
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userProfile.name}</p>
            <p className="text-xs text-teal-400 truncate font-medium">{userProfile.school}</p>
          </div>
        </div>
      </aside>
    </>
  );
};
