import React from 'react';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuizResult = () => {
  const { setActivePanel, showToast } = useApp();

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8 text-center">
      {/* Trophy & Celebration Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Big Golden Trophy Graphic */}
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 flex items-center justify-center text-6xl shadow-2xl shadow-amber-500/30 mx-auto animate-bounce">
            🏆
          </div>
          <span className="absolute -top-2 -right-2 text-2xl">✨</span>
          <span className="absolute -bottom-1 -left-2 text-2xl">🎉</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-tight">
            Great Job! 🎉
          </h1>
          <div className="mt-3 text-4xl font-extrabold text-emerald-400 font-mono">
            You scored 3/3
          </div>
          <p className="text-sm font-semibold text-slate-300 mt-2">
            Excellent! Keep learning!
          </p>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Performance</p>
            <p className="text-2xl font-extrabold text-white font-outfit mt-1">100%</p>
            <p className="text-[10px] text-emerald-400 font-bold">Score</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Correct</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-outfit mt-1">3</p>
            <p className="text-[10px] text-emerald-400 font-bold">Answers</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Incorrect</p>
            <p className="text-2xl font-extrabold text-rose-400 font-outfit mt-1">0</p>
            <p className="text-[10px] text-rose-400 font-bold">Answers</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              showToast('Review mode: All 3 answers were correct!');
              setActivePanel(8);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Review Answers</span>
          </button>

          <button
            onClick={() => setActivePanel(2)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
