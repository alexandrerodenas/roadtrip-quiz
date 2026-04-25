import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type Jokers = {
  ferry: number;
  aurora: number;
  troll: number;
};

export type Player = {
  id: string;
  name: string;
  score: number;
  jokers: Jokers;
};

export type GameMode = 'menu' | 'coop' | 'duel' | 'maitre' | 'nordic' | 'cuisine';
export type AIModelType = 'gemini' | 'nvidia' | 'openai' | 'claude';

interface GameState {
  apiKey: string;
  setApiKey: (key: string) => void;
  players: Player[];
  setPlayers: (players: Omit<Player, 'id' | 'score' | 'jokers'>[]) => void;
  updateScore: (playerId: string, points: number) => void;
  useJoker: (playerId: string, jokerType: keyof Jokers) => void;
  addJoker: (playerId: string, jokerType: keyof Jokers) => void;
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  nordicProgress: number;
  advanceNordic: (steps: number) => void;
  resetGame: () => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  // Nouvelles propriétés pour la gestion des modèles
  selectedModel: AIModelType;
  setSelectedModel: (model: AIModelType) => void;
  nvidiaApiKey: string;
  setNvidiaApiKey: (key: string) => void;
}

const defaultJokers = { ferry: 1, aurora: 1, troll: 2 };

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      players: [],
      setPlayers: (newPlayers) => set({
        players: newPlayers.map(p => ({
          id: Math.random().toString(36).substring(7),
          name: p.name,
          score: 0,
          jokers: { ...defaultJokers }
        }))
      }),
      updateScore: (playerId, points) => set((state) => ({
        players: state.players.map(p => 
          p.id === playerId ? { ...p, score: p.score + points } : p
        )
      })),
      useJoker: (playerId, jokerType) => set((state) => ({
        players: state.players.map(p => 
          p.id === playerId && p.jokers[jokerType] > 0
            ? { ...p, jokers: { ...p.jokers, [jokerType]: p.jokers[jokerType] - 1 } }
            : p
        )
      })),
      addJoker: (playerId, jokerType) => set((state) => ({
        players: state.players.map(p => 
          p.id === playerId 
            ? { ...p, jokers: { ...p.jokers, [jokerType]: p.jokers[jokerType] + 1 } }
            : p
        )
      })),
      currentMode: 'menu',
      setMode: (mode) => set({ currentMode: mode }),
      nordicProgress: 0,
      advanceNordic: (steps) => set((state) => ({
        nordicProgress: Math.min(100, state.nordicProgress + steps)
      })),
      resetGame: () => set((state) => ({
        players: state.players.map(p => ({ ...p, score: 0, jokers: { ...defaultJokers } })),
        nordicProgress: 0,
        currentMode: 'menu'
      })),
      difficulty: 'moyen',
      setDifficulty: (difficulty) => set({ difficulty }),
      // Initialisation des nouvelles propriétés
      selectedModel: 'gemini',
      setSelectedModel: (model) => set({ selectedModel: model }),
      nvidiaApiKey: '',
      setNvidiaApiKey: (key) => set({ nvidiaApiKey: key }),
    }),
    {
      name: 'roadtrip-quiz-storage',
    }
  )
);