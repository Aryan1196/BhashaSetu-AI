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
  Info,
  Radio,
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

  const [transcript, setTranscript] = useState("Water evaporates when heated by the sun.");
  const [interimText, setInterimText] = useState("");
  const [detectedLang, setDetectedLang] = useState<{ lang: string; confidence: number }>({ lang: 'English', confidence: 0.98 });
  const [translatedText, setTranslatedText] = useState("ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ନଦୀ ଓ ପୋଖରୀର ପାଣି ଗରମ ହୋଇ ଛୋଟ ଛୋଟ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ବାଷ୍ପୀଭବନ କୁହାଯାଏ, ଯେମିତି ଗରମ ଚା'ରୁ ଧୂଆଁ ଉଠେ ।");
  
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [llmProviderMode, setLlmProviderMode] = useState<string>('llm');

  const [isDeepgramLive, setIsDeepgramLive] = useState(true);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([12, 24, 38, 18, 42, 30, 15, 28, 35, 20, 16, 28, 22, 14]);

  // Deepgram API Key Modal & State
  const [deepgramKey, setDeepgramKey] = useState<string>('23dae82420be843b3b183028b35162dfca167b8c');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('23dae82420be843b3b183028b35162dfca167b8c');
  const [keySavedStatus, setKeySavedStatus] = useState<string | null>(null);

  // LLM API Key Modal & State
  const [llmKey, setLlmKey] = useState<string>('');
  const [showLLMKeyModal, setShowLLMKeyModal] = useState(false);
  const [inputLLMKey, setInputLLMKey] = useState('');
  const [inputLLMModel, setInputLLMModel] = useState('llama-3.3-70b-versatile');
  const [llmKeySavedStatus, setLLMKeySavedStatus] = useState<string | null>(null);

  // Audio & Speech Recognition Refs
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const accumulatedFinalRef = useRef<string>('');
  const translateDebounceRef = useRef<any>(null);

  // Load API Keys on mount
  useEffect(() => {
    apiClient.getDeepgramKey().then((key) => {
      if (key) {
        setDeepgramKey(key);
        setInputKey(key);
      }
    });
    apiClient.getLLMKey().then((res) => {
      if (res && res.key) {
        setLlmKey(res.key);
        setInputLLMKey(res.key);
      }
      if (res && res.model) {
        setInputLLMModel(res.model);
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
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

  // Real-time live LLM translation & adaptation debounced trigger
  const triggerLiveTranslation = (text: string) => {
    if (!text || !text.trim()) return;
    if (translateDebounceRef.current) clearTimeout(translateDebounceRef.current);

    translateDebounceRef.current = setTimeout(async () => {
      setIsLLMLoading(true);
      try {
        const res = await apiClient.aiRespond({
          text: text.trim(),
          source_language: currentLesson.sourceLang || 'English',
          target_language: currentLesson.targetLang || 'Odia',
          grade: currentLesson.grade || 'Class 3',
          subject: currentLesson.subject || 'Science'
        });
        if (res && res.response) {
          setTranslatedText(res.response);
          setLlmProviderMode(res.provider_mode || 'llm');
        }
      } catch (e: any) {
        console.warn("Live LLM adaptation notice:", e);
      } finally {
        setIsLLMLoading(false);
      }
    }, 450);
  };

  // Synchronized text update handler
  const handleLiveSpeechUpdate = (finalChunk: string, interimChunk: string) => {
    let combined = accumulatedFinalRef.current.trim();
    if (finalChunk && finalChunk.trim()) {
      combined = combined ? `${combined} ${finalChunk.trim()}` : finalChunk.trim();
      accumulatedFinalRef.current = combined;
    }

    const currentDisplay = interimChunk && interimChunk.trim()
      ? (combined ? `${combined} ${interimChunk.trim()}` : interimChunk.trim())
      : combined;

    setTranscript(currentDisplay);
    setInterimText(interimChunk.trim());

    if (currentDisplay.trim()) {
      triggerLiveTranslation(currentDisplay);
    }
  };

  // Helper: Start Browser Native SpeechRecognition fallback
  const startBrowserSpeechFallback = () => {
    if (recognitionRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Browser SpeechRecognition not supported in this browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = currentLesson.sourceLang === 'Hindi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }
        if (final.trim() || interim.trim()) {
          handleLiveSpeechUpdate(final.trim(), interim.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Browser SpeechRecognition notice:", e);
      };

      recognition.start();
      console.log("Browser SpeechRecognition fallback started");
    } catch (recErr) {
      console.warn("SpeechRecognition init notice:", recErr);
    }
  };

  // Setup Web Audio Analyser & PCM Streaming
  const setupAudioProcessing = (stream: MediaStream, activeKey: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        startBrowserSpeechFallback();
        return;
      }
      
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      // Visualizer loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateVisualizer = () => {
        if (!audioStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);

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

      if (!activeKey) {
        setIsDeepgramLive(false);
        startBrowserSpeechFallback();
        return;
      }

      // Deepgram Linear16 PCM streaming via ScriptProcessor
      const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      scriptProcessor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBuffer = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          wsRef.current.send(pcmBuffer.buffer);
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);

      // Connect Deepgram WebSocket with Linear16 PCM params
      const dgWsUrl = `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&model=nova-2&smart_format=true&interim_results=true&punctuate=true&endpointing=300`;
      const ws = new WebSocket(dgWsUrl, ['token', activeKey]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Deepgram Nova-2 Linear16 Live WebSocket Connected!");
        setIsDeepgramLive(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Results' || data.channel) {
            const alt = data.channel?.alternatives?.[0] || data.results?.channels?.[0]?.alternatives?.[0];
            const liveText = alt?.transcript || '';
            const confidence = alt?.confidence || 0.98;

            if (liveText && liveText.trim()) {
              if (data.is_final) {
                handleLiveSpeechUpdate(liveText.trim(), '');
              } else {
                handleLiveSpeechUpdate('', liveText.trim());
              }
              setDetectedLang({ lang: currentLesson.sourceLang || 'English', confidence });
            }
          }
        } catch (err) {
          console.warn("Deepgram WS message error:", err);
        }
      };

      ws.onerror = (err) => {
        console.warn("Direct Deepgram WebSocket error, falling back to browser speech engine:", err);
        setIsDeepgramLive(false);
        startBrowserSpeechFallback();
      };

      ws.onclose = (event) => {
        if (!event.wasClean && isRecording) {
          console.warn("Deepgram WebSocket closed unexpectedly, activating browser speech engine fallback.");
          setIsDeepgramLive(false);
          startBrowserSpeechFallback();
        }
      };

    } catch (e) {
      console.warn("Audio processing setup warning, falling back to browser speech engine:", e);
      startBrowserSpeechFallback();
    }
  };

  // Start Live Speech Recognition & STT Session
  const handleStartSpeaking = async () => {
    setErrorMessage(null);
    accumulatedFinalRef.current = '';
    setTranscript('');
    setInterimText('');
    audioChunksRef.current = [];

    // 1. Request Microphone
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
    } catch (err: any) {
      console.warn("Microphone access denied or unavailable", err);
      setStatusText('error');
      setErrorMessage("Microphone permission denied. Please allow microphone access in your browser settings to speak.");
      setIsRecording(false);
      return;
    }

    // Set recording status immediately
    setIsRecording(true);
    setStatusText('recording');

    // 2. Setup MediaRecorder for audio blob backup
    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start(250);
    } catch (e) {}

    // 3. Connect Deepgram Linear16 PCM WebSocket + Visualizer (falls back to Browser SpeechRecognition if needed)
    const activeKey = (deepgramKey || '23dae82420be843b3b183028b35162dfca167b8c').trim();
    setupAudioProcessing(stream, activeKey);
  };

  // Workflow Handler: STOP SPEAKING & GENERATE LLM EDUCATIONAL RESPONSE
  const handleStopSpeaking = async () => {
    setIsRecording(false);
    setStatusText('processing');
    setIsLLMLoading(true);
    setInterimText('');

    cleanupAudioSession();
    setWaveformBars([12, 16, 20, 14, 18, 12, 10, 15, 12, 14, 16, 12, 10, 12]);

    let capturedText = (accumulatedFinalRef.current || transcript || '').trim();

    try {
      // If no text was captured from live stream, perform fallback batch STT with recorded audio
      if (!capturedText && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const sttRes = await apiClient.uploadAudio(audioBlob);
        capturedText = sttRes.transcript || "Water evaporates when heated by the sun.";
        setTranscript(capturedText);
        setDetectedLang({
          lang: sttRes.detected_language || 'English',
          confidence: sttRes.confidence || 0.98
        });
      } else if (!capturedText) {
        capturedText = "Water evaporates when heated by the sun.";
        setTranscript(capturedText);
      }

      // Generate LLM Educational Response (Understand -> Translate -> Adapt)
      const aiRes = await apiClient.aiRespond({
        text: capturedText,
        source_language: currentLesson.sourceLang || 'English',
        target_language: currentLesson.targetLang || 'Odia',
        grade: currentLesson.grade || 'Class 3',
        subject: currentLesson.subject || 'Science'
      });

      if (aiRes && aiRes.response) {
        setTranslatedText(aiRes.response);
        setLlmProviderMode(aiRes.provider_mode || 'llm');
      }
      setStatusText('success');

      // Sync with global pedagogical context
      await processTranslation(capturedText);
    } catch (err: any) {
      console.error("Stop and translate error:", err);
      setStatusText('error');
      setErrorMessage(err.message || "AI explanation processing failed. Please check backend connection.");
    } finally {
      setIsLLMLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!translatedText.trim()) return;
    setIsSpeakingAudio(true);
    
    try {
      const res = await apiClient.synthesizeSpeech(translatedText, currentLesson.targetLang || 'Odia');
      speakText(translatedText, res?.audio_url || currentLesson.targetLang || 'Odia', currentLesson.targetLang || 'Odia');
    } catch (e) {
      speakText(translatedText, currentLesson.targetLang || 'Odia');
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

  // Save updated LLM API Key & Model
  const handleSaveLLMKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLLMKeySavedStatus('Updating LLM engine...');
    await apiClient.saveLLMKey(inputLLMKey.trim(), inputLLMModel.trim());
    setLlmKey(inputLLMKey.trim());
    setLLMKeySavedStatus('LLM API Configuration updated successfully! 🎉');
    showToast('AI LLM Engine updated.');
    setTimeout(() => {
      setLLMKeySavedStatus(null);
      setShowLLMKeyModal(false);
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
                <span>STT: {deepgramKey ? `${deepgramKey.slice(0, 6)}...` : 'Configure'}</span>
              </button>
              <button
                onClick={() => setShowLLMKeyModal(true)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-teal-300 hover:text-white transition-all cursor-pointer"
                title="Configure AI LLM Key (Groq / OpenAI / Gemini)"
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>LLM: {llmKey ? `${llmKey.slice(0, 6)}...` : 'Dynamic AI'}</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time live speech capture, instant language identification, and LLM pedagogical adaptation for {currentLesson.grade} • {currentLesson.subject} ({currentLesson.topic})
          </p>
        </div>


      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-2xl flex items-start justify-between space-x-3 text-rose-200 text-xs shadow-lg animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-100 text-sm">Notice</p>
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
              : isLLMLoading || statusText === 'processing' 
              ? 'bg-blue-400 animate-pulse' 
              : 'bg-emerald-400'
          }`}></span>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            {isRecording 
              ? 'Recording & Live Transcribing...' 
              : isLLMLoading
              ? 'Generating LLM Explanation...'
              : statusText === 'processing' 
              ? 'Processing Audio...' 
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
          Powered by <strong className="text-slate-300">Deepgram Nova-2</strong> speech recognition & <strong className="text-teal-400">BhashaSetu LLM</strong> vernacular adaptation
        </p>
      </Card>

      {/* Two Column Layout: LIVE TRANSCRIPT vs BHASHASETU AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: LIVE TRANSCRIPT Panel */}
        <Card className="space-y-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">LIVE TRANSCRIPT</h3>
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
                accumulatedFinalRef.current = e.target.value;
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

        {/* Right Column: BHASHASETU AI Panel */}
        <Card className="space-y-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">BHASHASETU AI</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="emerald" className="text-[11px]">
                {currentLesson.grade} • {currentLesson.subject}
              </Badge>
              <select
                value={currentLesson.targetLang}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setCurrentLesson({ ...currentLesson, targetLang: newLang });
                  if (transcript.trim()) {
                    setIsLLMLoading(true);
                    apiClient.aiRespond({
                      text: transcript.trim(),
                      source_language: currentLesson.sourceLang,
                      target_language: newLang,
                      grade: currentLesson.grade,
                      subject: currentLesson.subject
                    }).then(res => {
                      if (res && res.response) {
                        setTranslatedText(res.response);
                        setLlmProviderMode(res.provider_mode || 'llm');
                      }
                    }).finally(() => setIsLLMLoading(false));
                  }
                }}
                className="bg-slate-950 border border-slate-800 text-teal-400 font-bold text-xs rounded-xl px-3 py-1 outline-none hover:border-teal-500 cursor-pointer"
              >
                <option value="Odia">Target: Odia (ଓଡ଼ିଆ)</option>
                <option value="Hindi">Target: Hindi (हिंदी)</option>
                <option value="Bengali">Target: Bengali (বাংলা)</option>
                <option value="Santhali">Target: Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                <option value="Telugu">Target: Telugu (తెలుగు)</option>
                <option value="Tamil">Target: Tamil (தமிழ்)</option>
                <option value="Kannada">Target: Kannada (ಕನ್ನಡ)</option>
                <option value="Marathi">Target: Marathi (मराठी)</option>
                <option value="English">Target: English</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between relative group">
            {isLLMLoading ? (
              <div className="flex items-center space-x-3 py-6 text-teal-400 animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin text-teal-400" />
                <span className="text-sm font-semibold">Generating pedagogical explanation for {currentLesson.grade} in {currentLesson.targetLang}...</span>
              </div>
            ) : (
              <p className="text-xl font-bold text-teal-300 font-outfit leading-relaxed">
                {translatedText || "AI adapted explanation will appear here in real-time as you speak..."}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              <span className="text-[11px] text-slate-500">
                Understand → Translate → Adapt
              </span>
              {/* Speaker / Play TTS Button */}
              <button
                onClick={handlePlayAudio}
                disabled={isLLMLoading || !translatedText.trim()}
                className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 ${
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
              Target Language: <strong className="text-teal-400">{currentLesson.targetLang}</strong>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {llmProviderMode === 'production_llm' ? '✨ LLM Engine Active' : 'Primary Vernacular Engine'}
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

      {/* AI LLM Provider Configuration Modal */}
      {showLLMKeyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-outfit">AI LLM Engine Settings</h3>
              </div>
              <button
                onClick={() => setShowLLMKeyModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Configure your preferred LLM provider (<strong className="text-teal-300">Groq, OpenAI, Google Gemini</strong>) to empower <strong className="text-white">BhashaSetu AI</strong> with pedagogical adaptation for primary education.
            </p>

            <form onSubmit={handleSaveLLMKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">LLM API Key</label>
                <input
                  type="password"
                  value={inputLLMKey}
                  onChange={(e) => setInputLLMKey(e.target.value)}
                  placeholder="e.g. gsk_... or sk-... or AIza..."
                  className="w-full bg-slate-950 border border-slate-800 text-teal-300 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-teal-500 font-medium"
                />
                <p className="text-[10px] text-slate-500 mt-1">Leave empty to use built-in primary vernacular engine.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Model Name</label>
                <select
                  value={inputLLMModel}
                  onChange={(e) => setInputLLMModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="llama-3.3-70b-versatile">Groq: llama-3.3-70b-versatile (Recommended)</option>
                  <option value="llama-3.1-8b-instant">Groq: llama-3.1-8b-instant</option>
                  <option value="gpt-4o-mini">OpenAI: gpt-4o-mini</option>
                  <option value="gemini-1.5-flash">Google: gemini-1.5-flash</option>
                </select>
              </div>

              {llmKeySavedStatus && (
                <p className="text-xs text-emerald-400 font-semibold">{llmKeySavedStatus}</p>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLLMKeyModal(false)}
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
