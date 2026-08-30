import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const initialDocuments = [
  { id: 1, name: 'Class 3 Science Water Cycle.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Ready' },
  { id: 2, name: 'Plants and Their Parts.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Ready' },
  { id: 3, name: 'Animals Around Us.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Processing' },
  { id: 4, name: 'Our Environment.pdf', grade: 'Class 3', subject: 'Science', lang: 'Odia', status: 'Ready' },
];

export const AppProvider = ({ children }) => {
  const [activePanel, setActivePanel] = useState(1); // 1 to 11
  const [userRole, setUserRole] = useState('Teacher'); // 'Teacher' or 'Student'
  
  const [currentLesson, setCurrentLesson] = useState({
    grade: 'Class 3',
    subject: 'Science',
    topic: 'Water Cycle',
    sourceLang: 'English',
    targetLang: 'Odia'
  });

  const [userProfile, setUserProfile] = useState({
    name: 'Teacher',
    email: 'teacher@bhashasetu.ai',
    school: 'Government Primary School',
    role: 'Teacher',
    gradeSubject: 'Class 3 - Science'
  });

  const [documents, setDocuments] = useState(initialDocuments);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
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
        currentLesson,
        setCurrentLesson,
        userProfile,
        setUserProfile,
        documents,
        setDocuments,
        isSpeaking,
        speakText,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
