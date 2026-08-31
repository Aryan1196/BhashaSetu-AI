import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Languages, 
  Cpu, 
  BookMarked, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2,
  GraduationCap,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen = () => {
  const { setActivePanel, userRole } = useApp();
  const navigate = useNavigate();

  const handleLaunchDashboard = () => {
    if (userRole === 'Teacher') {
      setActivePanel(2);
      navigate('/teacher/dashboard');
    } else {
      setActivePanel(12);
      navigate('/student/dashboard');
    }
  };

  const handleSwitchCategory = () => {
    navigate('/select-role');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-10">
      {/* Top Banner & Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0D1E3A] to-slate-900 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Active Mode: <strong className="text-white ml-1 font-bold">{userRole} Category</strong></span>
              </div>
              <button
                onClick={handleSwitchCategory}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-teal-400" />
                <span>Switch Category</span>
              </button>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-outfit tracking-tight leading-tight">
              BhashaSetu AI
            </h1>
            <p className="text-xl font-semibold text-emerald-400">
              Bridging Languages. Building Brighter Futures.
            </p>
            <p className="text-slate-300 text-base leading-relaxed max-w-xl">
              {userRole === 'Teacher' 
                ? 'Empowering primary school teachers with real-time vernacular translation, grade-aware pedagogy, and lesson management.'
                : 'Empowering primary school students with an interactive mother tongue AI Tutor and voice-assisted STEM learning.'}
            </p>

            {/* Launch Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={handleLaunchDashboard}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 flex items-center space-x-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Launch {userRole === 'Teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-slate-800/60 border border-slate-700/60 p-6 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-5xl shadow-2xl mb-4 animate-pulse">
                {userRole === 'Teacher' ? '👩‍🏫' : '🎓'}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {userRole === 'Teacher' ? 'Primary Educator AI' : 'Student Learning Hub'}
              </h3>
              <p className="text-xs text-slate-400">Class 3 • Science & Mathematics</p>
              
              <div className="mt-4 w-full bg-slate-900/80 p-3 rounded-xl border border-slate-700/40 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Category Mode:</span>
                  <span className="font-bold text-teal-400">{userRole}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Vernacular Target:</span>
                  <span className="font-semibold text-emerald-400">Odia (ଓଡ଼ିଆ)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            icon: Languages,
            title: 'Mother Tongue First',
            desc: 'Seamless real-time support for Odia, Hindi, and English.',
            color: 'from-emerald-500/20 to-teal-500/10',
            iconColor: 'text-emerald-400'
          },
          {
            icon: Cpu,
            title: 'AI-Powered Pedagogy',
            desc: 'Instant speech translation and age-appropriate STEM simplification.',
            color: 'from-blue-500/20 to-indigo-500/10',
            iconColor: 'text-blue-400'
          },
          {
            icon: Users,
            title: 'Inclusive Primary Learning',
            desc: 'Interactive audio text-to-speech & adaptive mother tongue support for every student.',
            color: 'from-amber-500/20 to-orange-500/10',
            iconColor: 'text-amber-400'
          }
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 group bg-gradient-to-b ${feature.color}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mb-4 border border-slate-800 group-hover:scale-110 transition-transform ${feature.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white font-outfit mb-2">{feature.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
