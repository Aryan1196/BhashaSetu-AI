import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Sparkles, Lightbulb, ArrowRight, Bot, BookOpen, Send, MessageSquare, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const PedagogicalAdaptation = () => {
  const { 
    setActivePanel, 
    currentLesson, 
    translationResult, 
    speakText, 
    pedagogyResult, 
    fetchPedagogy, 
    lessonQAHistory, 
    addLessonQuery,
    showToast 
  } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [playingId, setPlayingId] = useState(null);

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

  const handlePlayTTS = async (text, id = 'main') => {
    if (!text || !text.trim()) return;
    setPlayingId(id);
    try {
      const res = await apiClient.synthesizeSpeech(text, currentLesson.targetLang || 'Odia');
      if (res && res.audio_url && res.audio_url.startsWith('data:audio')) {
        await speakText(text, res.audio_url, currentLesson.targetLang || 'Odia');
      } else {
        await speakText(text, currentLesson.targetLang || 'Odia');
      }
    } catch (e) {
      await speakText(text, currentLesson.targetLang || 'Odia');
    } finally {
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!queryInput.trim() || isAsking) return;
    const text = queryInput.trim();
    setQueryInput('');
    setIsAsking(true);
    try {
      await addLessonQuery(text);
      showToast('Question answered and saved to lesson history!');
    } catch (err) {
      console.warn('Query failed:', err);
    } finally {
      setIsAsking(false);
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
            {currentLesson.grade || 'Class 3'} • {currentLesson.subject || 'Science'} ({currentLesson.topic || 'Lesson'})
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setActivePanel(7); navigate('/tutor'); }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg cursor-pointer"
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
            Direct Translation ({currentLesson.targetLang || 'Odia'})
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
            onClick={() => handlePlayTTS(translationResult?.directTranslation || 'ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।', 'direct')}
            className={`p-3.5 rounded-2xl border transition-all shrink-0 ml-4 hover:scale-105 cursor-pointer ${
              playingId === 'direct'
                ? 'bg-teal-500/30 text-teal-300 border-teal-400'
                : 'bg-blue-600/10 hover:bg-blue-600/20 text-teal-400 border-blue-500/30'
            }`}
            title="Listen Pronunciation"
            aria-label="Listen Pronunciation"
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
              Pedagogical Adaptation ({currentLesson.grade || 'Class 3'} - {currentLesson.subject || 'Science'})
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
                onClick={() => handlePlayTTS(pedagogyResult?.simple_explanation || translationResult?.pedagogicalAdaptation || 'ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ ।', 'pedagogy')}
                className={`p-3.5 rounded-2xl border transition-all shrink-0 ml-4 hover:scale-105 cursor-pointer ${
                  playingId === 'pedagogy'
                    ? 'bg-teal-500/30 text-teal-300 border-teal-400'
                    : 'bg-blue-600/10 hover:bg-blue-600/20 text-teal-400 border-blue-500/30'
                }`}
                title="Listen Simplified Explanation"
                aria-label="Listen Simplified Explanation"
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

      {/* Card 3: Stored Queries & Answers for this Lesson */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-bold text-white font-outfit">
              Lesson Queries & Vernacular Answers ({lessonQAHistory?.length || 0})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
            Saved to Database
          </span>
        </div>

        {/* List of Stored Q&A items */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {lessonQAHistory && lessonQAHistory.length > 0 ? (
            lessonQAHistory.map((item, idx) => {
              const queryText = item.query || item.transcript || `Query ${idx + 1}`;
              const answerText = item.answer || item.pedagogical_adaptation || item.direct_translation || "ଶିକ୍ଷଣ ବିବରଣୀ";

              return (
                <div 
                  key={item.id || idx}
                  className="bg-slate-950 border border-slate-800/90 hover:border-teal-500/30 rounded-2xl p-4.5 space-y-3 transition-colors"
                >
                  {/* Query Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        Query #{idx + 1}
                      </span>
                      {item.timestamp && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.timestamp}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlayTTS(answerText, `qa-${item.id || idx}`)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        playingId === `qa-${item.id || idx}`
                          ? 'bg-teal-500/30 text-teal-300 border-teal-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-teal-400 border-slate-700'
                      }`}
                      title="Listen Answer in Mother Tongue"
                      aria-label="Listen Answer in Mother Tongue"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Query Text */}
                  <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                    <p className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Input / Query:</p>
                    <p className="font-medium text-slate-100">{queryText}</p>
                  </div>

                  {/* Answer / Pedagogy Text */}
                  <div className="text-sm text-teal-300 bg-teal-950/20 p-3.5 rounded-xl border border-teal-500/20">
                    <p className="font-semibold text-teal-400 text-[10px] uppercase tracking-wider mb-1">
                      Vernacular Explanation ({currentLesson.targetLang || 'Odia'}):
                    </p>
                    <p className="font-semibold leading-relaxed">{answerText}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No queries recorded yet for this lesson. Ask a question below!
            </div>
          )}
        </div>

        {/* Interactive Query Input Bar */}
        <form onSubmit={handleSendQuery} className="pt-2 flex items-center gap-2 border-t border-slate-800">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={`Ask a question on this ${currentLesson.topic || 'lesson'}... (ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ)`}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
          />
          <button
            type="submit"
            disabled={isAsking || !queryInput.trim()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
          >
            <span>{isAsking ? 'Thinking...' : 'Ask'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={() => { setActivePanel(4); navigate('/teacher/live'); }}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          ← Back to Live Session
        </button>

        <button
          onClick={() => { setActivePanel(7); navigate('/tutor'); }}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl flex items-center space-x-2 transition-all cursor-pointer"
        >
          <span>Ask AI Tutor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
