import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type GameMode = 'menu' | 'coop' | 'duel' | 'maitre' | 'nordic';

interface GameState {
  apiKey: string;
  setApiKey: (key: string) => void;
  players: Player[];
  setPlayers: (players: Omit<Player, 'id' | 'score'>[]) => void;
  updateScore: (playerId: string, points: number) => void;
  currentMode: GameMode;
  setMode: (mode: GameMode) => void;
  nordicProgress: number; // Percentage or steps to Lofoten
  advanceNordic: (steps: number) => void;
  resetGame: () => void;
}

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
          score: 0
        }))
      }),
      updateScore: (playerId, points) => set((state) => ({
        players: state.players.map(p => 
          p.id === playerId ? { ...p, score: p.score + points } : p
        )
      })),
      currentMode: 'menu',
      setMode: (mode) => set({ currentMode: mode }),
      nordicProgress: 0,
      advanceNordic: (steps) => set((state) => ({
        nordicProgress: Math.min(100, state.nordicProgress + steps)
      })),
      resetGame: () => set((state) => ({
        players: state.players.map(p => ({ ...p, score: 0 })),
        nordicProgress: 0,
        currentMode: 'menu'
      }))
    }),
    {
      name: 'roadtrip-quiz-storage',
    }
  )
);
