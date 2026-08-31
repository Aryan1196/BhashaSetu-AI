import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuizResult = () => {
  const { setActivePanel, showToast, quizResult, currentLesson } = useApp();
  const navigate = useNavigate();

  // Use actual backend quiz result, fallback to safe defaults
  const score = quizResult?.score ?? 0;
  const total = quizResult?.total ?? 3;
  const percentage = quizResult?.percentage ?? 0;
  const feedback = quizResult?.feedback ?? 'Quiz results are being processed.';
  const isMock = quizResult?.provider_mode === 'mock';

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 space-y-8 text-center">
      {/* Trophy & Celebration Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Mock Mode Badge */}
        {isMock && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
            <span>[MOCK PROVIDER ACTIVE]</span>
          </div>
        )}

        {/* Big Trophy Graphic */}
        <div className="relative inline-block">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-2xl mx-auto animate-bounce ${
            percentage >= 80
              ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-300 shadow-amber-500/30'
              : percentage >= 50
                ? 'bg-gradient-to-tr from-blue-500 to-blue-700 shadow-blue-500/30'
                : 'bg-gradient-to-tr from-slate-600 to-slate-800 shadow-slate-500/30'
          }`}>
            {percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}
          </div>
          <span className="absolute -top-2 -right-2 text-2xl">✨</span>
          <span className="absolute -bottom-1 -left-2 text-2xl">🎉</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-tight">
            {percentage >= 80 ? 'Great Job! 🎉' : percentage >= 50 ? 'Good Effort! 👏' : 'Keep Practicing! 📖'}
          </h1>
          <div className="mt-3 text-4xl font-extrabold text-emerald-400 font-mono">
            You scored {score}/{total}
          </div>
          <p className="text-sm font-semibold text-slate-300 mt-2">
            {feedback}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {currentLesson.topic} • {currentLesson.grade} • {currentLesson.targetLang}
          </p>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Performance</p>
            <p className="text-2xl font-extrabold text-white font-outfit mt-1">{percentage}%</p>
            <p className="text-[10px] text-emerald-400 font-bold">Score</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Correct</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-outfit mt-1">{score}</p>
            <p className="text-[10px] text-emerald-400 font-bold">Answers</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Incorrect</p>
            <p className="text-2xl font-extrabold text-rose-400 font-outfit mt-1">{total - score}</p>
            <p className="text-[10px] text-rose-400 font-bold">Answers</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              showToast(`Review mode: ${score} of ${total} answers were correct.`);
              setActivePanel(8);
              navigate('/quiz');
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={() => { setActivePanel(2); navigate('/teacher/dashboard'); }}
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
