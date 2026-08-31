import React, { useState } from 'react';
import { ArrowLeft, Check, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NewLessonSetup = () => {
  const { setActivePanel, currentLesson, setCurrentLesson, showToast } = useApp();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    grade: currentLesson.grade || 'Class 3',
    subject: currentLesson.subject || 'Science',
    topic: currentLesson.topic || 'Water Cycle',
    sourceLang: currentLesson.sourceLang || 'English',
    targetLang: currentLesson.targetLang || 'Odia'
  });

  const handleNext = () => {
    setCurrentLesson(formData);
    if (step < 3) {
      setStep(step + 1);
    } else {
      showToast('New Lesson Configured Successfully!');
      setActivePanel(4); // Start Live Translation
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      {/* Back Navigation & Title */}
      <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
        <button
          onClick={() => setActivePanel(2)}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">New Lesson Setup</h1>
          <p className="text-xs text-slate-400">Fill the details to start a new lesson session</p>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="grid grid-cols-3 gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        {[
          { num: 1, label: 'Class Details' },
          { num: 2, label: 'Curriculum' },
          { num: 3, label: 'Confirm' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${
              step === s.num
                ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
                : step > s.num
                ? 'bg-slate-950 text-slate-300'
                : 'text-slate-400 opacity-60'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              step === s.num
                ? 'bg-emerald-500 text-white'
                : step > s.num
                ? 'bg-emerald-800 text-emerald-100'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-xs font-semibold">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-white font-outfit">Step 1: Class Details</h3>

            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">Grade</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Environmental Studies">Environmental Studies</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-2">Topic (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Water Cycle"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-2">Source Language</label>
                <select
                  value={formData.sourceLang}
                  onChange={(e) => setFormData({ ...formData, sourceLang: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-2">Target Language</label>
                <select
                  value={formData.targetLang}
                  onChange={(e) => setFormData({ ...formData, targetLang: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-bold rounded-xl p-3.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-white font-outfit">Step 2: Curriculum Grounding</h3>
            <p className="text-xs text-slate-400">Select pre-loaded curriculum PDF for AI context.</p>
            
            <div className="space-y-3">
              {[
                { title: 'Class 3 Science Water Cycle.pdf', pages: '12 Pages', selected: true },
                { title: 'Plants and Their Parts.pdf', pages: '18 Pages', selected: false },
                { title: 'Our Environment.pdf', pages: '24 Pages', selected: false },
              ].map((doc, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer ${doc.selected ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-slate-950 border-slate-800'}`}>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{doc.title}</p>
                      <p className="text-xs text-slate-400">{doc.pages}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${doc.selected ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {doc.selected ? 'Active' : 'Select'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            <h3 className="text-xl font-bold text-white font-outfit">Ready to Begin Lesson!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              You are setup for <strong className="text-emerald-400">{formData.topic}</strong> ({formData.grade} • {formData.subject}) with live translation into <strong className="text-emerald-400">{formData.targetLang}</strong>.
            </p>
          </div>
        )}

        {/* Footer Navigation Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={handleNext}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all"
          >
            <span>{step === 3 ? 'Start Live Translation' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
