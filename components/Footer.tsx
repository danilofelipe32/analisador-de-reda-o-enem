import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`w-full mt-auto bg-white border-t border-slate-200 ${className}`}>
      <div className="container mx-auto py-4 px-4 text-center text-slate-500 text-sm">
        <p>Powered by Google Gemini AI</p>
        <p>&copy; {new Date().getFullYear()} Analisador de Redação ENEM. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};