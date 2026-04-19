"use client";

import { useState, useEffect } from 'react';
import { generateQuestion } from '../lib/gemini';
import { useStore, GameMode } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, MapPin, Sparkles } from 'lucide-react';

interface QuizModeProps {
  mode: GameMode;
  title: string;
  themeColor: string;
}

export default function QuizMode({ mode, title, themeColor }: QuizModeProps) {
  const { setMode, updateScore, players, nordicProgress, advanceNordic } = useStore();
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    setShowResult(false);
    setSelectedAnswer(null);
    try {
      const data = await generateQuestion(mode);
      setQuestionData(data);
    } catch (err: any) {
      setError("Impossible de générer la question. Vérifiez votre connexion et votre clé API.");
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

    const isCorrect = index === questionData.correctOptionIndex;
    
    if (isCorrect) {
      // Both players get points in coop/nordic
      updateScore(players[0].id, 10);
      updateScore(players[1].id, 10);
      if (mode === 'nordic') advanceNordic(5); // 5% progress per correct answer
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setMode('menu')}
          className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center"
        >
          ← Retour au menu
        </button>
        <div className={`px-4 py-1 rounded-full text-sm font-bold border ${themeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'}`}>
          {title}
        </div>
      </div>

      {mode === 'nordic' && (
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
            <span>Nantes</span>
            <span className="text-cyan-400 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {nordicProgress}%</span>
            <span>Lofoten</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${nordicProgress}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">L'IA prépare la prochaine question...</p>
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
        <AnimatePresence mode="wait">
          <motion.div 
            key={questionData?.question}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-800/80 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
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
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-8 p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl"
                >
                  <h4 className="text-indigo-400 font-bold mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
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
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
