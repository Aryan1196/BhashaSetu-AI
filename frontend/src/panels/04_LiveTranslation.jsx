import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LiveTranslation = () => {
  const { setActivePanel, currentLesson, processTranslation, speakText, showToast } = useApp();

  const [isListening, setIsListening] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(18);
  const [transcript, setTranscript] = useState("Today we are going to learn about the water cycle.");
  const [isProcessing, setIsProcessing] = useState(false);

  // Timer counter effect
  useEffect(() => {
    let interval = null;
    if (isListening && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isListening, isPaused]);

  const formatTime = (totalSec) => {
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const handleEndSession = async () => {
    setIsListening(false);
    setIsProcessing(true);
    showToast('Adapting lesson via BhashaSetu AI backend...');
    
    await processTranslation(transcript);
    
    setIsProcessing(false);
    setActivePanel(5); // Jump to Panel 5 Adaptation
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Live Translation</h1>
          <p className="text-xs text-slate-400">
            {currentLesson.grade} • {currentLesson.subject} ({currentLesson.topic})
          </p>
        </div>
        <button
          onClick={handleEndSession}
          disabled={isProcessing}
          className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Processing AI...' : 'End Session'}
        </button>
      </div>

      {/* Main Visualizer Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Glowing Listening Status */}
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <span className={`w-2.5 h-2.5 rounded-full bg-blue-400 ${isListening && !isPaused ? 'animate-ping' : ''}`}></span>
          <span>{isPaused ? 'Session Paused' : isListening ? 'Listening...' : 'Stopped'}</span>
        </div>

        {/* Audio Wave visualizer */}
        <div className="h-20 flex items-center justify-center space-x-2 py-4">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 3, 2].map((heightScale, idx) => (
            <div
              key={idx}
              className={`w-2 rounded-full transition-all duration-300 ${
                isListening && !isPaused
                  ? `bg-blue-400 animate-wave-${(idx % 5) + 1}`
                  : 'bg-slate-700 h-3'
              }`}
              style={{
                height: isListening && !isPaused ? `${Math.max(16, heightScale * 10)}px` : '12px'
              }}
            ></div>
          ))}
        </div>

        {/* Live Timer Counter */}
        <div className="text-4xl font-extrabold font-mono tracking-widest text-white">
          {formatTime(seconds)}
        </div>
      </div>

      {/* Live Transcript Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white font-outfit">Live Transcript ({currentLesson.sourceLang})</h3>
          </div>
          <span className="bg-blue-600/20 text-blue-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30">
            {currentLesson.sourceLang} Detected
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 min-h-[100px] flex items-center justify-between">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full bg-transparent text-xl font-medium text-slate-100 leading-relaxed font-outfit outline-none resize-none"
            rows={2}
          />
          <button
            onClick={() => speakText(transcript)}
            className="ml-4 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700 transition-colors shrink-0"
            title="Read aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={() => {
            setIsListening(true);
            setIsPaused(false);
          }}
          className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
            isListening && !isPaused
              ? 'bg-blue-600 text-white shadow-blue-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Listening...</span>
        </button>

        <button
          onClick={() => {
            setIsListening(false);
            setIsPaused(false);
          }}
          className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all"
          title="Stop Recording"
        >
          <Square className="w-5 h-5 fill-current" />
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2 border border-slate-700 transition-all"
        >
          {isPaused ? <Play className="w-4 h-4 fill-current text-blue-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        <button
          onClick={handleEndSession}
          disabled={isProcessing}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xl"
        >
          <span>{isProcessing ? 'Translating...' : 'Process Adaptation'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
