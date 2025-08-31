import React from 'react';
import type { HistoryItem } from '../types';
import { TrashIcon, ClockIcon, SearchIcon, XIcon, FileTextIcon } from './icons';

interface HistoryListProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectItem,
  onClearHistory,
  onDeleteItem,
  onRenameItem,
  searchQuery,
  onSearchChange,
  className
}) => {
  return (
    <div className={`w-full max-w-4xl mt-12 animate-fade-in ${className}`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex-shrink-0">Histórico de Análises</h2>
        <div className="w-full md:w-auto flex-grow flex items-center gap-4">
            <div className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="search"
                    placeholder="Buscar por nome, nota ou palavra-chave..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>
            <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex-shrink-0"
            title="Limpar Histórico"
            >
            <TrashIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar Histórico</span>
            </button>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
            <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group cursor-pointer bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
                    title="Excluir Análise"
                >
                    <XIcon className="w-4 h-4" />
                </button>
                <div className="flex-grow flex flex-col items-center justify-center aspect-[4/3] bg-slate-50 p-4 border-b border-slate-100">
                    <FileTextIcon className="w-16 h-16 text-slate-300" />
                </div>
                <div className="p-4 border-t border-slate-100">
                    <input
                        type="text"
                        value={item.name}
                        onChange={(e) => onRenameItem(item.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-md font-semibold text-slate-800 bg-transparent border-none p-0 focus:ring-0 focus:outline-none mb-2 hover:underline focus:underline"
                        placeholder="Dê um nome à redação"
                    />
                    <p className="font-semibold text-slate-600 text-sm">
                        Nota Final: <span className="text-blue-600 font-bold">{item.evaluation.overallScore}</span>
                    </p>
                    <div className="flex items-center mt-2 text-sm text-slate-500">
                        <ClockIcon className="w-4 h-4 mr-1.5" />
                        <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            </div>
            ))}
        </div>
        ) : (
        <div className="text-center py-16 bg-slate-100/50 rounded-lg mt-6 border border-slate-200">
            <SearchIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">Nenhum resultado encontrado</h3>
            <p className="mt-1 text-sm text-slate-500">Tente ajustar seus termos de busca.</p>
        </div>
      )}
    </div>
  );
};
