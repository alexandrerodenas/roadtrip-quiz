"use client";

import { useStore } from '../store/useStore';
import Settings from '../components/Settings';
import MainMenu from '../components/MainMenu';
import QuizMode from '../components/QuizMode';
import DuelMode from '../components/DuelMode';
import MaitreMode from '../components/MaitreMode';
import { useEffect, useState } from 'react';

export default function Home() {
  const { apiKey, currentMode } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration errors

  if (!apiKey) {
    return <Settings />;
  }

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 inline-block mb-2">
          Roadtrip Quiz
        </h1>
        {currentMode === 'menu' && <p className="text-slate-400">Prêts pour l'aventure ?</p>}
      </header>

      {currentMode === 'menu' && <MainMenu />}
      
      {currentMode === 'coop' && (
        <QuizMode mode="coop" title="Pilote & Copilote" themeColor="emerald" />
      )}
      
      {currentMode === 'nordic' && (
        <QuizMode mode="nordic" title="Expédition Nordique" themeColor="cyan" />
      )}
      
      {currentMode === 'duel' && <DuelMode />}
      
      {currentMode === 'maitre' && <MaitreMode />}
    </>
  );
}
