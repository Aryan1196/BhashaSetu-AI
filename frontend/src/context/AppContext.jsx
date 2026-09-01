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

  const [currentLesson, setCurrentLessonState] = useState(() => {
    const saved = localStorage.getItem('bhashasetu_current_lesson');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.topic || parsed.grade || parsed.subject)) {
          return parsed;
        }
      } catch (e) { }
    }
    return {
      grade: '',
      subject: '',
      topic: '',
      sourceLang: 'English',
      targetLang: 'Odia'
    };
  });

  const setCurrentLesson = (newLesson) => {
    setCurrentLessonState(newLesson);
    try {
      localStorage.setItem('bhashasetu_current_lesson', JSON.stringify(newLesson));
    } catch (e) { }
  };

  const [recentLessons, setRecentLessons] = useState([]);

  const loadLessons = async () => {
    try {
      const data = await apiClient.getLessons();
      if (data && Array.isArray(data) && data.length > 0) {
        setRecentLessons(data);
      }
    } catch (err) {
      console.warn("Failed to load lessons from backend:", err);
    }
  };

  const saveLesson = async (lessonData) => {
    try {
      const topicTitle = (lessonData.topic || lessonData.title || '').trim() ||
        `${lessonData.subject || 'Science'} Lesson`;
      const created = await apiClient.createLesson({
        topic: topicTitle,
        title: topicTitle,
        grade: lessonData.grade || 'Class 3',
        subject: lessonData.subject || 'Science',
        source_lang: lessonData.sourceLang || lessonData.source || 'English',
        target_lang: lessonData.targetLang || lessonData.target || 'Odia'
      });
      setRecentLessons((prev) => [created, ...prev]);
      const updatedLesson = {
        grade: created.grade || lessonData.grade || 'Class 3',
        subject: created.subject || lessonData.subject || 'Science',
        topic: created.title || topicTitle,
        sourceLang: created.source_lang || lessonData.sourceLang || 'English',
        targetLang: created.target_lang || lessonData.targetLang || 'Odia'
      };
      setCurrentLesson(updatedLesson);
      return created;
    } catch (err) {
      console.warn("Failed to save lesson:", err);
      return null;
    }
  };

  // Translation result that flows between modules
  const [translationResult, setTranslationResult] = useState(null);

  // Quiz state that flows between QuizScreen and QuizResult
  const [quizData, setQuizData] = useState(null);
  const [quizResult, setQuizResult] = useState(null);

  // Pedagogical adaptation result from backend
  const [pedagogyResult, setPedagogyResult] = useState(null);

  // Lesson queries & answers history (stores all live translated queries + student questions for current lesson)
  const [lessonQAHistory, setLessonQAHistory] = useState([
    {
      id: 1,
      query: "Today we are going to learn about the water cycle.",
      direct_translation: "ଆଜି ଆମେ ପାଣି ଚକ୍ର ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।",
      answer: "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।",
      pedagogical_adaptation: "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।",
      key_points: ["ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ଗରମ ହୁଏ ।", "ଗରମ ହେଲେ ପାଣି ବାଷ୍ପ ହୋଇ ଉପରକୁ ଉଠିଯାଏ ।"],
      timestamp: "10:30 AM"
    }
  ]);

  const [userProfile, setUserProfile] = useState({
    name: 'Teacher',
    email: 'teacher@bhashasetu.ai',
    school: 'Government Primary School',
    role: 'Teacher',
    gradeSubject: 'Class 3 - Science'
  });

  const [theme, setTheme] = useState('light');

  const [documents, setDocuments] = useState(initialDocuments);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Synchronize theme to document element and localStorage (Permanently Light Mode)
  useEffect(() => {
    localStorage.setItem('bhashasetu_theme', 'light');
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    if (document.body) {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    // Light mode locked by default
  };

  // Check backend health and load lessons on mount
  useEffect(() => {
    apiClient.getHealth().then((res) => {
      setBackendStatus(res.status === 'online' || res.status === 'ok' ? 'Backend Live (Django)' : 'Offline (Fallback Mode)');
    });
    loadLessons();
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
          source_lang: currentLesson.sourceLang || 'English',
          target_lang: currentLesson.targetLang || 'Odia',
          grade: currentLesson.grade || 'Class 3',
          subject: currentLesson.subject || 'Science',
          topic: currentLesson.topic || 'Lesson'
        }),
        apiClient.aiRespond({
          text,
          source_language: currentLesson.sourceLang || 'English',
          target_language: currentLesson.targetLang || 'Odia',
          grade: currentLesson.grade || 'Class 3',
          subject: currentLesson.subject || 'Science'
        })
      ]);

      const transData = transRes.status === 'fulfilled' ? transRes.value : null;
      const aiData = aiRes.status === 'fulfilled' ? aiRes.value : null;

      const directText = transData?.direct_translation || "ଆଜି ଆମେ ପାଠ ଶିଖିବାକୁ ଯାଉଛୁ ।";
      const adaptedText = aiData?.response || transData?.pedagogical_adaptation || "ପାଠ୍ୟକ୍ରମ ଆଧାରିତ ଶିକ୍ଷଣ ବିବରଣୀ";
      const keyPoints = transData?.key_points || aiData?.key_points || ["ସୂର୍ଯ୍ୟଙ୍କ ତାପ ଯୋଗୁଁ ପାଣି ଗରମ ହୁଏ ।"];

      const translationData = {
        directTranslation: directText,
        pedagogicalAdaptation: adaptedText,
        keyPoints: keyPoints,
        ragSource: transData?.rag_source || `${currentLesson.grade || 'Class 3'} ${currentLesson.subject || 'Science'}`
      };
      setTranslationResult(translationData);

      setPedagogyResult({
        simple_explanation: adaptedText,
        key_points: keyPoints,
        example: aiData?.example || "",
        learner_question: aiData?.follow_up_question || ""
      });

      const newQaItem = {
        id: Date.now(),
        query: text,
        direct_translation: directText,
        answer: adaptedText,
        pedagogical_adaptation: adaptedText,
        key_points: keyPoints,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setLessonQAHistory(prev => [newQaItem, ...prev]);

      // Save to database
      saveLesson({
        topic: currentLesson.topic || `${currentLesson.subject || 'Science'} Lesson`,
        grade: currentLesson.grade || 'Class 3',
        subject: currentLesson.subject || 'Science',
        sourceLang: currentLesson.sourceLang || 'English',
        targetLang: currentLesson.targetLang || 'Odia',
        transcript: text,
        direct_translation: directText,
        pedagogical_adaptation: adaptedText,
        key_points: keyPoints,
        example: aiData?.example || "",
        learner_question: aiData?.follow_up_question || "",
        qa_history: [newQaItem]
      });

      return transData || { direct_translation: directText, pedagogical_adaptation: adaptedText };
    } catch (e) {
      console.warn("Translation pipeline notice:", e);
      return null;
    }
  };

  // Helper to load past lecture for review and navigate to Translation + Pedagogy screen
  const selectLessonForReview = (lesson) => {
    if (!lesson) return;
    const updatedLesson = {
      id: lesson.id,
      grade: lesson.grade || 'Class 3',
      subject: lesson.subject || 'Science',
      topic: lesson.title || lesson.topic || 'Lesson',
      sourceLang: lesson.source_lang || lesson.source || 'English',
      targetLang: lesson.target_lang || lesson.target || 'Odia'
    };
    setCurrentLesson(updatedLesson);

    const directTranslation = lesson.direct_translation || lesson.directTranslation || 'ଆଜି ଆମେ ପାଠ ଶିଖିବାକୁ ଯାଉଛୁ ।';
    const pedagogicalAdaptation = lesson.pedagogical_adaptation || lesson.pedagogicalAdaptation || 'ପାଠ୍ୟକ୍ରମ ଆଧାରିତ ଶିକ୍ଷଣ ବିବରଣୀ';
    const keyPoints = Array.isArray(lesson.key_points) && lesson.key_points.length > 0
      ? lesson.key_points
      : (Array.isArray(lesson.keyPoints) && lesson.keyPoints.length > 0 ? lesson.keyPoints : ["ପାଠ୍ୟକ୍ରମ ଆଧାରିତ ମୁଖ୍ୟ ବିନ୍ଦୁ ।"]);

    setTranslationResult({
      directTranslation,
      pedagogicalAdaptation,
      keyPoints,
      ragSource: `${updatedLesson.grade} ${updatedLesson.subject} - ${updatedLesson.topic} (State Textbook)`
    });

    setPedagogyResult({
      simple_explanation: pedagogicalAdaptation,
      key_points: keyPoints,
      example: lesson.example || '',
      learner_question: lesson.learner_question || ''
    });

    const initialQAs = Array.isArray(lesson.qa_history) && lesson.qa_history.length > 0
      ? lesson.qa_history
      : [
          {
            id: 1,
            query: lesson.transcript || `What is ${updatedLesson.topic}?`,
            direct_translation: directTranslation,
            answer: pedagogicalAdaptation,
            pedagogical_adaptation: pedagogicalAdaptation,
            key_points: keyPoints,
            timestamp: lesson.date || "10:30 AM"
          },
          {
            id: 2,
            query: `Can you explain the key concepts of ${updatedLesson.topic}?`,
            direct_translation: `${updatedLesson.topic} ର ମୁଖ୍ୟ ଧାରଣା କ'ଣ ?`,
            answer: lesson.example || pedagogicalAdaptation,
            pedagogical_adaptation: lesson.example || pedagogicalAdaptation,
            key_points: keyPoints,
            timestamp: lesson.date || "10:35 AM"
          }
        ];
    setLessonQAHistory(initialQAs);

    setActivePanel(5);
  };

  // Ask Question on Specific Lesson (appends query and answered explanation to this lesson's Q&A)
  const addLessonQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    try {
      const res = await apiClient.askLessonQuery({
        query: queryText,
        lesson_id: currentLesson?.id,
        grade: currentLesson?.grade || 'Class 3',
        subject: currentLesson?.subject || 'Science',
        topic: currentLesson?.topic || 'Lesson',
        target_lang: currentLesson?.targetLang || 'Odia',
        source_lang: currentLesson?.sourceLang || 'English'
      });

      if (res && res.entry) {
        setLessonQAHistory(prev => [res.entry, ...prev]);
      }
      return res;
    } catch (e) {
      console.warn("Failed to add lesson query:", e);
    }
  };

  // Fetch pedagogical explanation from backend
  const fetchPedagogy = async (text) => {
    try {
      const gradeNum = parseInt((currentLesson.grade || 'Class 3').replace('Class', '').trim()) || 3;
      const res = await apiClient.pedagogyExplain(text, gradeNum, currentLesson.subject || 'Science', currentLesson.targetLang || 'Odia');
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
        recentLessons,
        setRecentLessons,
        loadLessons,
        saveLesson,
        selectLessonForReview,
        translationResult,
        setTranslationResult,
        processTranslation,
        pedagogyResult,
        setPedagogyResult,
        fetchPedagogy,
        lessonQAHistory,
        setLessonQAHistory,
        addLessonQuery,
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
