import React from 'react';
import { BookOpenIcon } from './icons';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={`bg-white shadow-md border-b border-slate-200 ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center">
        <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Analisador de Redação ENEM
        </h1>
        <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          IA
        </span>
      </div>
    </header>
  );
};