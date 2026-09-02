import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GraduationCap, Users, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const AUTHORIZED_EMAIL = 'aryanaks0007@gmail.com';
const AUTHORIZED_PASSWORD = '12345';

export const AuthPage = () => {
  const { userRole, setUserRole, setActivePanel, setUserProfile } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navStateRole = location.state?.role;
  
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: navStateRole || userRole || 'Teacher'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const inputEmail = (formData.email || '').trim().toLowerCase();
    const inputPassword = (formData.password || '').trim();

    // Enforce hardcoded credentials check
    if (inputEmail !== AUTHORIZED_EMAIL || inputPassword !== AUTHORIZED_PASSWORD) {
      setErrorMessage('Invalid credentials. Please use the authorized email and password.');
      return;
    }
    
    const selectedRole = formData.role || 'Teacher';
    
    // Update profile
    setUserProfile({
      name: formData.name || (selectedRole === 'Teacher' ? 'Aryan Kumar (Teacher)' : 'Aryan Kumar (Student)'),
      email: AUTHORIZED_EMAIL,
      school: 'Government Primary School',
      role: selectedRole,
      gradeSubject: selectedRole === 'Teacher' ? 'Class 3 - Science' : 'Class 3'
    });
    
    setUserRole(selectedRole);
    if (selectedRole === 'Teacher') {
      setActivePanel(2);
      navigate('/teacher/dashboard');
    } else {
      setActivePanel(12);
      navigate('/student/dashboard');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#071120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md z-10 relative">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/25 mb-4 border border-blue-400/30">
            ⚡
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit tracking-tight">BhashaSetu AI</h1>
          <p className="text-sm text-teal-400 font-semibold mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Next-Gen Vernacular EdTech
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              {isLogin ? 'Sign in to continue to your dashboard.' : 'Join the platform to access customized tools.'}
            </p>

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 mt-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, role: 'Teacher' })}
                    className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                      formData.role === 'Teacher' 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6" />
                    <span className="text-sm font-semibold">Teacher</span>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, role: 'Student' })}
                    className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                      formData.role === 'Student' 
                        ? 'bg-teal-500/10 border-teal-500 text-teal-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm font-semibold">Student</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={toggleAuthMode}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-blue-400 font-semibold underline decoration-blue-500/30 underline-offset-4">
                  {isLogin ? 'Register here' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
