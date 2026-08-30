import React from 'react';
import { BarChart3, PieChart, TrendingUp, Users, CheckCircle, Calendar, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsAnalytics = () => {
  const { setActivePanel } = useApp();

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
      {/* Header Bar with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-outfit">Reports Overview</h1>
          <p className="text-xs text-slate-400">Classroom engagement and vernacular performance metrics</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Date Range: <strong>This Month</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Subject: <strong>All</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <p className="text-3xl font-extrabold text-white font-outfit">12</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">Lessons Conducted</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <p className="text-3xl font-extrabold text-emerald-400 font-outfit">35</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">Students Engaged</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <p className="text-3xl font-extrabold text-teal-400 font-outfit">84%</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">Average Accuracy</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <p className="text-3xl font-extrabold text-amber-400 font-outfit">8</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">Assessments</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart 1: Lesson Activity (Line Chart) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-outfit">Lesson Activity</h3>
            <span className="text-xs text-slate-400 font-mono">Lessons / Week</span>
          </div>

          {/* SVG Line Graph */}
          <div className="h-56 relative flex items-end justify-between pt-6 px-4">
            <svg className="absolute inset-0 w-full h-full p-6 overflow-visible" viewBox="0 0 400 150">
              <path
                d="M 20 120 Q 80 40, 160 80 T 300 30 T 380 90"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 20 120 Q 80 40, 160 80 T 300 30 T 380 90 L 380 150 L 20 150 Z"
                fill="rgba(16, 185, 129, 0.15)"
              />
              <circle cx="20" cy="120" r="5" fill="#10B981" />
              <circle cx="100" cy="60" r="5" fill="#10B981" />
              <circle cx="180" cy="90" r="5" fill="#10B981" />
              <circle cx="280" cy="35" r="6" fill="#34D399" />
              <circle cx="380" cy="90" r="5" fill="#10B981" />
            </svg>

            {['1 May', '8 May', '15 May', '22 May', '29 May'].map((date, idx) => (
              <span key={idx} className="text-[11px] text-slate-400 font-mono relative z-10">
                {date}
              </span>
            ))}
          </div>
        </div>

        {/* Chart 2: Language Usage (Donut Chart) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white font-outfit">Language Usage</h3>
            <span className="text-xs text-slate-400">Target Languages</span>
          </div>

          <div className="flex items-center justify-around py-4">
            {/* SVG Donut */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3.8"
                />
                {/* Odia 60% */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.8"
                  strokeDasharray="60, 100"
                />
                {/* Hindi 25% */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3.8"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-60"
                />
                {/* English 15% */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="3.8"
                  strokeDasharray="15, 100"
                  strokeDashoffset="-85"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white font-outfit">60%</span>
                <span className="text-[10px] text-slate-400 font-medium">Odia</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300 font-semibold">Odia: 60%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-slate-300 font-semibold">Hindi: 25%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-slate-300 font-semibold">English: 15%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white font-outfit">Recent Activity</h3>
          <button onClick={() => setActivePanel(2)} className="text-xs text-emerald-400 hover:underline">
            View All
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Water Cycle lesson conducted for Class 3 Science
              </p>
              <p className="text-xs text-slate-400">Target Language: Odia • Accuracy: 92%</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">20 May 2025 - 10:30 AM</span>
        </div>
      </div>
    </div>
  );
};
