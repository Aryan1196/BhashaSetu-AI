import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AppContext = createContext();

export const initialDocuments = [
  { id: 1, name: 'Class 3 Science Water Cycle.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Ready' },
  { id: 2, name: 'Plants and Their Parts.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Ready' },
  { id: 3, name: 'Animals Around Us.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Processing' },
  { id: 4, name: 'Our Environment.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Ready' },
];

export const AppProvider = ({ children }) => {
  const [activePanel, setActivePanel] = useState(1);
  const [userRole, setUserRole] = useState('Teacher');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  
  const [currentLesson, setCurrentLesson] = useState({
    grade: 'Class 3',
    subject: 'Science',
    topic: 'Water Cycle',
    sourceLang: 'English',
    targetLang: 'Odia'
  });

  // Translation result that flows between modules
  const [translationResult, setTranslationResult] = useState(null);

  // Quiz state that flows between QuizScreen and QuizResult
  const [quizData, setQuizData] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Pedagogical adaptation result from backend
  const [pedagogyResult, setPedagogyResult] = useState(null);

  const [userProfile, setUserProfile] = useState({
    name: 'Teacher',
    email: 'teacher@bhashasetu.ai',
    school: 'Government Primary School',
    role: 'Teacher',
    gradeSubject: 'Class 3 - Science'
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('bhashasetu_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [documents, setDocuments] = useState(initialDocuments);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Synchronize theme to document element and localStorage
  useEffect(() => {
    localStorage.setItem('bhashasetu_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Check backend health on mount
  useEffect(() => {
    apiClient.getHealth().then((res) => {
      setBackendStatus(res.status === 'online' || res.status === 'ok' ? 'Backend Live (Django)' : 'Offline (Fallback Mode)');
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Full pipeline: STT -> LLM Educational Adaptation (Understand -> Translate -> Adapt)
  const processTranslation = async (text) => {
    try {
      const [transRes, aiRes] = await Promise.allSettled([
        apiClient.translate({
          text,
          source_lang: currentLesson.sourceLang,
          target_lang: currentLesson.targetLang,
          grade: currentLesson.grade,
          subject: currentLesson.subject,
          topic: currentLesson.topic
        }),
        apiClient.aiRespond({
          text,
          source_language: currentLesson.sourceLang,
          target_language: currentLesson.targetLang,
          grade: currentLesson.grade,
          subject: currentLesson.subject
        })
      ]);

      const transData = transRes.status === 'fulfilled' ? transRes.value : null;
      const aiData = aiRes.status === 'fulfilled' ? aiRes.value : null;

      const adaptedText = aiData?.response || transData?.pedagogical_adaptation || "ପାଠ୍ୟକ୍ରମ ଆଧାରିତ ଶିକ୍ଷଣ ବିବରଣୀ";

      setTranslationResult({
        directTranslation: transData?.direct_translation || adaptedText,
        pedagogicalAdaptation: adaptedText,
        keyPoints: transData?.key_points || ["Sun warms water and changes it into vapor.", "Vapor rises up to form clouds."],
        ragSource: transData?.rag_source || `${currentLesson.grade} ${currentLesson.subject}`
      });

      return transData || { direct_translation: adaptedText, pedagogical_adaptation: adaptedText };
    } catch (e) {
      console.warn("Translation pipeline notice:", e);
      return null;
    }
  };

  // Fetch pedagogical explanation from backend
  const fetchPedagogy = async (text) => {
    try {
      const gradeNum = parseInt(currentLesson.grade.replace('Class', '').trim()) || 3;
      const res = await apiClient.pedagogyExplain(text, gradeNum, currentLesson.subject, currentLesson.targetLang);
      setPedagogyResult(res);
      return res;
    } catch (err) {
      console.error('Pedagogy fetch failed:', err);
      return null;
    }
  };

  // Generate quiz from backend
  const generateQuiz = async () => {
    try {
      const res = await apiClient.generateQuiz(
        currentLesson.topic,
        currentLesson.grade,
        currentLesson.subject,
        currentLesson.targetLang
      );
      setQuizData(res);
      return res;
    } catch (err) {
      console.error('Quiz generation failed:', err);
      return null;
    }
  };

  // Evaluate quiz answers via backend
  const evaluateQuiz = async (quizId, answers) => {
    try {
      const res = await apiClient.evaluateQuiz(quizId, answers);
      setQuizResult(res);
      return res;
    } catch (err) {
      console.error('Quiz evaluation failed:', err);
      return null;
    }
  };

  // Dual-mode TTS speaker: Backend synthesized audio URL or browser SpeechSynthesis fallback
  const speakText = (text, audioUrlOrLang = 'Odia', langParam = 'Odia') => {
    if (!text) return;

    if (typeof audioUrlOrLang === 'string' && (audioUrlOrLang.startsWith('data:audio') || audioUrlOrLang.startsWith('http'))) {
      try {
        const audio = new Audio(audioUrlOrLang);
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          speakBrowserUtterance(text, langParam);
        };
        audio.play().then(() => {
          return;
        }).catch(() => {
          speakBrowserUtterance(text, langParam);
        });
        return;
      } catch (err) {
        console.warn('Audio play failed, falling back to browser synthesis', err);
      }
    }

    const lang = typeof audioUrlOrLang === 'string' && !audioUrlOrLang.startsWith('data:') && !audioUrlOrLang.startsWith('http') 
      ? audioUrlOrLang 
      : langParam;

    speakBrowserUtterance(text, lang);
  };

  const speakBrowserUtterance = (text, lang = 'Odia') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      
      const langMap = {
        'Odia': 'or-IN',
        'Hindi': 'hi-IN',
        'English': 'en-IN',
        'Santhali': 'sat-IN',
        'Bengali': 'bn-IN'
      };
      utterance.lang = langMap[lang] || 'or-IN';

      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => 
        v.lang.toLowerCase().includes(utterance.lang.toLowerCase()) || 
        v.lang.toLowerCase().includes((lang || 'Odia').toLowerCase().slice(0, 2))
      );
      if (targetVoice) {
        utterance.voice = targetVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Text-to-speech not supported on this browser.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activePanel,
        setActivePanel,
        userRole,
        setUserRole,
        backendStatus,
        currentLesson,
        setCurrentLesson,
        translationResult,
        setTranslationResult,
        processTranslation,
        pedagogyResult,
        setPedagogyResult,
        fetchPedagogy,
        quizData,
        setQuizData,
        quizResult,
        setQuizResult,
        generateQuiz,
        evaluateQuiz,
        userProfile,
        setUserProfile,
        documents,
        setDocuments,
        isSpeaking,
        speakText,
        toastMessage,
        showToast,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
