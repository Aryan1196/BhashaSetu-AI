import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Users, Languages, Award, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const TeacherDashboard: React.FC = () => {
  const { setActivePanel, currentLesson, setCurrentLesson, userProfile } = useApp();
  const navigate = useNavigate();

  const handleStartLiveTranslation = () => {
    setActivePanel(4);
    navigate('/teacher/live');
  };

  const recentLessons = [
    { id: 1, title: 'Water Cycle', topic: 'Science', grade: 'Class 3', source: 'English', target: 'Odia', date: '20 May 2025' },
    { id: 2, title: 'Plants', topic: 'Science', grade: 'Class 3', source: 'English', target: 'Odia', date: '18 May 2025' },
    { id: 3, title: 'Animals', topic: 'Science', grade: 'Class 3', source: 'English', target: 'Odia', date: '16 May 2025' },
    { id: 4, title: 'Our Environment', topic: 'Science', grade: 'Class 3', source: 'English', target: 'Odia', date: '14 May 2025' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* 1. Welcome Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Government of Jharkhand EdTech Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">
            Welcome to BhashaSetu AI
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Empowering primary school teachers with real-time vernacular translation, grade-aware pedagogy, and curriculum-grounded AI assistance.
          </p>
        </div>

        <div className="shrink-0 z-10 flex items-center space-x-3">
          <Button variant="secondary" onClick={() => { setActivePanel(3); navigate('/teacher/new-lesson'); }}>
            <BookOpen className="w-4 h-4" />
            <span>Setup New Lesson</span>
          </Button>
        </div>
      </div>

      {/* 5. Quick Statistics Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Overview</h3>
          <span className="text-[11px] text-slate-500 font-mono">* Demo metrics for hackathon MVP</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-white font-outfit">12</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Lessons</p>
          </Card>

          <Card className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2 border border-teal-500/30">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-teal-400 font-outfit">35</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Students</p>
          </Card>

          <Card className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 border border-purple-500/30">
              <Languages className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-purple-400 font-outfit">4</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Languages</p>
          </Card>

          <Card className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-3xl font-extrabold text-amber-400 font-outfit">8</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">Assessments</p>
          </Card>
        </div>
      </div>

      {/* Main Grid: New Lesson Card & Recent Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. New Lesson Card */}
        <div className="lg:col-span-6">
          <Card className="space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                ⚡
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-outfit">New Lesson Configuration</h2>
                <p className="text-xs text-slate-400">Setup live translation parameters</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Grade */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Grade</label>
                <select
                  value={currentLesson.grade}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, grade: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 font-medium outline-none focus:border-blue-500"
                >
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Subject</label>
                <select
                  value={currentLesson.subject}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 font-medium outline-none focus:border-blue-500"
                >
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Environmental Studies">Environmental Studies</option>
                  <option value="English">English</option>
                </select>
              </div>

              {/* Source & Target Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Source Language</label>
                  <select
                    value={currentLesson.sourceLang}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, sourceLang: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 font-medium outline-none focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Target Language</label>
                  <select
                    value={currentLesson.targetLang}
                    onChange={(e) => setCurrentLesson({ ...currentLesson, targetLang: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-teal-400 font-bold rounded-xl p-3.5 outline-none focus:border-teal-500"
                  >
                    <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Large Button: START LIVE TRANSLATION */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartLiveTranslation}
                className="w-full py-4 text-sm tracking-wider uppercase font-extrabold"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START LIVE TRANSLATION</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* 4. Recent Lessons */}
        <div className="lg:col-span-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-outfit">Recent Lessons</h3>
                <p className="text-xs text-slate-400">Classroom sessions history</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setActivePanel(5); navigate('/pedagogy'); }}>
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => { setActivePanel(5); navigate('/pedagogy'); }}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/60 border border-slate-800/80 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30 group-hover:scale-105 transition-transform">
                      📖
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {lesson.grade} • {lesson.topic} • {lesson.source} → {lesson.target}
                      </p>
                    </div>
                  </div>
                  <Badge variant="blue" className="font-mono">
                    {lesson.date}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
