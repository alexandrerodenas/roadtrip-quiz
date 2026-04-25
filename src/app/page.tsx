"use client";

import { useStore } from '../store/useStore';
import Settings from '../components/Settings';
import MainMenu from '../components/MainMenu';
import QuizMode from '../components/QuizMode';
import DuelMode from '../components/DuelMode';
import MaitreMode from '../components/MaitreMode';
import CuisineMode from '../components/CuisineMode';
import ModelSelector from '../components/ModelSelector'; // Nouveau composant
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
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 inline-block mb-4 animate-pulse">
          Roadtrip Quiz
        </h1>
        {currentMode === 'menu' && <p className="text-slate-400">Prêts pour l'aventure ?</p>}
      </header>

      {/* Sélecteur de modèle */}
      <ModelSelector />

      {currentMode === 'menu' && <MainMenu />}
      
      {currentMode === 'coop' && (
        <QuizMode mode="coop" title="Pilote & Copilote" themeColor="emerald" />
      )}
      
      {currentMode === 'nordic' && (
        <QuizMode mode="nordic" title="Expédition Nordique" themeColor="cyan" />
      )}
      
      {currentMode === 'duel' && <DuelMode />}
      
      {currentMode === 'maitre' && <MaitreMode />}
      
      {currentMode === 'cuisine' && <CuisineMode title="Cuisine Gourmande" themeColor="amber" />}
    </>
  );
}