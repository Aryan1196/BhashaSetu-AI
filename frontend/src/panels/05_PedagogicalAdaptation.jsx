import React from 'react';
import { Volume2, Sparkles, Lightbulb, ArrowRight, Bot, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PedagogicalAdaptation = () => {
  const { setActivePanel, currentLesson, speakText } = useApp();

  const directTranslation = "ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।";
  const adaptedPedagogy = "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।";
  const keyPoint = "Key Point: Sun heats water and changes it into water vapour.";

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Translation + Pedagogical Adaptation</h1>
          <p className="text-xs text-slate-400">
            {currentLesson.grade} • {currentLesson.subject} ({currentLesson.topic})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActivePanel(7)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>AI Tutor</span>
          </button>
          <button
            onClick={() => setActivePanel(8)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Launch Quiz</span>
          </button>
        </div>
      </div>

      {/* Card 1: Direct Translation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Translation (Odia)
          </span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
            Literal Translation
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <p className="text-2xl font-bold text-emerald-400 font-outfit leading-relaxed">
            {directTranslation}
          </p>
          <button
            onClick={() => speakText(directTranslation)}
            className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 ml-4 hover:scale-105"
            title="Listen Pronunciation"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Card 2: Pedagogical Adaptation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white font-outfit">
              Pedagogical Adaptation ({currentLesson.grade} - {currentLesson.subject})
            </span>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
            Simplified for Primary Level
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <p className="text-xl font-semibold text-slate-100 font-outfit leading-relaxed">
            {adaptedPedagogy}
          </p>
          <button
            onClick={() => speakText(adaptedPedagogy)}
            className="p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shrink-0 ml-4 hover:scale-105"
            title="Listen Simplified Explanation"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Key Point Callout Banner */}
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center space-x-3 text-emerald-200 text-sm">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <p className="font-semibold text-emerald-100">
            {keyPoint}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => setActivePanel(4)}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          ← Back to Live Session
        </button>

        <button
          onClick={() => setActivePanel(8)}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center space-x-2 transition-all hover:scale-[1.02]"
        >
          <span>Take Concept Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
