
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-slate-700">{message || 'Carregando...'}</p>
      <p className="text-sm text-slate-500">Isso pode levar um momento. Agradecemos a sua paciência.</p>
    </div>
  );
};