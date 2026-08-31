import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { RoleSelectionPage } from './panels/RoleSelectionPage';
import { WelcomeScreen } from './panels/01_WelcomeScreen';
import { TeacherDashboard } from './panels/TeacherDashboard';
import { StudentDashboard } from './panels/StudentDashboard';
import { NewLessonSetup } from './panels/03_NewLessonSetup';
import { LiveTranslationModule } from './panels/LiveTranslationModule';
import { PedagogicalAdaptation } from './panels/05_PedagogicalAdaptation';
import { StudentAITutor } from './panels/07_StudentAITutor';
import { SettingsProfile } from './panels/11_SettingsProfile';

function LayoutWrapper() {
  const { activePanel, userRole } = useApp();
  const location = useLocation();

  const isCategorySelectionPage = location.pathname === '/' || location.pathname === '/select-role';

  return (
    <div className="flex min-h-screen bg-[#071120] text-slate-100 font-sans">
      {/* Hide Sidebar navigation on category selection page */}
      {!isCategorySelectionPage && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Hide Header controls on category selection page */}
        {!isCategorySelectionPage && <Header />}
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/select-role" element={<RoleSelectionPage />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/teacher/live" element={<LiveTranslationModule />} />
            <Route path="/teacher/new-lesson" element={<NewLessonSetup />} />
            <Route path="/pedagogy" element={<PedagogicalAdaptation />} />
            <Route path="/tutor" element={<StudentAITutor />} />
            <Route path="/settings" element={<SettingsProfile />} />
            {/* Fallback routing */}
            <Route path="*" element={
              userRole === 'Student' ? <StudentDashboard /> :
              activePanel === 4 ? <LiveTranslationModule /> :
              activePanel === 2 ? <TeacherDashboard /> :
              activePanel === 1 ? <WelcomeScreen /> :
              activePanel === 5 ? <PedagogicalAdaptation /> :
              activePanel === 7 ? <StudentAITutor /> :
              activePanel === 11 ? <SettingsProfile /> :
              <TeacherDashboard />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <LayoutWrapper />
      </BrowserRouter>
    </AppProvider>
  );
}
