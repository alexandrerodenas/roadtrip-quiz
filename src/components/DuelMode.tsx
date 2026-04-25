"use client";

import { useState, useEffect } from 'react';
import { generateQuestion } from '../lib/ai-models';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, CircleDashed, ShieldAlert } from 'lucide-react';

export default function DuelMode() {
  const { setMode, players } = useStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Local state for duel
  const [turn, setTurn] = useState<0 | 1>(0);
  const [lives, setLives] = useState([3, 3]);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    setShowResult(false);
    setSelectedAnswer(null);
    const { mode } = useStore.getState(); // Récupérer le mode depuis le store
    setHiddenOptions([]);
    setShowHint(false);
    setTimeLeft(20);
    setEventMsg(null);
    setPointsMultiplier(1);

    try {
      const data = await generateQuestion(mode, Math.floor(Math.random() * 10000), Date.now());
      setData(data);
    } catch (err: any) {
      setError("Erreur de génération.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === data.correctOptionIndex;
    if (!isCorrect) {
      const newLives = [...lives];
      newLives[turn] -= 1;
      setLives(newLives);
    }
  };

  const nextTurn = () => {
    if (lives[0] === 0 || lives[1] === 0) return; // Game over
    setTurn(turn === 0 ? 1 : 0);
    loadQuestion();
  };

  const resetDuel = () => {
    setLives([3, 3]);
    setTurn(0);
    loadQuestion();
  };

  if (lives[0] === 0 || lives[1] === 0) {
    const winnerIdx = lives[0] === 0 ? 1 : 0;
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 bg-slate-800/80 border border-slate-700 p-12 rounded-3xl">
        <ShieldAlert className="w-20 h-20 text-rose-500 mx-auto" />
        <h2 className="text-4xl font-black text-white">Duel Terminé !</h2>
        <p className="text-xl text-slate-300">
          <strong className="text-rose-400">{players[winnerIdx].name}</strong> remporte la victoire !
        </p>
        <p className="text-slate-400 italic">Le perdant a un gage...</p>
        <div className="pt-8 flex gap-4 justify-center">
          <button onClick={resetDuel} className="bg-slate-700 text-white px-6 py-3 rounded-xl hover:bg-slate-600">Revanche</button>
          <button onClick={() => setMode('menu')} className="bg-rose-500 text-white px-6 py-3 rounded-xl hover:bg-rose-600">Retour au menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setMode('menu')}
          className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          ← Retour
        </button>
        <div className="px-4 py-1 rounded-full text-sm font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          C'est au tour de {players[turn].name}
        </div>
      </div>

      <div className="flex justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        {[0, 1].map((pIdx) => (
          <div key={pIdx} className={`flex items-center gap-2 ${turn === pIdx ? 'opacity-100' : 'opacity-50'}`}>
            <span className="font-bold text-white mr-2">{players[pIdx].name}</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <CircleDashed key={i} className={`w-6 h-6 ${i < lives[pIdx] ? 'text-rose-500 fill-rose-500/20' : 'text-slate-700'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
          <p className="text-slate-400">Préparation d'une question piège...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={data?.question}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-8">{data?.question}</h2>
            <div className="space-y-3">
              {data?.options.map((opt: string, idx: number) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = showResult && idx === data.correctOptionIndex;
                const isWrongSelected = showResult && isSelected && !isCorrect;

                let btnClass = "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700";
                if (showResult) {
                  if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-300";
                  else if (isWrongSelected) btnClass = "bg-red-500/20 border-red-500 text-red-300";
                  else btnClass = "opacity-50 bg-slate-900 border-slate-800";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div className="p-4 bg-slate-900 rounded-xl mb-6 border border-slate-700">
                  <p className="text-slate-300 text-sm">{data?.funFact}</p>
                </div>
                <button 
                  onClick={nextTurn}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center"
                >
                  Passer au joueur suivant <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
