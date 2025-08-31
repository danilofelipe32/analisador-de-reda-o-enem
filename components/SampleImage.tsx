
import React from 'react';
import { ImageIcon } from './icons';

interface SampleImageProps {
    onUseSample: () => void;
}

export const SampleImage: React.FC<SampleImageProps> = ({ onUseSample }) => {
    return (
        <button
            onClick={onUseSample}
            className="group flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
            <ImageIcon className="h-5 w-5 mr-2 text-blue-500 group-hover:text-blue-600" />
            Usar uma redação de exemplo
        </button>
    );
};
