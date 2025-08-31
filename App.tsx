import React, { useState, useCallback, useEffect } from 'react';
import { analyzeEssayText } from './services/geminiService';
import type { EvaluationResult, HistoryItem } from './types';
import { Header } from './components/Header';
import { EvaluationDisplay } from './components/EvaluationDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Footer } from './components/Footer';
import { HistoryList } from './components/HistoryList';
import { BookOpenIcon } from './components/icons';

const MAX_HISTORY_ITEMS = 20;

const SAMPLE_ESSAY = `A persistência da violência contra a mulher na sociedade brasileira é um problema grave e complexo que exige um debate sério e contínuo. Arraigada em uma cultura patriarcal, essa forma de agressão se manifesta de diversas maneiras, desde o assédio verbal até o feminicídio, deixando marcas profundas nas vítimas e em toda a sociedade. É fundamental, portanto, analisar as causas dessa violência e propor caminhos para sua erradicação.

Primeiramente, é preciso reconhecer que a desigualdade de gênero é a principal causa da violência contra a mulher. A ideia de que homens são superiores e detêm o poder sobre as mulheres legitima atitudes de controle e agressão. Essa mentalidade é reforçada por piadas machistas, pela objetificação do corpo feminino na mídia e pela falta de representatividade feminina em espaços de poder. Enquanto essa estrutura de pensamento não for desconstruída, a violência continuará a encontrar terreno fértil para prosperar.

Além disso, a ineficácia de políticas públicas e a morosidade do sistema judiciário contribuem para a perpetuação do problema. Embora a Lei Maria da Penha represente um avanço significativo, sua aplicação ainda enfrenta obstáculos, como a falta de delegacias especializadas e de preparo dos agentes para acolher as vítimas de forma humanizada. A impunidade dos agressores envia uma mensagem perigosa de que a violência é tolerável, desestimulando as denúncias e aumentando a vulnerabilidade das mulheres.

Diante do exposto, é urgente que o Estado e a sociedade civil atuem em conjunto para combater a violência contra a mulher. O Governo Federal deve investir na ampliação e no fortalecimento da rede de proteção, com mais Delegacias da Mulher, casas-abrigo e centros de referência, além de promover campanhas de conscientização que desmistifiquem a cultura do machismo. A sociedade, por sua vez, tem o papel de educar as novas gerações para o respeito e a igualdade de gênero, começando dentro de casa e nas escolas. Somente com ações integradas e um compromisso coletivo será possível construir uma sociedade onde as mulheres possam viver livres do medo e da violência.`;


export default function App() {
  const [essayText, setEssayText] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('essayHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      setHistory([]);
    }
  }, []);
  
  const handleStartOver = useCallback(() => {
    setEvaluation(null);
    setError(null);
    setIsLoading(false);
    setIsViewingHistory(false);
    setSearchQuery('');
    setEssayText('');
    setLoadingMessage('');
  }, []);

  const handleAnalyze = async () => {
    if (essayText.trim().split(' ').length < 30) {
      setError('O texto da redação parece muito curto. Por favor, verifique se o texto está completo antes de analisar.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analisando sua redação...');
    setError(null);
    setEvaluation(null);
    setIsViewingHistory(false);

    try {
      const result = await analyzeEssayText(essayText);
      setEvaluation(result);

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString() + Math.random(),
        name: `Redação - ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
        essayText: essayText,
        evaluation: result,
        date: new Date().toISOString(),
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        try {
          localStorage.setItem('essayHistory', JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Failed to save history to localStorage", e);
          setError("Não foi possível salvar no histórico. O armazenamento pode estar cheio.");
        }
        return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido durante a análise.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleUseSample = () => {
    handleStartOver();
    setEssayText(SAMPLE_ESSAY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setEssayText(item.essayText);
    setEvaluation(item.evaluation);
    setError(null);
    setIsLoading(false);
    setIsViewingHistory(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (window.confirm("Tem certeza de que deseja limpar todo o histórico de análises? Esta ação não pode ser desfeita.")) {
      setHistory([]);
      try {
        localStorage.removeItem('essayHistory');
      } catch (e) {
        console.error("Failed to clear history from localStorage", e);
      }
    }
  };
  
  const handleDeleteHistoryItem = (idToDelete: string) => {
    if (window.confirm("Tem certeza de que deseja excluir esta análise?")) {
      setHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.id !== idToDelete);
        try {
          localStorage.setItem('essayHistory', JSON.stringify(updatedHistory));
        } catch (e) {
          console.error("Failed to update history in localStorage after deletion", e);
        }
        return updatedHistory;
      });
    }
  };

  const handleRenameHistoryItem = (idToRename: string, newName: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.map(item =>
        item.id === idToRename ? { ...item, name: newName } : item
      );
      try {
        localStorage.setItem('essayHistory', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("Failed to update history in localStorage after rename", e);
      }
      return updatedHistory;
    });
  };

  const filteredHistory = history.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const evalData = item.evaluation;
    const nameMatch = item.name.toLowerCase().includes(query);
    const textMatch = item.essayText.toLowerCase().includes(query);
    const scoreMatch = evalData.overallScore.toString().includes(query);
    const summaryMatch = evalData.summary.toLowerCase().includes(query);
    const competenciesMatch = evalData.competencies.some(c =>
        c.feedback.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
    );
    const insightsMatch = evalData.improvementInsights?.some(insight =>
        insight.toLowerCase().includes(query)
    ) || false;
    const deviationsMatch = evalData.deviations?.some(d => 
        d.type.toLowerCase().includes(query) ||
        d.comment.toLowerCase().includes(query) ||
        d.correction.toLowerCase().includes(query)
    ) || false;

    return nameMatch || textMatch || scoreMatch || summaryMatch || competenciesMatch || insightsMatch || deviationsMatch;
  });

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }
    if (evaluation) {
      return <EvaluationDisplay result={evaluation} essayText={essayText} isHistoryView={isViewingHistory} onNewAnalysis={handleStartOver} />;
    }
    // Default idle state: Essay Input
    return (
      <div className="w-full animate-fade-in no-print">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Insira sua Redação</h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              Digite ou cole o texto da sua redação no campo abaixo para receber uma análise detalhada.
            </p>
        </div>
        {error && <ErrorDisplay message={error} />}
        <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-y shadow-sm min-h-[300px]"
            rows={15}
            aria-label="Editor de texto da redação"
            disabled={isLoading}
            placeholder="Comece a digitar sua redação aqui..."
        />
        <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
            <button
                onClick={handleUseSample}
                className="group flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
                <BookOpenIcon className="h-5 w-5 mr-2 text-blue-500 group-hover:text-blue-600" />
                Usar redação de exemplo
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || essayText.trim().length < 50}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? 'Analisando...' : 'Analisar Redação'}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Header className="no-print" />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 printable-area">
          {renderContent()}
        </div>
        
        {history.length > 0 && (
          <HistoryList 
            history={filteredHistory}
            onSelectItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onRenameItem={handleRenameHistoryItem}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            className="no-print"
          />
        )}
      </main>
      <Footer className="no-print" />
    </div>
  );
}
