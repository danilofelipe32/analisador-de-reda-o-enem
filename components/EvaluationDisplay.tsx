import React, { useState } from 'react';
import type { EvaluationResult, CompetencyEvaluation, Deviation } from '../types';
import { CheckCircleIcon, LightbulbIcon, FileTextIcon, PrinterIcon, ChevronDownIcon, AlertTriangleIcon } from './icons';

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const percentage = (score / 1000) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-slate-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className="text-blue-600"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-800">{score}</span>
        <span className="text-sm text-slate-500">de 1000</span>
      </div>
    </div>
  );
};

const CompetencyBar: React.FC<{ competency: CompetencyEvaluation }> = ({ competency }) => {
  const percentage = (competency.score / 200) * 100;
  const getBarColor = (score: number) => {
    if (score >= 160) return 'bg-green-500';
    if (score >= 120) return 'bg-yellow-500';
    if (score >= 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 break-inside-avoid">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-slate-700">{competency.name}</h4>
        <span className="font-bold text-slate-800">{competency.score} / 200</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3">
        <div className={`${getBarColor(competency.score)} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-sm text-slate-600">{competency.feedback}</p>
    </div>
  );
};

const DeviationCard: React.FC<{ deviation: Deviation }> = ({ deviation }) => {
  return (
    <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm">
      <div className="font-semibold text-red-800 mb-2">
        <span className="font-bold">{deviation.type}</span> (Competência {deviation.competency})
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-slate-500">Trecho Original: </span>
          <span className="text-red-700 font-mono bg-red-100 px-1 rounded">"{deviation.originalExcerpt}"</span>
        </div>
        <div>
          <span className="text-slate-500">Sugestão: </span>
          <span className="text-green-700 font-mono bg-green-100 px-1 rounded">"{deviation.correction}"</span>
        </div>
        <p className="text-slate-600 pt-1">{deviation.comment}</p>
      </div>
    </div>
  )
}

interface EvaluationDisplayProps {
    result: EvaluationResult;
    essayText: string;
    isHistoryView: boolean;
    onNewAnalysis: () => void;
}

export const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ result, essayText, isHistoryView, onNewAnalysis }) => {
    const [isTextVisible, setIsTextVisible] = useState(false);
    
    const handleExportTxt = () => {
        let content = `ANÁLISE DE REDAÇÃO ENEM\n`;
        content += `=========================\n\n`;
        content += `NOTA FINAL: ${result.overallScore}\n\n`;
        content += `--- RESUMO DA AVALIAÇÃO ---\n${result.summary}\n\n`;
        content += `--- ANÁLISE POR COMPETÊNCIA ---\n`;
        result.competencies.forEach(c => {
            content += `${c.name} (Nota: ${c.score}/200)\n`;
            content += `${c.feedback}\n\n`;
        });

        if (result.improvementInsights && result.improvementInsights.length > 0) {
            content += `--- DICAS PARA MELHORAR ---\n`;
            result.improvementInsights.forEach(tip => {
                content += `- ${tip}\n`;
            });
            content += '\n';
        }
        
        if (result.deviations && result.deviations.length > 0) {
            content += `--- DESVIOS E CORREÇÕES ---\n`;
            result.deviations.forEach(d => {
                content += `Tipo: ${d.type} (Competência ${d.competency})\n`;
                content += `Trecho: "${d.originalExcerpt}"\n`;
                content += `Correção: "${d.correction}"\n`;
                content += `Comentário: ${d.comment}\n\n`;
            });
        }
        
        content += `--- TEXTO ORIGINAL ANALISADO ---\n${essayText}`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analise-redacao.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrintPdf = () => {
        window.print();
    };
    
  return (
    <div className="mt-8 w-full animate-fade-in">
      <div className="text-center mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-800">Sua Análise está Pronta!</h2>
            <div className="flex flex-wrap gap-2 justify-center no-print">
                 <button onClick={handleExportTxt} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">
                    <FileTextIcon className="w-4 h-4" /> TXT
                </button>
                <button onClick={handlePrintPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors">
                    <PrinterIcon className="w-4 h-4" /> PDF
                </button>
                 <button onClick={onNewAnalysis} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Analisar Nova Redação
                </button>
            </div>
        </div>
      </div>
      
       <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200 break-inside-avoid">
            <button 
                onClick={() => setIsTextVisible(!isTextVisible)}
                className="w-full flex justify-between items-center text-left font-semibold text-slate-700"
                aria-expanded={isTextVisible}
            >
                <span>Visualizar Texto Analisado</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isTextVisible ? 'rotate-180' : ''}`} />
            </button>
            {isTextVisible && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{essayText}</p>
                </div>
            )}
        </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 break-inside-avoid">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Nota Final</h3>
          <ScoreCircle score={result.overallScore} />
        </div>
        <div className="md:col-span-2 p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            Resumo da Avaliação
          </h3>
          <p className="text-slate-600 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center md:text-left">Análise por Competência</h3>
        <div className="space-y-4">
          {result.competencies.map((comp, index) => (
            <CompetencyBar key={index} competency={comp} />
          ))}
        </div>
      </div>

      {result.deviations && result.deviations.length > 0 && (
        <div className="mb-8 break-inside-avoid">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center md:text-left flex items-center justify-center md:justify-start">
                <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                Desvios e Correções
            </h3>
            <div className="space-y-4">
                {result.deviations.map((dev, index) => (
                    <DeviationCard key={index} deviation={dev} />
                ))}
            </div>
        </div>
      )}
      
      {result.improvementInsights && result.improvementInsights.length > 0 && (
        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200 break-inside-avoid">
            <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                <LightbulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Dicas para Melhorar
            </h3>
            <ul className="space-y-2 list-disc list-inside text-slate-600">
                {result.improvementInsights.map((tip, index) => (
                    <li key={index}>{tip}</li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};
