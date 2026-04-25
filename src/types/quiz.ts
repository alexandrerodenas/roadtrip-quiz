export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'nvidia' | 'openai' | 'claude';
  description: string;
}

export interface Question {
  question: string;
  options: string[];
  correctOptionIndex: number;
  funFact: string;
  indice: string;
}