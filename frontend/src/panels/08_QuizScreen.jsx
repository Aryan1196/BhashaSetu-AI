import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, CheckCircle2, ArrowRight, Volume2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const QuizScreen = () => {
  const { setActivePanel, currentLesson, speakText, generateQuiz, evaluateQuiz, quizData, showToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState('A');
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isMock, setIsMock] = useState(false);

  // Fetch quiz from backend on mount
  useEffect(() => {
    setLoading(true);
    generateQuiz().then((res) => {
      if (res && res.questions) {
        setQuestions(res.questions);
        setQuizId(res.quiz_id);
        if (res.provider_mode === 'mock') setIsMock(true);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const currentQ = questions[currentIdx];

  const handleNextQuestion = async () => {
    const newAnswers = [...answers, { question_id: currentQ?.id || currentIdx + 1, selected_key: selectedOption }];
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption('A');
    } else {
      // Quiz completed - evaluate via backend
      setSubmitting(true);
      showToast('Evaluating quiz answers via backend...');
      await evaluateQuiz(quizId, newAnswers);
      setSubmitting(false);
      setActivePanel(9);
      navigate('/quiz/results');
    }
  };

  const handlePlayQuestionTTS = async (text) => {
    const res = await apiClient.synthesizeSpeech(text, currentLesson.targetLang);
    if (res && res.audio_url && res.audio_supported) {
      speakText(text, res.audio_url, currentLesson.targetLang);
    } else {
      speakText(text, currentLesson.targetLang);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto animate-pulse text-3xl">📝</div>
        <h2 className="text-xl font-bold text-white font-outfit">Generating Quiz from Backend...</h2>
        <p className="text-xs text-slate-400">
          POST /api/quiz/generate → {currentLesson.topic} ({currentLesson.grade} • {currentLesson.targetLang})
        </p>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No quiz questions available</h2>
        <p className="text-xs text-slate-400">Quiz generation returned no questions. Please check backend logs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
            📝
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-outfit">Quiz - {currentLesson.topic}</h1>
            <p className="text-xs text-slate-400">{currentLesson.grade} • Vernacular Assessment</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isMock && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold font-mono">
              [MOCK]
            </span>
          )}
          <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs font-bold">
            Question {currentIdx + 1} of {questions.length}
          </span>
        </div>
      </div>

      {/* Question Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-outfit leading-relaxed">
              {currentQ.question}
            </h2>
            {currentQ.translation && (
              <p className="text-xs text-slate-400 italic mt-1">{currentQ.translation}</p>
            )}
          </div>
          <button
            onClick={() => handlePlayTTS(currentQ.question)}
            className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
            title="Read Question Aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-3.5 pt-2">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            return (
              <div
                key={opt.key}
                onClick={() => setSelectedOption(opt.key)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800/80 text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {opt.key}
                  </div>
                  <span className="text-lg font-semibold font-outfit">{opt.text}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={handleNextQuestion}
            disabled={submitting}
            className={`px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center space-x-2 transition-all ${
              submitting
                ? 'bg-slate-700 cursor-wait'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            <span>{submitting ? 'Evaluating...' : currentIdx === questions.length - 1 ? 'Submit Quiz' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
