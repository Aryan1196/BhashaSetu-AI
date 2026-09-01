import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  HelpCircle, 
  BookOpen, 
  Play, 
  Award, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const StudentDashboard: React.FC = () => {
  const { setActivePanel, currentLesson, recentLessons, selectLessonForReview } = useApp();
  const navigate = useNavigate();

  const handleNavigate = (path: string, panelNum: number) => {
    setActivePanel(panelNum);
    navigate(path);
  };

  const handleReviewLesson = (lesson: any) => {
    if (selectLessonForReview) {
      selectLessonForReview(lesson);
      navigate('/pedagogy');
    } else {
      setActivePanel(5);
      navigate('/pedagogy');
    }
  };

  const activeTopic = currentLesson?.topic || (recentLessons && recentLessons[0] ? (recentLessons[0].title || recentLessons[0].topic) : 'Water Cycle');
  const activeGrade = currentLesson?.grade || (recentLessons && recentLessons[0] ? recentLessons[0].grade : 'Class 3');
  const activeSubject = currentLesson?.subject || (recentLessons && recentLessons[0] ? recentLessons[0].subject : 'Science');
  const activeTargetLang = currentLesson?.targetLang || (recentLessons && recentLessons[0] ? (recentLessons[0].target_lang || recentLessons[0].target) : 'Odia');

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* 1. Welcome Message Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vernacular Student Hub • {activeGrade}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">
            Welcome to BhashaSetu AI 🎓
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Learn Science and Mathematics in your mother tongue with AI tutor assistance and interactive quizzes.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 z-10">
          <Button variant="primary" onClick={() => handleNavigate('/tutor', 7)}>
            <Bot className="w-4 h-4" />
            <span>Ask AI Tutor</span>
          </Button>
        </div>
      </div>

      {/* 2. Current Lesson Card */}
      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-2xl border border-teal-500/30">
              📖
            </div>
            <div>
              <Badge variant="teal">Current Active Lesson</Badge>
              <h2 className="text-xl font-bold text-white font-outfit mt-1">
                {activeTopic} ({activeGrade} • {activeSubject})
              </h2>
              <p className="text-xs text-slate-400">Target Language: <strong className="text-teal-400">{activeTargetLang}</strong></p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="primary" 
              onClick={() => {
                if (recentLessons && recentLessons[0]) {
                  handleReviewLesson(recentLessons[0]);
                } else {
                  handleNavigate('/pedagogy', 5);
                }
              }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Continue Learning</span>
            </Button>
          </div>
        </div>

        {/* Current Lesson Summary */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm space-y-2">
          <p className="font-semibold text-white">Lesson Summary (ଓଡ଼ିଆ):</p>
          <p className="text-slate-300 font-outfit leading-relaxed">
            {recentLessons && recentLessons[0]?.pedagogical_adaptation
              ? recentLessons[0].pedagogical_adaptation
              : "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।"}
          </p>
        </div>
      </Card>

      {/* 3. Past Lectures & Vernacular Classes Section */}
      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-500/30">
              🎙️
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-outfit">
                Past Lectures & Vernacular Recordings
              </h2>
              <p className="text-xs text-slate-400">
                Click any lecture to re-hear teacher translation and pedagogical explanation
              </p>
            </div>
          </div>
          <Badge variant="teal">{recentLessons?.length || 0} Lectures Saved</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(recentLessons || []).map((lesson: any, idx: number) => {
            const displayTitle = lesson.title || lesson.topic || `Lecture ${idx + 1}`;
            const displayTrans = lesson.direct_translation || lesson.directTranslation || "ଆଜି ଆମେ ପାଠ ବିଷୟରେ ଶିଖିବାକୁ ଯାଉଛୁ ।";
            const displayPedagogy = lesson.pedagogical_adaptation || lesson.pedagogicalAdaptation || "ପାଠ୍ୟକ୍ରମ ଆଧାରିତ ସରଳ ଶିକ୍ଷଣ ବିବରଣୀ";

            return (
              <div 
                key={lesson.id || idx}
                onClick={() => handleReviewLesson(lesson)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-teal-500/40 rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      {lesson.grade || 'Class 3'} • {lesson.subject || 'Science'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {lesson.date || 'Saved'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                    {displayTitle}
                  </h3>

                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/50 space-y-1.5">
                    <p className="text-[11px] font-semibold text-teal-400">Translation:</p>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {displayTrans}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                  <span className="text-[11px] text-slate-400">
                    Language: <strong className="text-slate-200">{lesson.target_lang || lesson.target || 'Odia'}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReviewLesson(lesson);
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <span>🔊 Re-hear Lecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Ask AI Tutor Card & Learning Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ask AI Tutor Banner Card */}
        <div className="md:col-span-6">
          <Card className="space-y-4 p-6 hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-2xl border border-blue-500/30">
              🤖
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">Ask AI Vernacular Tutor</h3>
              <p className="text-xs text-slate-400 mt-1">
                Have questions about water cycle or science concepts? Get answers in Odia grounded in your state textbook.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => handleNavigate('/tutor', 7)}>
              <span>Open AI Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>

        {/* Learning Progress Card */}
        <div className="md:col-span-6">
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span>Learning Progress</span>
              </h3>
              <Badge variant="emerald">85% Mastery</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Science Concept Mastery</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div className="bg-teal-500 h-2.5 rounded-full w-[85%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Vernacular Vocabulary</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div className="bg-blue-500 h-2.5 rounded-full w-[90%]"></div>
                </div>
              </div>

              <div className="pt-2 text-slate-400 flex items-center justify-between font-mono">
                <span>Completed Lessons: <strong>{recentLessons?.length || 4}</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
