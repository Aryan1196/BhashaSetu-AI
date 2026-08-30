import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, ArrowRight, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuizScreen = () => {
  const { setActivePanel, currentLesson, speakText } = useApp();

  const questions = [
    {
      id: 1,
      question: 'ପାଣି କାହିଁକି ବାଷ୍ପୀଭବନ ହୁଏ ?',
      translation: 'Why does water evaporate?',
      options: [
        { key: 'A', text: 'ସୂର୍ଯ୍ୟଙ୍କ ତାପଯୋଗୁଁ', isCorrect: true },
        { key: 'B', text: 'ଥଣ୍ଡା ପବନ ଯୋଗୁଁ', isCorrect: false },
        { key: 'C', text: 'ଗଛ ପାଇଁ', isCorrect: false },
        { key: 'D', text: 'ରାତି ହେଲେ', isCorrect: false }
      ]
    },
    {
      id: 2,
      question: 'ବାଷ୍ପ ଉପରକୁ ଉଠି କ’ଣ ତିଆରି କରେ ?',
      translation: 'What does water vapour form when it rises up?',
      options: [
        { key: 'A', text: 'ପବନ', isCorrect: false },
        { key: 'B', text: 'ମେଘ', isCorrect: true },
        { key: 'C', text: 'ମାଟି', isCorrect: false },
        { key: 'D', text: 'ନଈ', isCorrect: false }
      ]
    },
    {
      id: 3,
      question: 'ମେଘ ଥଣ୍ଡା ହେଲେ କ’ଣ ହୁଏ ?',
      translation: 'What happens when clouds cool down?',
      options: [
        { key: 'A', text: 'ବର୍ଷା ହୁଏ', isCorrect: true },
        { key: 'B', text: 'ଖରା ହୁଏ', isCorrect: false },
        { key: 'C', text: 'ରାତି ହୁଏ', isCorrect: false },
        { key: 'D', text: 'ପବନ ବନ୍ଦ ହୁଏ', isCorrect: false }
      ]
    }
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState('A'); // default selected Option A as shown in screenshot mockup
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIdx];

  const handleNextQuestion = () => {
    const chosen = currentQ.options.find((o) => o.key === selectedOption);
    let newScore = score;
    if (chosen && chosen.isCorrect) {
      newScore += 1;
      setScore(newScore);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption('A');
    } else {
      // Quiz completed! Pass score to result panel
      setActivePanel(9);
    }
  };

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
        <span className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs font-bold">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      {/* Question Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-outfit leading-relaxed">
              {currentQ.question}
            </h2>
            <p className="text-xs text-slate-400 italic mt-1">{currentQ.translation}</p>
          </div>
          <button
            onClick={() => speakText(currentQ.question)}
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
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition-all"
          >
            <span>{currentIdx === questions.length - 1 ? 'Submit Quiz' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
