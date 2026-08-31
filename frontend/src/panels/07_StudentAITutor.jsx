
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, MicOff, Send, Volume2, Sparkles, BookOpen, User, AlertTriangle, Languages, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const StudentAITutor = () => {
  const { currentLesson, speakText, showToast } = useApp();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('auto');
  const [inputQuery, setInputQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'BhashaSetu AI',
      lang: 'Odia',
      text: 'ନମସ୍କାର! ମୁଁ ତୁମର AI ଶିକ୍ଷକ । ତୁମେ ଓଡ଼ିଆ, ହିନ୍ଦୀ, ଇଂରାଜୀ ବା ଯେକୌଣସି ଭାଷାରେ ପ୍ରଶ୍ନ ପଚାରିପାରିବ । ମୁଁ ତୁମ ଭାଷାରେ ହିଁ ଉତ୍ତର ଦେବି !',
      source: 'BhashaSetu Multilingual Tutor',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMock: false
    }
  ]);

  // Voice speech recognition for students
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = selectedLang === 'Hindi' ? 'hi-IN' : (selectedLang === 'English' ? 'en-IN' : 'or-IN');

      rec.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputQuery(transcript);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [selectedLang]);

  const handleMicVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setInputQuery('');
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Speech recognition restart:", e);
        }
      } else {
        // Fallback simulation if browser blocks microphone
        setTimeout(() => {
          setInputQuery('ପାଣି କାହିଁକି ବାଷ୍ପ ହୁଏ ?');
          setIsRecording(false);
        }, 1500);
      }
    }
  };

  const handleSend = async () => {
    if (!inputQuery.trim()) return;

    const queryText = inputQuery.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'You',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Call LLM Student AI Tutor endpoint (Answers in the same language as the user's question)
      const tutorRes = await apiClient.aiTutor({
        query: queryText,
        grade: currentLesson.grade || 'Class 3',
        subject: currentLesson.subject || 'Science',
        topic: currentLesson.topic || 'General',
        language: selectedLang === 'auto' ? undefined : selectedLang
      });

      const aiReply = {
        id: Date.now() + 1,
        sender: 'BhashaSetu AI',
        lang: tutorRes.detected_language || 'Odia',
        text: tutorRes.response || tutorRes.simple_explanation || "Learning is fun! Let's explore together.",
        source: tutorRes.source || `${currentLesson.grade} ${currentLesson.subject}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMock: tutorRes.is_development_fallback || false,
        keyPoints: tutorRes.key_points || [],
        example: tutorRes.example || null,
        followUp: tutorRes.follow_up_question || null,
        confidence: tutorRes.confidence_score || 0.96
      };
      setChatHistory((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Student AI Tutor error:", err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'BhashaSetu AI',
        text: 'Sorry, I could not process your question. Please try asking again.',
        source: 'Notice',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTTS = async (msgId, text, lang) => {
    setSpeakingId(msgId);
    const targetLanguage = lang || selectedLang || currentLesson.targetLang || 'Odia';
    try {
      const res = await apiClient.synthesizeSpeech(text, targetLanguage);
      if (res && res.audio_url && res.audio_supported) {
        speakText(text, res.audio_url, targetLanguage);
      } else {
        speakText(text, targetLanguage);
      }
    } catch (e) {
      speakText(text, targetLanguage);
    }
    setTimeout(() => setSpeakingId(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl shadow-lg border border-teal-500/30">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-white font-outfit">Ask AI Student Tutor</h1>
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
                Multilingual LLM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask in ANY language (Odia, Hindi, English, Bengali, etc.) — AI responds in your exact language!
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center space-x-2">
          <Languages className="w-4 h-4 text-teal-400" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-teal-400 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="auto">✨ Auto-Detect (Same As Query)</option>
            <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="English">English</option>
            <option value="Bengali">Bengali (বাংলা)</option>
            <option value="Santhali">Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Marathi">Marathi (मराठी)</option>
            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
          </select>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[420px] max-h-[500px] overflow-y-auto space-y-5">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl rounded-2xl p-5 shadow-md space-y-3 ${msg.sender === 'You'
                ? 'bg-blue-600/20 border border-blue-500/30 text-slate-100'
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

              {/* Real World Example */}
              {msg.example && (
                <div className="bg-slate-900/90 border border-teal-500/20 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-teal-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Example:</span>
                  </span>
                  <p className="text-slate-300 italic">{msg.example}</p>
                </div>
              )}

              {/* Follow-up question */}
              {msg.followUp && (
                <div className="bg-slate-900/60 border border-blue-500/20 rounded-xl p-2.5 text-xs text-blue-300 flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{msg.followUp}</span>
                </div>
              )}

              {/* Speaker Audio & RAG Source Badge */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                {msg.source ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-400 text-[11px] font-medium border border-blue-500/20">
                    <BookOpen className="w-3 h-3" />
                    <span>Source: {msg.source}</span>
                  </span>
                ) : <div></div>}

                <button
                  onClick={() => handlePlayTTS(msg.id, msg.text, msg.lang)}
                  className={`p-2 rounded-lg transition-colors flex items-center space-x-1.5 text-xs cursor-pointer ${speakingId === msg.id
                      ? 'bg-teal-500 text-slate-950 animate-bounce font-bold shadow-lg shadow-teal-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700'
                    }`}
                  title="Listen to audio pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{speakingId === msg.id ? 'Speaking...' : 'Listen Audio'}</span>
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
              <p className="text-xs text-slate-500">Consulting Multilingual AI Tutor & Pedagogy Engine</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center space-x-3 shadow-xl">
        <button
          onClick={handleMicVoice}
          className={`p-3 rounded-xl transition-all cursor-pointer ${isRecording
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          title={isRecording ? "Listening to your voice..." : "Click to speak question"}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          placeholder={isRecording ? "Listening to your voice in real time..." : "Type or speak your question in any language (Odia, Hindi, English, etc.)..."}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-transparent text-slate-100 text-base outline-none px-2 font-medium"
        />

        <button
          onClick={handleSend}
          disabled={loading || !inputQuery.trim()}
          className={`px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 ${loading ? 'bg-slate-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
            }`}
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
