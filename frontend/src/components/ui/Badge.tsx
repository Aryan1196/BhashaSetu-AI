import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className = ''
}) => {
  const variants = {
    blue: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    gray: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
