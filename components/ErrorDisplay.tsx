
import React from 'react';
import { AlertTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="py-1">
          <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
        </div>
        <div>
          <p className="font-bold">Ocorreu um Erro</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};
