import React, { useState } from 'react';
import { User, Mail, Building, Save, Shield, Globe, Bell, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsProfile = () => {
  const { userProfile, setUserProfile, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('Profile');

  const [formData, setFormData] = useState({
    name: userProfile.name || 'Teacher',
    email: userProfile.email || 'teacher@bhashasetu.ai',
    school: userProfile.school || 'Government Primary School'
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      ...formData
    });
    showToast('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white font-outfit">Settings</h1>
        <p className="text-xs text-slate-400">Manage your profile, primary school preferences, and language options</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-1">
        {['Profile', 'Preferences', 'Languages', 'Notifications'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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

      {activeTab !== 'Profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3">
          <Globe className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-outfit">{activeTab} Settings</h3>
          <p className="text-xs">Configurations for {activeTab.toLowerCase()} are active and aligned with Odisha Primary School Board standards.</p>
        </div>
      )}
    </div>
  );
};
