export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

export interface Question {
  text: string;
  answer: number;
  options: number[];
  operation: OperationType;
}

export interface GameState {
  currentLevel: number;
  unlockedLevel: number;
  score: number;
  view: 'home' | 'map' | 'game' | 'victory';
}