import React, { useState, useCallback, useEffect } from 'react';
import { transcribeImage, analyzeEssayText } from './services/geminiService';
import type { EvaluationResult, HistoryItem } from './types';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { EvaluationDisplay } from './components/EvaluationDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Footer } from './components/Footer';
import { SampleImage } from './components/SampleImage';
import { HistoryList } from './components/HistoryList';
import { TextEditor } from './components/TextEditor';

const MAX_HISTORY_ITEMS = 20;

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
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
    setImageFile(null);
    setImageUrl(null);
    setEvaluation(null);
    setError(null);
    setIsLoading(false);
    setIsViewingHistory(false);
    setSearchQuery('');
    setTranscribedText('');
    setIsEditingText(false);
    setLoadingMessage('');
  }, []);

  const handleImageChange = async (file: File) => {
    handleStartOver();
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));

    setIsLoading(true);
    setLoadingMessage('Transcrevendo o texto da imagem...');
    setError(null);

    try {
      const text = await transcribeImage(file);
      setTranscribedText(text);
      setIsEditingText(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido durante a transcrição.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAnalyze = async (essayText: string) => {
    if (!imageFile) {
      setError("Ocorreu um erro, a imagem original foi perdida. Por favor, comece novamente.");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Analisando sua redação...');
    setError(null);
    setEvaluation(null);
    setIsEditingText(false);
    setIsViewingHistory(false);

    try {
      const result = await analyzeEssayText(essayText);
      setEvaluation(result);

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        const newHistoryItem: HistoryItem = {
          id: new Date().toISOString() + Math.random(),
          name: `Redação - ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`,
          imageDataUrl: imageDataUrl,
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
      };
      reader.readAsDataURL(imageFile);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido durante a análise.");
      setIsEditingText(true); // Go back to editor on error
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleUseSample = async () => {
    try {
        const response = await fetch('https://picsum.photos/id/17/800/1200'); // An image with text
        const blob = await response.blob();
        const file = new File([blob], "redacao-exemplo.jpg", { type: "image/jpeg" });
        await handleImageChange(file);
    } catch (err) {
        console.error("Failed to fetch sample image:", err);
        setError("Não foi possível carregar a imagem de exemplo. Verifique sua conexão com a internet.");
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setImageFile(null);
    setImageUrl(item.imageDataUrl);
    setEvaluation(item.evaluation);
    setError(null);
    setIsLoading(false);
    setIsEditingText(false);
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

    return nameMatch || scoreMatch || summaryMatch || competenciesMatch || insightsMatch || deviationsMatch;
  });

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message={loadingMessage} />;
    }
    if (evaluation) {
      return <EvaluationDisplay result={evaluation} imagePreviewUrl={imageUrl} isHistoryView={isViewingHistory} onNewAnalysis={handleStartOver} />;
    }
    if (isEditingText) {
      return (
        <>
          {error && <ErrorDisplay message={error} />}
          <TextEditor 
            imageUrl={imageUrl!}
            initialText={transcribedText}
            onAnalyze={handleAnalyze}
            onCancel={handleStartOver}
            isAnalyzing={isLoading}
          />
        </>
      );
    }
    // Default idle state
    return (
      <div className="no-print">
        <div className="text-center">
          {error && <ErrorDisplay message={error} />}
          <ImageUploader onImageSelect={handleImageChange} />
          <p className="text-slate-500 my-4">ou</p>
          <SampleImage onUseSample={handleUseSample} />
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