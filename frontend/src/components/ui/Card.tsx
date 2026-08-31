import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl ${onClick ? 'cursor-pointer hover:border-slate-700 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
