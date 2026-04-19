"use client";

import { useState, useEffect } from 'react';
import { generateQuestion } from '../lib/gemini';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function MaitreMode() {
  const { setMode } = useStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const loadWord = async () => {
    setLoading(true);
    setError('');
    setShowSecret(false);
    try {
      const result = await generateQuestion('maitre');
      setData(result);
    } catch (err: any) {
      setError("Erreur de génération.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWord();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setMode('menu')}
          className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center"
        >
          ← Retour
        </button>
        <div className="px-4 py-1 rounded-full text-sm font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Le Maître du Jeu
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
          <p className="text-slate-400">Invention d'un concept complexe...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center min-h-[400px]">
          <p className="text-red-300 mb-6">{error}</p>
          <button onClick={loadWord} className="bg-slate-800 text-white px-6 py-2 rounded-lg">Réessayer</button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />
          
          <h2 className="text-xl font-medium text-slate-400 mb-2">Mot à faire deviner</h2>
          
          {!showSecret ? (
            <div className="py-12">
              <button 
                onClick={() => setShowSecret(true)}
                className="mx-auto flex flex-col items-center justify-center space-y-4 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <EyeOff className="w-16 h-16 opacity-50" />
                <span className="font-bold">Cacher l'écran au conducteur et appuyer pour révéler</span>
              </button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 py-6"
              >
                <div className="text-5xl font-black text-white tracking-tight">
                  {data?.wordToGuess}
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 inline-block w-full max-w-sm">
                  <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-4">Mots interdits</h3>
                  <div className="space-y-3">
                    {data?.forbiddenWords?.map((word: string, i: number) => (
                      <div key={i} className="text-xl font-bold text-slate-200 line-through decoration-red-500 decoration-2">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                {data?.hint && (
                  <div className="text-sm text-slate-400 italic px-8">
                    Indice autorisé : {data.hint}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-700">
                  <button 
                    onClick={loadWord}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center mx-auto"
                  >
                    Mot suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
}
