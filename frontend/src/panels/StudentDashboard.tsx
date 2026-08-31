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
  const { setActivePanel, currentLesson } = useApp();
  const navigate = useNavigate();

  const handleNavigate = (path: string, panelNum: number) => {
    setActivePanel(panelNum);
    navigate(path);
  };

  const recentScores = [
    { id: 1, topic: 'Water Cycle (ପାଣି ଚକ୍ର)', score: '3/3', percentage: 100, date: 'Today' },
    { id: 2, topic: 'Plants & Parts (ଗଛ ଓ ଏହାର ଅଂଶ)', score: '3/3', percentage: 100, date: 'Yesterday' },
    { id: 3, topic: 'Animals Around Us (ଆମ ଚାରିପାଖର ପ୍ରାଣୀ)', score: '2/3', percentage: 67, date: '2 days ago' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* 1. Welcome Message Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vernacular Student Hub • Class 3</span>
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
              🌊
            </div>
            <div>
              <Badge variant="teal">Current Lesson</Badge>
              <h2 className="text-xl font-bold text-white font-outfit mt-1">
                {currentLesson.topic} ({currentLesson.grade} • {currentLesson.subject})
              </h2>
              <p className="text-xs text-slate-400">Target Language: <strong className="text-teal-400">Odia (ଓଡ଼ିଆ)</strong></p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 4. Continue Learning Button */}
            <Button variant="secondary" onClick={() => handleNavigate('/pedagogy', 5)}>
              <Play className="w-4 h-4 text-teal-400 fill-current" />
              <span>Continue Learning</span>
            </Button>

            {/* 5. Take Quiz Button */}
            <Button variant="primary" onClick={() => handleNavigate('/quiz', 8)}>
              <HelpCircle className="w-4 h-4" />
              <span>Take Quiz</span>
            </Button>
          </div>
        </div>

        {/* Current Lesson Summary */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-sm space-y-2">
          <p className="font-semibold text-white">Lesson Summary (ଓଡ଼ିଆ):</p>
          <p className="text-slate-300 font-outfit leading-relaxed">
            "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।"
          </p>
        </div>
      </Card>

      {/* Main Grid: 3. Ask AI Tutor Card & 7. Learning Progress */}
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

        {/* 7. Learning Progress Card */}
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
                <span>Completed Lessons: <strong>3/4</strong></span>
                <span>Quiz Accuracy: <strong>89%</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 6. Recent Scores Section */}
      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Recent Quiz Scores</span>
          </h3>
          <Button variant="outline" size="sm" onClick={() => handleNavigate('/quiz/results', 9)}>
            <span>View Performance</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentScores.map((scoreItem) => (
            <div key={scoreItem.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span className="text-[10px] text-slate-500 font-mono">{scoreItem.date}</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{scoreItem.topic}</p>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-extrabold text-teal-400 font-mono">{scoreItem.score}</span>
                <Badge variant={scoreItem.percentage >= 80 ? 'emerald' : 'amber'}>
                  {scoreItem.percentage}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
