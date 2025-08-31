import React, { useState } from 'react';

interface TextEditorProps {
  imageUrl: string;
  initialText: string;
  onAnalyze: (editedText: string) => void;
  onCancel: () => void;
  isAnalyzing: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({ imageUrl, initialText, onAnalyze, onCancel, isAnalyzing }) => {
  const [text, setText] = useState(initialText);

  const handleAnalyzeClick = () => {
    if (text.trim().split(' ').length < 30) {
        alert('O texto da redação parece muito curto. Por favor, verifique se a transcrição está completa antes de analisar.');
        return;
    }
    onAnalyze(text);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Confirme a Transcrição</h2>
          <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
            A IA transcreveu o texto da sua redação. Por favor, revise e corrija qualquer erro antes de prosseguir. A qualidade da avaliação depende da precisão do texto.
          </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-slate-700 text-center">Imagem Original</h3>
            <div className="max-h-[60vh] overflow-auto rounded-lg border border-slate-200 shadow-sm p-2 bg-slate-50">
                 <img src={imageUrl} alt="Redação original enviada" className="w-full h-auto rounded" />
            </div>
        </div>
        <div className="flex flex-col gap-2">
             <h3 className="text-lg font-semibold text-slate-700 text-center">Texto Transcrito (Editável)</h3>
             <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-y shadow-sm min-h-[300px] md:min-h-0 md:h-full"
                style={{height: 'max(300px, 60vh)'}}
                aria-label="Editor de texto da redação transcrita"
                disabled={isAnalyzing}
                placeholder="O texto da sua redação aparecerá aqui..."
            />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-end">
        <button
          onClick={onCancel}
          disabled={isAnalyzing}
          className="px-6 py-2.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing || text.trim().length < 50}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isAnalyzing ? 'Analisando...' : 'Analisar Redação'}
        </button>
      </div>
    </div>
  );
};
