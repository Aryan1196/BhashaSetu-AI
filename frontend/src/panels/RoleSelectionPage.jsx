import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Mic, 
  Languages, 
  Cpu, 
  Volume2, 
  BookOpen, 
  Bot,
  Zap,
  ShieldCheck,
  Layout,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RoleSelectionPage = () => {
  const { userRole, setUserRole, setActivePanel } = useApp();
  const [selectedRole, setSelectedRole] = useState(userRole || 'Teacher');
  const navigate = useNavigate();

  const handleProceed = () => {
    setUserRole(selectedRole);
    if (selectedRole === 'Teacher') {
      setActivePanel(2);
      navigate('/teacher/dashboard');
    } else {
      setActivePanel(12);
      navigate('/student/dashboard');
    }
  };

  const softwareCapabilities = [
    {
      icon: Mic,
      title: 'Live Microphone Speech-to-Text (STT)',
      desc: 'Real-time classroom voice capture with instant transcript streaming, Deepgram Nova-2 recognition, and confidence scoring.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      icon: Languages,
      title: 'Trilingual Vernacular Translation',
      desc: 'Instant bidirectional translation across Odia (ଓଡ଼ିଆ), Hindi (हिंदी), and English with automatic sentence structure & punctuation normalization.',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      icon: Cpu,
      title: 'STEM Pedagogical Simplification',
      desc: 'Transforms complex Science & Math concepts into Class 1-5 age-appropriate mother tongue explanations, key points, and real-world examples.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      icon: Bot,
      title: 'Interactive Vernacular AI Tutor',
      desc: 'Voice & text AI assistant answering student STEM questions in spoken mother tongue with audio playback.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      icon: Volume2,
      title: 'High-Quality Neural Audio Synthesis (TTS)',
      desc: 'Microsoft Edge Neural TTS engine generating clear MP3 audio data streams for Odia, Hindi, and English text.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      icon: BookOpen,
      title: 'Grade & Subject Lesson Setup',
      desc: 'Custom parameter configuration for Class 1 to 5 Science, Mathematics, Environmental Studies, and English.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: ShieldCheck,
      title: 'Offline & Mock Fallback Resilience',
      desc: 'Continuous operation with fallback providers ensuring uninterrupted classroom teaching even with weak internet.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      icon: Layout,
      title: 'Responsive Dual Theme System',
      desc: 'Tailored dark and light mode user interface optimized for desktop displays and low-cost primary school devices.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-10">
      {/* Brand Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-blue-400/30">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-outfit tracking-tight">BhashaSetu AI</h1>
            <p className="text-xs text-teal-400 font-semibold">Government of Jharkhand • SIH26042</p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Gen Vernacular EdTech Platform</span>
        </div>
      </div>

      {/* Main Mode Selection Banner */}
      <div className="text-center space-y-3 pt-2">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-outfit tracking-tight">
          Select Your Category
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          Choose your operating mode to customize your menu navigation and platform capabilities.
        </p>
      </div>

      {/* Two Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Teacher Mode */}
        <div
          onClick={() => setSelectedRole('Teacher')}
          className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            selectedRole === 'Teacher'
              ? 'bg-slate-900 border-blue-500 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/30'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          {selectedRole === 'Teacher' && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-1.5 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-3xl font-bold">
              👩‍🏫
            </div>

            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold text-[11px] mb-1">
                Educator Portal
              </div>
              <h3 className="text-2xl font-bold text-white font-outfit">Teacher Mode</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Designed for primary school educators to manage live speech translation, lesson setups, and pedagogical STEM adaptation.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Live Speech-to-Text Translation (Odia & Hindi)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Primary STEM Pedagogical Simplification</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Teacher Dashboard & Lesson Management</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: Student Mode */}
        <div
          onClick={() => setSelectedRole('Student')}
          className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            selectedRole === 'Student'
              ? 'bg-slate-900 border-teal-500 shadow-2xl shadow-teal-500/10 ring-2 ring-teal-500/30'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
          }`}
        >
          {selectedRole === 'Student' && (
            <div className="absolute top-4 right-4 bg-teal-500 text-white rounded-full p-1.5 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center text-3xl font-bold">
              🎓
            </div>

            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-semibold text-[11px] mb-1">
                Learner Portal
              </div>
              <h3 className="text-2xl font-bold text-white font-outfit">Student Mode</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Designed for primary students to learn in their mother tongue with an interactive AI Tutor and voice audio assistance.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Interactive Vernacular AI Tutor</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Neural Audio Text-to-Speech Playback</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Student Hub & Mother Tongue STEM Learning</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-center">
        <button
          onClick={handleProceed}
          className="w-full max-w-md py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-extrabold text-sm tracking-wider uppercase shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Continue as {selectedRole}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full Software Features Overview */}
      <div className="pt-8 space-y-6 border-t border-slate-800/80">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Complete Platform Feature Matrix</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-outfit">All Features Supported by BhashaSetu AI</h3>
          <p className="text-xs sm:text-sm text-slate-400">Comprehensive overview of real-time translation, speech, and pedagogy capabilities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {softwareCapabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white font-outfit">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
