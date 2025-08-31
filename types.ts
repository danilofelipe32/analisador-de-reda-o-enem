export interface CompetencyEvaluation {
  name: string;
  score: number;
  feedback: string;
}

export interface Deviation {
  competency: string;
  type: string;
  originalExcerpt: string;
  correction: string;
  comment: string;
}

export interface EvaluationResult {
  overallScore: number;
  summary: string;
  competencies: CompetencyEvaluation[];
  improvementInsights: string[];
  deviations: Deviation[];
}

export interface HistoryItem {
  id: string;
  name: string;
  imageDataUrl: string;
  evaluation: EvaluationResult;
  date: string;
}
