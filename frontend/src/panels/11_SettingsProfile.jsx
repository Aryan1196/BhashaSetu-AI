import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Save, Shield, Globe, Bell, CheckCircle2, Key, Radio, Sparkles, Sun, Moon, Palette, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

export const SettingsProfile = () => {
  const { userProfile, setUserProfile, showToast, theme, setTheme } = useApp();
  const [activeTab, setActiveTab] = useState('Profile');

  const [formData, setFormData] = useState({
    name: userProfile.name || 'Teacher',
    email: userProfile.email || 'teacher@bhashasetu.ai',
    school: userProfile.school || 'Government Primary School'
  });

  const [deepgramKey, setDeepgramKey] = useState('');
  const [keySaveMsg, setKeySaveMsg] = useState('');

  useEffect(() => {
    apiClient.getDeepgramKey().then((key) => {
      if (key) setDeepgramKey(key);
    });
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      ...formData
    });
    showToast('Profile updated successfully!');
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    await apiClient.saveDeepgramKey(deepgramKey);
    setKeySaveMsg('Deepgram API Key saved successfully! 🎉');
    showToast('Deepgram key updated.');
    setTimeout(() => setKeySaveMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white font-outfit">Settings</h1>
        <p className="text-xs text-slate-400">Manage your profile, primary school preferences, and AI provider API keys</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-1">
        {['Profile', 'API Keys', 'Preferences', 'Languages', 'Notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Body */}
      {activeTab === 'Profile' && (
        <form onSubmit={handleUpdate} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white font-outfit border-b border-slate-800 pb-3">
            Profile Information
          </h2>

          {/* Avatar Picture */}
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl">
                👩‍🏫
              </div>
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{formData.name}</h3>
              <p className="text-xs text-slate-400">{formData.school}</p>
              <button
                type="button"
                onClick={() => showToast('Avatar selection modal opened.')}
                className="mt-2 text-xs text-emerald-400 font-semibold hover:underline"
              >
                Change Avatar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">School Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* API Keys Tab */}
      {activeTab === 'API Keys' && (
        <form onSubmit={handleSaveKey} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-outfit">AI Speech & Language Providers</h2>
              <p className="text-xs text-slate-400">Configure credentials for real-time live streaming speech recognition</p>
            </div>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Deepgram Nova-2 Active</span>
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Deepgram Live Streaming STT Key</span>
              </label>
              <input
                type="text"
                value={deepgramKey}
                onChange={(e) => setDeepgramKey(e.target.value)}
                placeholder="23dae82420be843b3b183028b35162dfca167b8c"
                className="w-full bg-slate-950 border border-slate-800 text-amber-300 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-amber-500 font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Used for instant WebSocket streaming from the classroom microphone directly to Deepgram Nova-2.
              </p>
            </div>

            {keySaveMsg && (
              <p className="text-xs text-emerald-400 font-bold bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/50">
                {keySaveMsg}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Key</span>
            </button>
          </div>
        </form>
      )}

      {/* Preferences & Appearance Tab */}
      {activeTab === 'Preferences' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Appearance & Theme</span>
            </h2>
            <p className="text-xs text-slate-400">Default visual presentation mode for classrooms and educational devices</p>
          </div>

          <div className="max-w-md">
            {/* Light Mode Permanent Card */}
            <div className="p-5 rounded-2xl border-2 border-blue-500 bg-slate-100/90 shadow-lg shadow-blue-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Light Theme (Default)</h3>
                    <p className="text-[11px] text-slate-600">Clean Crisp White for High Visibility</p>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="h-16 rounded-xl bg-slate-50 border border-slate-300 p-2.5 flex flex-col justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="w-8 h-1.5 rounded-full bg-slate-300"></span>
                </div>
                <div className="w-full h-4 rounded-lg bg-white border border-slate-200"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'Profile' && activeTab !== 'API Keys' && activeTab !== 'Preferences' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3">
          <Globe className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-outfit">{activeTab} Settings</h3>
          <p className="text-xs">Configurations for {activeTab.toLowerCase()} are active and aligned with Odisha Primary School Board standards.</p>
        </div>
      )}
    </div>
  );
};

