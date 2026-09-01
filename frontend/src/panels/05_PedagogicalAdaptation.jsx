import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Sparkles, Lightbulb, ArrowRight, Bot, HelpCircle, BookOpen, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const PedagogicalAdaptation = () => {
  const { setActivePanel, currentLesson, translationResult, speakText, pedagogyResult, fetchPedagogy, showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);

  // Fetch pedagogical explanation from backend only if not already loaded from lecture history
  useEffect(() => {
    if (pedagogyResult?.simple_explanation || translationResult?.pedagogicalAdaptation) {
      return;
    }
    const sourceText = translationResult?.directTranslation ||
      "Today we are going to learn about the water cycle.";
    setLoading(true);
    fetchPedagogy(sourceText).then((res) => {
      if (res?.is_development_fallback) setIsMock(true);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [translationResult?.directTranslation]);

  const handlePlayTTS = async (text) => {
    if (!text || !text.trim()) return;
    try {
      const res = await apiClient.synthesizeSpeech(text, currentLesson.targetLang || 'Odia');
      if (res && res.audio_url && res.audio_url.startsWith('data:audio')) {
        speakText(text, res.audio_url, currentLesson.targetLang || 'Odia');
      } else {
        speakText(text, currentLesson.targetLang || 'Odia');
      }
    } catch (e) {
      speakText(text, currentLesson.targetLang || 'Odia');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white font-outfit">Translation + Pedagogical Adaptation</h1>
            {isMock && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
                [MOCK PROVIDER]
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {currentLesson.grade} • {currentLesson.subject} ({currentLesson.topic})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setActivePanel(7); navigate('/tutor'); }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Card 1: Direct Translation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Direct Translation ({currentLesson.targetLang})
          </span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
            Literal Output
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <p className="text-2xl font-bold text-teal-400 font-outfit leading-relaxed">
            {translationResult?.directTranslation || 'ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।'}
          </p>
          <button
            onClick={() => handlePlayTTS(translationResult?.directTranslation || '')}
            className="p-3.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-teal-400 border border-blue-500/30 transition-all shrink-0 ml-4 hover:scale-105"
            title="Listen Pronunciation"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Card 2: Pedagogical Adaptation from Backend */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-bold text-white font-outfit">
              Pedagogical Adaptation ({currentLesson.grade} - {currentLesson.subject})
            </span>
          </div>
          <span className="text-xs bg-blue-600/20 text-blue-400 font-semibold px-3 py-1 rounded-full border border-blue-500/30">
            Simplified Primary Pedagogy
          </span>
        </div>

        {loading ? (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center text-slate-400 animate-pulse">
            Fetching pedagogical adaptation from backend...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <p className="text-xl font-semibold text-slate-100 font-outfit leading-relaxed">
                {pedagogyResult?.simple_explanation || translationResult?.pedagogicalAdaptation || 'ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ ।'}
              </p>
              <button
                onClick={() => handlePlayTTS(pedagogyResult?.simple_explanation || translationResult?.pedagogicalAdaptation || '')}
                className="p-3.5 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-teal-400 border border-blue-500/30 transition-all shrink-0 ml-4 hover:scale-105"
                title="Listen Simplified Explanation"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            {/* Key Points from Backend */}
            <div className="space-y-2">
              {(pedagogyResult?.key_points || translationResult?.keyPoints || []).map((point, idx) => (
                <div key={idx} className="bg-slate-950 border border-teal-500/40 p-4 rounded-2xl flex items-center space-x-3 text-slate-200 text-sm">
                  <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Key Point {idx + 1}:</p>
                    <p className="text-xs text-slate-300">{point}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Example from Backend */}
            {pedagogyResult?.example && (
              <div className="bg-slate-950 border border-blue-500/30 p-4 rounded-2xl flex items-center space-x-3 text-sm">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-semibold text-blue-400">Example:</p>
                  <p className="text-xs text-slate-300">{pedagogyResult.example}</p>
                </div>
              </div>
            )}

            {/* Learner Question from Backend */}
            {pedagogyResult?.learner_question && (
              <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl flex items-center space-x-3 text-sm">
                <span className="text-2xl">❓</span>
                <div>
                  <p className="font-semibold text-amber-400">Think About This:</p>
                  <p className="text-xs text-slate-300">{pedagogyResult.learner_question}</p>
                </div>
              </div>
            )}

            {/* RAG Citation Badge */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Curriculum Grounded Source: <strong className="text-white">{translationResult?.ragSource || 'Class 3 Science - Water Cycle (Page 2)'}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => { setActivePanel(4); navigate('/teacher/live'); }}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          ← Back to Live Session
        </button>

        <button
          onClick={() => { setActivePanel(7); navigate('/tutor'); }}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl flex items-center space-x-2 transition-all"
        >
          <span>Ask AI Tutor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
