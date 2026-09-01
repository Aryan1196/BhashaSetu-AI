import React from 'react';
import { 
  Play, 
  BookOpen, 
  Users, 
  Languages, 
  CheckSquare, 
  Clock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TeacherDashboard = () => {
  const { setActivePanel, setCurrentLesson, userProfile, recentLessons, saveLesson } = useApp();

  const [quickForm, setQuickForm] = React.useState({
    grade: '',
    subject: '',
    topic: '',
    sourceLang: 'English',
    targetLang: 'Odia'
  });

  const handleStartLiveTranslation = async () => {
    setCurrentLesson(quickForm);
    await saveLesson(quickForm);
    setActivePanel(4); // Jump to Panel 4: Live Translation
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-outfit tracking-tight flex items-center gap-2">
            Good Morning, {userProfile.name}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Let's make learning meaningful today with vernacular AI.
          </p>
        </div>
        <button 
          onClick={() => setActivePanel(3)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs flex items-center space-x-2 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Setup Custom Lesson</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Start New Lesson Card */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">Start New Lesson</h2>
              <p className="text-xs text-slate-400">Quick configuration for live translation</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Grade Selection */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Grade</label>
              <select
                value={quickForm.grade}
                onChange={(e) => setQuickForm({ ...quickForm, grade: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">-- Select Grade --</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Subject</label>
              <select
                value={quickForm.subject}
                onChange={(e) => setQuickForm({ ...quickForm, subject: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">-- Select Subject --</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Environmental Studies">Environmental Studies</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Topic (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Photosynthesis, Solar System..."
                value={quickForm.topic}
                onChange={(e) => setQuickForm({ ...quickForm, topic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Source & Target Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Source Language</label>
                <select
                  value={quickForm.sourceLang}
                  onChange={(e) => setQuickForm({ ...quickForm, sourceLang: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Odia">Odia</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Target Language</label>
                <select
                  value={quickForm.targetLang}
                  onChange={(e) => setQuickForm({ ...quickForm, targetLang: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 rounded-xl p-3 outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStartLiveTranslation}
            className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START LIVE TRANSLATION</span>
          </button>
        </div>

        {/* Right Column: Overview Stats & Recent Lessons */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overview Grid Cards */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-white font-outfit">12</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Lessons</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-emerald-400 font-outfit">35</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Students</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-purple-400 font-outfit">4</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Languages</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-3xl font-extrabold text-amber-400 font-outfit">8</p>
                <p className="text-xs font-semibold text-slate-400 mt-1">Assessments</p>
              </div>
            </div>
          </div>

          {/* Recent Lessons Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-outfit">Recent Lessons</h3>
              <button onClick={() => setActivePanel(5)} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                View Adaptation <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => setActivePanel(5)}
                  className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                      📖
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {lesson.grade} • {lesson.topic} • {lesson.source} → {lesson.target}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{lesson.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
