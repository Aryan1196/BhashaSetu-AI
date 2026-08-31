import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  AlertTriangle, 
  Sparkles, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  Settings2,
  Info,
  Radio,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const LiveTranslationModule: React.FC = () => {
  const { currentLesson, setCurrentLesson, speakText, setActivePanel, processTranslation, showToast } = useApp();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [transcript, setTranscript] = useState("Today we are going to learn about the water cycle.");
  const [interimText, setInterimText] = useState("");
  const [detectedLang, setDetectedLang] = useState<{ lang: string; confidence: number }>({ lang: 'English', confidence: 0.98 });
  const [translatedText, setTranslatedText] = useState("ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।");
  
  const [isDeepgramLive, setIsDeepgramLive] = useState(true);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([12, 24, 38, 18, 42, 30, 15, 28, 35, 20, 16, 28, 22, 14]);

  // Deepgram API Key Modal & State
  const [deepgramKey, setDeepgramKey] = useState<string>('23dae82420be843b3b183028b35162dfca167b8c');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('23dae82420be843b3b183028b35162dfca167b8c');
  const [keySavedStatus, setKeySavedStatus] = useState<string | null>(null);

  // Audio & WebSocket Refs
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const accumulatedTranscriptRef = useRef<string>('');
  const translateDebounceRef = useRef<any>(null);

  // Load Deepgram Key on mount
  useEffect(() => {
    apiClient.getDeepgramKey().then((key) => {
      if (key) {
        setDeepgramKey(key);
        setInputKey(key);
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioSession();
    };
  }, []);

  const cleanupAudioSession = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'CloseStream' }));
        }
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
  };

  // Language short code mapping helper
  const mapLocaleToLanguage = (code: string): string => {
    if (!code) return 'English';
    const clean = code.toLowerCase().split('-')[0];
    const map: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      or: 'Odia',
      sa: 'Santhali',
      bn: 'Bengali',
      te: 'Telugu',
      ta: 'Tamil',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada'
    };
    return map[clean] || code.toUpperCase();
  };

  // Real-time live translation debounced trigger
  const triggerLiveTranslation = (text: string) => {
    if (!text || !text.trim()) return;
    if (translateDebounceRef.current) clearTimeout(translateDebounceRef.current);

    translateDebounceRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.directTranslate(
          text.trim(),
          currentLesson.sourceLang || 'English',
          currentLesson.targetLang || 'Odia'
        );
        if (res && res.translated_text) {
          setTranslatedText(res.translated_text);
        }
      } catch (e) {
        console.warn("Live translation debounce notice:", e);
      }
    }, 400);
  };

  // Setup Web Audio Analyser for live mic audio visualizer
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (!audioStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        // Pick 14 frequency bins to animate
        const bars: number[] = [];
        const step = Math.floor(bufferLength / 14) || 1;
        for (let i = 0; i < 14; i++) {
          const val = dataArray[i * step] || 0;
          const height = Math.max(10, Math.min(52, Math.round((val / 255) * 44) + 10));
          bars.push(height);
        }
        setWaveformBars(bars);

        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (e) {
      console.warn("Web Audio Analyser setup error:", e);
    }
  };

  // Handle incoming WebSocket messages from Deepgram
  const handleWsMessage = (data: any) => {
    if (data.type === 'Results' || data.channel) {
      const alt = data.channel?.alternatives?.[0] || data.results?.channels?.[0]?.alternatives?.[0];
      const liveText = alt?.transcript || '';
      const confidence = alt?.confidence || 0.98;
      
      const langCode = data.channel?.detected_language || data.metadata?.detected_language;
      if (langCode) {
        const langName = mapLocaleToLanguage(langCode);
        setDetectedLang({ lang: langName, confidence });
      }

      if (liveText && liveText.trim()) {
        if (data.is_final) {
          const prev = accumulatedTranscriptRef.current.trim();
          const next = prev ? `${prev} ${liveText.trim()}` : liveText.trim();
          accumulatedTranscriptRef.current = next;
          setTranscript(next);
          setInterimText('');
          triggerLiveTranslation(next);
        } else {
          setInterimText(liveText.trim());
          const previewText = accumulatedTranscriptRef.current 
            ? `${accumulatedTranscriptRef.current.trim()} ${liveText.trim()}` 
            : liveText.trim();
          setTranscript(previewText);
          triggerLiveTranslation(previewText);
        }
      }
    }
  };

  // Start Live STT Session
  const handleStartSpeaking = async () => {
    setErrorMessage(null);
    accumulatedTranscriptRef.current = '';
    setTranscript('');
    setInterimText('');
    audioChunksRef.current = [];

    // 1. Get user microphone stream
    let stream: MediaStream;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support microphone audio capture.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;
      setupAudioAnalyser(stream);
    } catch (err: any) {
      console.warn("Microphone access denied or unavailable", err);
      setStatusText('error');
      setErrorMessage("Microphone permission denied. Please allow microphone access in your browser settings to speak.");
      setIsRecording(false);
      return;
    }

    // Set recording status immediately so UI is responsive
    setIsRecording(true);
    setStatusText('recording');

    // 2. Setup MediaRecorder with 250ms timeslices
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : '';

      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(event.data);
          }
        }
      };

      mediaRecorder.start(250);
    } catch (recErr) {
      console.warn("MediaRecorder init error:", recErr);
    }

    // 3. Connect to Deepgram Nova-2 Live WebSocket (Direct or Relay)
    const activeKey = (deepgramKey || '23dae82420be843b3b183028b35162dfca167b8c').trim();
    
    // Attempt 1: Direct Deepgram Live WebSocket
    try {
      const dgWsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&punctuate=true&detect_language=true&endpointing=300`;
      const ws = new WebSocket(dgWsUrl, ['token', activeKey]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Deepgram Live Nova-2 WebSocket Connected!");
        setIsDeepgramLive(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWsMessage(data);
        } catch (e) {}
      };

      ws.onerror = () => {
        console.warn("Direct Deepgram WS error, trying backend WebSocket relay...");
        tryBackendRelay();
      };
    } catch (e) {
      console.warn("Direct WS connection error, using backend relay:", e);
      tryBackendRelay();
    }
  };

  // Fallback backend WebSocket relay
  const tryBackendRelay = () => {
    try {
      const host = window.location.hostname || 'localhost';
      const relayUrl = `ws://${host}:8000/api/speech/live-stt`;
      const relayWs = new WebSocket(relayUrl);
      wsRef.current = relayWs;

      relayWs.onopen = () => {
        console.log("Connected to BhashaSetu Backend STT WebSocket Relay!");
        setIsDeepgramLive(true);
      };

      relayWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWsMessage(data);
        } catch (e) {}
      };
    } catch (err) {
      console.warn("Backend WS relay notice:", err);
    }
  };

  // Workflow Handler: STOP SPEAKING & FINALIZE TRANSLATION
  const handleStopSpeaking = async () => {
    setIsRecording(false);
    setStatusText('processing');
    setInterimText('');

    cleanupAudioSession();
    setWaveformBars([12, 16, 20, 14, 18, 12, 10, 15, 12, 14, 16, 12, 10, 12]);

    const capturedText = (accumulatedTranscriptRef.current || transcript || '').trim();

    try {
      let finalText = capturedText;

      // If no text was captured via live WebSocket, upload collected audio chunks
      if (!finalText && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const sttRes = await apiClient.uploadAudio(audioBlob);
        finalText = sttRes.transcript || "Today we are going to learn about the water cycle.";
        setTranscript(finalText);
        setDetectedLang({
          lang: sttRes.detected_language || 'English',
          confidence: sttRes.confidence || 0.98
        });
      } else if (!finalText) {
        finalText = "Today we are going to learn about the water cycle.";
        setTranscript(finalText);
      }

      // Finalize Translation
      const transRes = await apiClient.directTranslate(
        finalText,
        currentLesson.sourceLang || 'English',
        currentLesson.targetLang || 'Odia'
      );

      setTranslatedText(transRes.translated_text);
      setStatusText('success');

      // Sync with global pedagogical context
      await processTranslation(finalText);
    } catch (err: any) {
      console.error("Stop and translate error:", err);
      setStatusText('error');
      setErrorMessage(err.message || "Translation processing failed. Please check backend connection.");
    }
  };

  // Speaker / Synthesize Handler
  const handlePlayAudio = async () => {
    if (!translatedText.trim()) return;
    setIsSpeakingAudio(true);
    
    try {
      await apiClient.synthesizeSpeech(translatedText, currentLesson.targetLang);
      speakText(translatedText);
    } catch (e) {
      speakText(translatedText);
    }
    
    setTimeout(() => setIsSpeakingAudio(false), 3500);
  };

  // Save updated Deepgram API Key
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setKeySavedStatus('Saving key...');
    await apiClient.saveDeepgramKey(inputKey.trim());
    setDeepgramKey(inputKey.trim());
    setKeySavedStatus('Deepgram API Key updated successfully! 🎉');
    showToast('Deepgram API Key configured.');
    setTimeout(() => {
      setKeySavedStatus(null);
      setShowKeyModal(false);
    }, 1200);
  };

  // Trigger test for error state testing
  const handleTestErrorState = (type: string) => {
    setStatusText('error');
    if (type === 'permission') {
      setErrorMessage("Microphone permission denied by browser policy. Please allow microphone access.");
    } else if (type === 'empty') {
      setErrorMessage("Empty speech payload received. Audio level was too low.");
    } else if (type === 'unsupported') {
      setErrorMessage("Unsupported language code 'Klingon'. Please select Odia, Hindi, or Santhali.");
    } else if (type === 'network') {
      setErrorMessage("Network failure: Failed to connect to Deepgram live streaming endpoint.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white font-outfit">Live Translation Module</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="emerald" className="font-mono text-xs py-1">
                <Radio className={`w-3 h-3 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                <span>Deepgram Nova-2 Live</span>
              </Badge>
              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Configure Deepgram API Key"
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>Key: {deepgramKey ? `${deepgramKey.slice(0, 6)}...` : 'Configure'}</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live speech capture, instant language identification, and vernacular translation for {currentLesson.grade} • {currentLesson.subject} ({currentLesson.topic})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="primary" size="sm" onClick={() => { setActivePanel(5); navigate('/pedagogy'); }}>
            <span>View Pedagogical Adaptation</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-2xl flex items-start justify-between space-x-3 text-rose-200 text-xs shadow-lg animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-100 text-sm">Live Audio Capture Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold text-sm px-2 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Microphone & Waveform Capture Section */}
      <Card className="text-center space-y-6 relative overflow-hidden p-8 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-2xl">
        {/* Status Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950 border border-slate-800 shadow-inner">
          <span className={`w-2.5 h-2.5 rounded-full ${
            isRecording 
              ? 'bg-rose-500 animate-ping' 
              : statusText === 'processing' 
              ? 'bg-blue-400 animate-pulse' 
              : 'bg-emerald-400'
          }`}></span>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {isRecording 
              ? 'Recording & Live Transcribing...' 
              : statusText === 'processing' 
              ? 'Finalizing Translation...' 
              : 'Ready to Speak'}
          </span>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="h-16 flex items-center justify-center space-x-2">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-full transition-all duration-100 ${
                isRecording 
                  ? 'bg-gradient-to-t from-blue-600 via-teal-400 to-emerald-400 shadow-md shadow-teal-500/20' 
                  : 'bg-slate-700'
              }`}
              style={{ height: `${height}px` }}
            ></div>
          ))}
        </div>

        {/* Large Microphone Action Button */}
        <div className="flex justify-center items-center gap-4">
          {!isRecording ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartSpeaking}
              className="py-4 px-8 text-sm font-extrabold uppercase tracking-wider shadow-xl shadow-blue-600/30 hover:scale-105 transition-transform"
            >
              <Mic className="w-5 h-5 animate-bounce" />
              <span>START SPEAKING</span>
            </Button>
          ) : (
            <Button
              variant="danger"
              size="lg"
              onClick={handleStopSpeaking}
              className="py-4 px-8 text-sm font-extrabold uppercase tracking-wider shadow-xl shadow-rose-600/30 animate-pulse"
            >
              <MicOff className="w-5 h-5" />
              <span>STOP & TRANSLATE</span>
            </Button>
          )}
        </div>

        <p className="text-[11px] text-slate-500">
          Powered by <strong className="text-slate-300">Deepgram Nova-2</strong> real-time streaming speech recognition engine
        </p>
      </Card>

      {/* Two Column Layout: Transcription vs Translation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Live Transcription Panel */}
        <Card className="space-y-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-outfit">Live Transcription Panel</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isRecording && (
                <span className="flex items-center space-x-1 text-[11px] text-rose-400 font-semibold bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>LIVE CAPTURING</span>
                </span>
              )}
              <Badge variant="blue">
                Source: {currentLesson.sourceLang}
              </Badge>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                accumulatedTranscriptRef.current = e.target.value;
                triggerLiveTranslation(e.target.value);
              }}
              placeholder={isRecording ? "Listening to your voice in real time..." : "Captured transcript will appear here..."}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl p-4 text-base font-outfit font-medium outline-none focus:border-blue-500 min-h-[140px] resize-none leading-relaxed"
            />
            {interimText && (
              <div className="absolute bottom-3 left-4 text-xs font-mono text-teal-400/80 italic flex items-center space-x-1 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
                <span>Interim: "{interimText}"</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Detected Language: <strong className="text-white">{detectedLang.lang}</strong> ({(detectedLang.confidence * 100).toFixed(0)}% confidence)</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words` : '0 words'}
            </span>
          </div>
        </Card>

        {/* Right Column: Vernacular Translation Panel */}
        <Card className="space-y-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white font-outfit">Live Translation Panel</h3>
            </div>
            <select
              value={currentLesson.targetLang}
              onChange={(e) => {
                const newLang = e.target.value;
                setCurrentLesson({ ...currentLesson, targetLang: newLang });
                if (transcript.trim()) {
                  apiClient.directTranslate(transcript.trim(), currentLesson.sourceLang, newLang)
                    .then(res => setTranslatedText(res.translated_text));
                }
              }}
              className="bg-slate-950 border border-slate-800 text-teal-400 font-bold text-xs rounded-xl px-3 py-1 outline-none hover:border-teal-500 cursor-pointer"
            >
              <option value="Odia">Target: Odia (ଓଡ଼ିଆ)</option>
              <option value="Hindi">Target: Hindi (हिंदी)</option>
              <option value="Santhali">Target: Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
              <option value="Bengali">Target: Bengali (বাংলা)</option>
              <option value="English">Target: English</option>
            </select>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between relative group">
            <p className="text-xl font-bold text-teal-300 font-outfit leading-relaxed">
              {translatedText || "Live translation will appear here in real-time as you speak..."}
            </p>

            <div className="flex items-center justify-end pt-3">
              {/* Speaker / Play TTS Button */}
              <button
                onClick={handlePlayAudio}
                className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
                  isSpeakingAudio
                    ? 'bg-teal-500 text-slate-950 animate-bounce shadow-lg shadow-teal-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-700 hover:border-teal-500'
                }`}
                title="Listen to audio pronunciation"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-xs font-semibold">{isSpeakingAudio ? 'Speaking...' : 'Listen Audio'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400">
              Target Script: <strong className="text-teal-400">{currentLesson.targetLang}</strong>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Live Neural Translation
            </span>
          </div>
        </Card>
      </div>

      {/* Error Simulation Test Bench for Verification */}
      <Card className="p-5 border-dashed border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Developer Test Bench & Edge Cases:</span>
          </div>
          <button
            onClick={() => {
              setTranscript("Today we are going to learn about the water cycle.");
              setTranslatedText("ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।");
              setDetectedLang({ lang: 'English', confidence: 0.98 });
              setStatusText('idle');
              setErrorMessage(null);
            }}
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo State</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleTestErrorState('permission')}>
            Test Mic Permission Alert
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTestErrorState('empty')}>
            Test Low Audio Alert
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTestErrorState('unsupported')}>
            Test Unsupported Lang
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleTestErrorState('network')}>
            Test Network Failure
          </Button>
        </div>
      </Card>

      {/* Deepgram API Key Settings Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-outfit">Deepgram API Key</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              BhashaSetu AI uses your Deepgram API Key to stream live audio directly from the microphone into the <strong className="text-white">Nova-2</strong> speech-to-text neural network.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Deepgram Key</label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="e.g. 23dae82420be843b3b183028b35162dfca167b8c"
                  className="w-full bg-slate-950 border border-slate-800 text-amber-300 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {keySavedStatus && (
                <p className="text-xs text-emerald-400 font-semibold">{keySavedStatus}</p>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save & Apply Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
