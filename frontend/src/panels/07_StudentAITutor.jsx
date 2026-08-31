import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, Send, Volume2, Sparkles, BookOpen, User, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const StudentAITutor = () => {
  const { currentLesson, speakText, showToast } = useApp();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(currentLesson.targetLang || 'Odia');
  const [inputQuery, setInputQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'BhashaSetu AI',
      text: 'ନମସ୍କାର! ମୁଁ ତୁମର AI ଶିକ୍ଷକ । ତୁମେ ପାଣି ଚକ୍ର ବିଷୟରେ ପ୍ରଶ୍ନ ପଚାରିପାରିବ ।',
      source: 'System - Welcome Message',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMock: false
    }
  ]);

  const handleSend = async () => {
    if (!inputQuery.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'You',
      lang: selectedLang,
      text: inputQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    const query = inputQuery;
    setInputQuery('');
    setLoading(true);

    try {
      // Step 1: Query RAG for curriculum-grounded answer
      const ragRes = await apiClient.queryRAG({
        query: query,
        grade: currentLesson.grade,
        subject: currentLesson.subject,
        lang: selectedLang
      });

      // Step 2: Get pedagogical explanation
      const gradeNum = parseInt(currentLesson.grade.replace('Class', '').trim()) || 3;
      const pedRes = await apiClient.pedagogyExplain(
        ragRes.answer || query,
        gradeNum,
        currentLesson.subject,
        selectedLang
      );

      const aiReply = {
        id: Date.now() + 1,
        sender: 'BhashaSetu AI',
        text: pedRes.simple_explanation || ragRes.answer,
        source: ragRes.source || `${currentLesson.grade} ${currentLesson.subject}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMock: pedRes.is_development_fallback || false,
        keyPoints: pedRes.key_points || [],
        example: pedRes.example || null,
        learnerQuestion: pedRes.learner_question || null,
        confidence: ragRes.confidence_score || 0
      };
      setChatHistory((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'BhashaSetu AI',
        text: 'Sorry, I could not process your question. Please try again.',
        source: 'Error',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    }

    setLoading(false);
  };

  const handleMicVoice = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setInputQuery('ପାଣି ଚକ୍ର କ\'ଣ ?');
        setIsRecording(false);
      }, 2000);
    }
  };

  const handlePlayTTS = async (msgId, text) => {
    setSpeakingId(msgId);
    const res = await apiClient.synthesizeSpeech(text, selectedLang);
    if (res.audio_supported === false) {
      showToast(res.limitation_message || 'TTS is unsupported for this language.');
    } else {
      speakText(text);
    }
    setTimeout(() => setSpeakingId(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-outfit">Ask AI Tutor</h1>
            <p className="text-xs text-slate-400">Curriculum Grounded Assistant • {currentLesson.grade} {currentLesson.subject}</p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-teal-400 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:border-teal-500"
        >
          <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
          <option value="Hindi">Hindi (हिंदी)</option>
          <option value="English">English</option>
        </select>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[420px] max-h-[500px] overflow-y-auto space-y-5">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl rounded-2xl p-5 shadow-md space-y-3 ${
              msg.sender === 'You'
                ? 'bg-slate-800 border border-slate-700 text-slate-100'
                : msg.isError
                  ? 'bg-rose-950/50 border border-rose-500/40 text-rose-200'
                  : 'bg-slate-950 border border-slate-800 text-white'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  {msg.sender === 'You' ? (
                    <User className="w-4 h-4 text-blue-400" />
                  ) : msg.isError ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-teal-400" />
                  )}
                  <span className="text-xs font-bold text-teal-400">
                    {msg.sender} {msg.lang ? `(${msg.lang})` : ''}
                  </span>
                  {msg.isMock && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold border border-amber-500/30">
                      MOCK
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
              </div>

              <p className="text-lg font-medium leading-relaxed font-outfit">
                {msg.text}
              </p>

              {/* Key Points (if AI response from pedagogy) */}
              {msg.keyPoints && msg.keyPoints.length > 0 && (
                <div className="space-y-1 pt-1">
                  {msg.keyPoints.map((kp, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start space-x-1.5">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Speaker Audio & RAG Source Badge */}
              <div className="flex items-center justify-between pt-1">
                {msg.source ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-400 text-[11px] font-medium border border-blue-500/20">
                    <BookOpen className="w-3 h-3" />
                    <span>Source: {msg.source}</span>
                  </span>
                ) : <div></div>}

                <button
                  onClick={() => handlePlayTTS(msg.id, msg.text)}
                  className={`p-2 rounded-lg transition-colors ${
                    speakingId === msg.id
                      ? 'bg-teal-500 text-slate-950 animate-bounce'
                      : 'bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700'
                  }`}
                  title="Listen to audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 animate-pulse space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
                <span className="text-xs text-teal-400 font-bold">BhashaSetu AI is thinking...</span>
              </div>
              <p className="text-xs text-slate-500">Querying RAG + Pedagogy Engine</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center space-x-3 shadow-xl">
        <button
          onClick={handleMicVoice}
          className={`p-3 rounded-xl transition-all ${
            isRecording
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Speak Question"
        >
          <Mic className="w-5 h-5" />
        </button>

        <input
          type="text"
          placeholder="Type your question..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent text-white text-base outline-none px-2 font-medium"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className={`px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg flex items-center space-x-2 transition-all ${
            loading ? 'bg-slate-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
          }`}
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
