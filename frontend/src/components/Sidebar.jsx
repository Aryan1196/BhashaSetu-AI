import React from 'react';
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
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { activePanel, setActivePanel, userProfile } = useApp();

  const navItems = [
    { id: 1, label: 'Welcome Screen', icon: Home, panel: 1 },
    { id: 2, label: 'Dashboard', icon: LayoutDashboard, panel: 2 },
    { id: 3, label: 'New Lesson Setup', icon: BookOpen, panel: 3 },
    { id: 4, label: 'Live Translation', icon: Mic, panel: 4 },
    { id: 5, label: 'Adaptation View', icon: Sparkles, panel: 5 },
    { id: 6, label: 'Curriculum (RAG)', icon: FileText, panel: 6 },
    { id: 7, label: 'Student AI Tutor', icon: Bot, panel: 7 },
    { id: 8, label: 'Quiz Mode', icon: HelpCircle, panel: 8 },
    { id: 9, label: 'Quiz Results', icon: Award, panel: 9 },
    { id: 10, label: 'Reports & Analytics', icon: BarChart3, panel: 10 },
    { id: 11, label: 'Settings', icon: Settings, panel: 11 },
  ];

  return (
    <aside className="w-64 bg-[#0A1128] text-slate-300 flex flex-col border-r border-slate-800/80 min-h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center space-x-3 cursor-pointer" onClick={() => setActivePanel(1)}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
          ⚡
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1 font-outfit">
            BhashaSetu AI
          </h1>
          <p className="text-xs text-slate-400 font-medium">Bridging Languages.</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Panels & Views (1-11)
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.panel;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.panel)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold translate-x-1'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-800 text-slate-400'}`}>
                #{item.panel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070D1F] flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
            👩‍🏫
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#070D1F] rounded-full"></span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{userProfile.name}</p>
          <p className="text-xs text-slate-400 truncate">{userProfile.gradeSubject}</p>
        </div>
      </div>
    </aside>
  );
};
