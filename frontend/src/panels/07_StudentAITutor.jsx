import React, { useState } from 'react';
import { Bot, Mic, Send, Volume2, Sparkles, BookOpen, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudentAITutor = () => {
  const { currentLesson, speakText } = useApp();
  const [selectedLang, setSelectedLang] = useState('Odia');
  const [inputQuery, setInputQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'You',
      lang: 'Odia',
      text: 'ପାଣି କାହିଁକି ବାଷ୍ପୀଭବନ ହୁଏ ?',
      time: '10:42 AM'
    },
    {
      id: 2,
      sender: 'BhashaSetu AI',
      text: 'ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ଗରମ ହୁଏ । ଗରମ ହେଲେ ପାଣି ଛୋଟ ଛୋଟ ବାଷ୍ପରେ ପରିଣତ ହୋଇ ଉପରକୁ ଉଠିଯାଏ । ଏହାକୁ ବାଷ୍ପୀଭବନ କୁହାଯାଏ ।',
      source: 'Class 3 Science - Water Cycle (Page 2)',
      time: '10:42 AM'
    }
  ]);

  const handleSend = () => {
    if (!inputQuery.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'You',
      lang: selectedLang,
      text: inputQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Simulated AI response based on textbook RAG
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        sender: 'BhashaSetu AI',
        text: 'ବାଷ୍ପୀଭବନ ଦ୍ୱାରା ପାଣି ବାଷ୍ପ ହୋଇ ମେଘ ତିଆରି କରେ, ଯାହା ପରେ ବର୍ଷା ଆକାରରେ ପୁଣି ତଳକୁ ଖସିଆସେ ।',
        source: 'Class 3 Science - Water Cycle (Page 3)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, aiReply]);
    }, 1000);
  };

  const handleMicVoice = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setInputQuery('ପାଣି ଚକ୍ର କ’ଣ ?');
        setIsRecording(false);
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-outfit">Ask AI Tutor</h1>
            <p className="text-xs text-slate-400">Curriculum Grounded Assistant for Vernacular Students</p>
          </div>
        </div>

        {/* Language selector */}
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
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
                : 'bg-slate-950 border border-slate-800 text-white'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center space-x-2">
                  {msg.sender === 'You' ? (
                    <User className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs font-bold text-emerald-400">
                    {msg.sender} {msg.lang ? `(${msg.lang})` : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
              </div>

              <p className="text-lg font-medium leading-relaxed font-outfit">
                {msg.text}
              </p>

              {/* Speaker Audio & RAG Source Badge */}
              <div className="flex items-center justify-between pt-1">
                {msg.source ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                    <BookOpen className="w-3 h-3" />
                    <span>Source: {msg.source}</span>
                  </span>
                ) : <div></div>}

                <button
                  onClick={() => speakText(msg.text)}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 transition-colors"
                  title="Listen to audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
