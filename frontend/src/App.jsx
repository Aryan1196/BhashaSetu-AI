import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { WelcomeScreen } from './panels/01_WelcomeScreen';
import { TeacherDashboard } from './panels/02_TeacherDashboard';
import { NewLessonSetup } from './panels/03_NewLessonSetup';
import { LiveTranslation } from './panels/04_LiveTranslation';
import { PedagogicalAdaptation } from './panels/05_PedagogicalAdaptation';
import { CurriculumManagement } from './panels/06_CurriculumManagement';
import { StudentAITutor } from './panels/07_StudentAITutor';
import { QuizScreen } from './panels/08_QuizScreen';
import { QuizResult } from './panels/09_QuizResult';
import { ReportsAnalytics } from './panels/10_ReportsAnalytics';
import { SettingsProfile } from './panels/11_SettingsProfile';

function MainContent() {
  const { activePanel } = useApp();

  const renderPanel = () => {
    switch (activePanel) {
      case 1:
        return <WelcomeScreen />;
      case 2:
        return <TeacherDashboard />;
      case 3:
        return <NewLessonSetup />;
      case 4:
        return <LiveTranslation />;
      case 5:
        return <PedagogicalAdaptation />;
      case 6:
        return <CurriculumManagement />;
      case 7:
        return <StudentAITutor />;
      case 8:
        return <QuizScreen />;
      case 9:
        return <QuizResult />;
      case 10:
        return <ReportsAnalytics />;
      case 11:
        return <SettingsProfile />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070D1F] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Right Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
