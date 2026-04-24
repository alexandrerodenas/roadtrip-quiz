"use client";

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, ChefHat, Timer } from 'lucide-react';

interface CuisineModeProps {
  title: string;
  themeColor: string;
}

export default function CuisineMode({ title, themeColor }: CuisineModeProps) {
  const { setMode, updateScore, players, difficulty } = useStore();
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    setShowResult(false);
    setSelectedAnswer(null);
    setTimeLeft(20);

    try {
      // Ici, on utiliserait l'API NVIDIA NIM pour générer les questions de cuisine
      // Pour l'instant, je simule une réponse
      const data = {
        question: "Quel est l'ingrédient principal de la bouillabaisse ?",
        options: [
          "Poisson et fruits de mer",
          "Fruits de mer uniquement", 
          "Viande de bœuf",
          "Légumes variés"
        ],
        correctOptionIndex: 0,
        funFact: "La bouillabaisse traditionnelle marseillaise contient au moins 4 sortes de poissons différents !"
      };
      setQuestionData(data);
      setLoading(false);
    } catch (err: any) {
      setError("Impossible de générer la question. Vérifiez votre connexion et votre clé API.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  // Timer logic
  useEffect(() => {
    if (loading || showResult) return;
    if (timeLeft <= 0) {
      handleAnswer(-1); // timeout
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, showResult]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questionData.correctOptionIndex;
    
    if (isCorrect) {
      // Mise à jour du score
      updateScore(players[0].id, 10);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setMode('menu')}
          className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center"
        >
          ← Retour
        </button>
        <div className={`px-4 py-1 rounded-full text-sm font-bold border ${themeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
          {title}
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <p className="text-slate-400 animate-pulse">L'IA prépare les questions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-300 mb-6">{error}</p>
            <button onClick={loadQuestion} className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700">
              Réessayer
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                {questionData?.question}
              </h2>

              <div className="space-y-3">
                {questionData?.options.map((option: string, idx: number) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = showResult && idx === questionData.correctOptionIndex;
                  const isWrongSelected = showResult && isSelected && !isCorrect;

                  let btnClass = "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500";
                  if (showResult) {
                    if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-300";
                    else if (isWrongSelected) btnClass = "bg-red-500/20 border-red-500 text-red-300";
                    else btnClass = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${btnClass}`}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mr-4 text-sm font-bold opacity-70">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="mt-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <h4 className="text-amber-400 font-bold mb-2 flex items-center">
                    <ChefHat className="w-4 h-4 mr-2" />
                    Le saviez-vous ?
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {questionData?.funFact}
                  </p>
                  <button 
                    onClick={loadQuestion}
                    className="mt-6 w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors flex justify-center items-center"
                  >
                    Question suivante <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}