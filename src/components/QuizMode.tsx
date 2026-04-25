"use client";

import { useState, useEffect } from 'react';
import { generateQuestion } from '../lib/ai-models';
import { useStore, GameMode } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, AlertCircle, MapPin, Sparkles, Ship, Eye, Snowflake, Coffee, Timer, Route, Navigation, Radar } from 'lucide-react';

interface QuizModeProps {
  mode: GameMode;
  title: string;
  themeColor: string;
}

export default function QuizMode({ mode, title, themeColor }: QuizModeProps) {
  const { setMode, updateScore, players, nordicProgress, advanceNordic, useJoker, addJoker } = useStore();
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  // New states for gameplay mechanics
  const [timeLeft, setTimeLeft] = useState(20);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [eventMsg, setEventMsg] = useState<{title: string, desc: string, icon: any} | null>(null);
  const [pointsMultiplier, setPointsMultiplier] = useState(1);

  // Use player 0's jokers as the team's jokers in coop
  const teamJokers = players[0]?.jokers || { ferry: 0, aurora: 0, troll: 0 };

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    setShowResult(false);
    setSelectedAnswer(null);
    setHiddenOptions([]);
    setShowHint(false);
    setTimeLeft(20);
    setEventMsg(null);
    setPointsMultiplier(1);

    // Random Event (25% chance in Nordic mode)
    if (mode === 'nordic' && Math.random() < 0.25) {
      const events = [
        { title: "Tempête de Neige !", desc: "Temps réduit pour la prochaine question (-5s)", icon: <Snowflake className="w-12 h-12 text-cyan-300" />, effect: () => setTimeLeft(15) },
        { title: "Pause Fika ☕", desc: "Vous vous reposez et gagnez 1 Joker Troll (Indice) !", icon: <Coffee className="w-12 h-12 text-amber-600" />, effect: () => addJoker(players[0].id, 'troll') },
        { title: "Route Scénique 🛣️", desc: "La question rapporte le double de points ! Prenez le temps d'admirer le paysage.", icon: <Route className="w-12 h-12 text-emerald-400" />, effect: () => setPointsMultiplier(2) },
        { title: "Radar Norvégien 🚔", desc: "Attention, si vous vous trompez, vous reculez sur la carte ! Soyez prudents.", icon: <Radar className="w-12 h-12 text-rose-500" />, effect: () => setPointsMultiplier(-1) },
        { title: "Raccourci Découvert 🗺️", desc: "Bravo ! Vous gagnez immédiatement un joker Aurore Boréale.", icon: <Navigation className="w-12 h-12 text-purple-400" />, effect: () => addJoker(players[0].id, 'aurora') }
      ];
      const ev = events[Math.floor(Math.random() * events.length)];
      setEventMsg(ev);
      ev.effect();
      await new Promise(resolve => setTimeout(resolve, 3500)); // Show event for 3.5s
      setEventMsg(null);
    }

    // Ajouter un facteur d'aléatoire pour éviter les répétitions de questions
    const randomFactor = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();

    try {
      const data = await generateQuestion(mode, randomFactor, timestamp);
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

  // Timer logic
  useEffect(() => {
    if (loading || showResult || eventMsg) return;
    if (timeLeft <= 0) {
      handleAnswer(-1); // timeout
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, showResult, eventMsg]);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questionData.correctOptionIndex;
    
    if (isCorrect) {
      // Points multiplier based on speed
      let points = 10;
      if (timeLeft > 15) points = 20; // Fast answer bonus!

      // Apply event multiplier
      if (pointsMultiplier > 0) points *= pointsMultiplier;

      updateScore(players[0].id, points);
      if (players.length > 1) updateScore(players[1].id, points);
      if (mode === 'nordic') advanceNordic(5 * (pointsMultiplier > 0 ? pointsMultiplier : 1));
    } else {
        // Penalty logic for radar event
        if (pointsMultiplier === -1 && mode === 'nordic') {
            advanceNordic(-5); // Penalité
        }
    }
  };

  const handleFerry = () => {
    if (teamJokers.ferry > 0 && !showResult) {
      useJoker(players[0].id, 'ferry');
      // Auto win
      setSelectedAnswer(questionData.correctOptionIndex);
      setShowResult(true);
      if (mode === 'nordic') advanceNordic(5 * (pointsMultiplier > 0 ? pointsMultiplier : 1));
    }
  };

  const handleAurora = () => {
    if (teamJokers.aurora > 0 && !showResult && hiddenOptions.length === 0) {
      useJoker(players[0].id, 'aurora');
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== questionData.correctOptionIndex);
      // Hide 2 random wrong options
      const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
      setHiddenOptions([shuffled[0], shuffled[1]]);
    }
  };

  const handleTroll = () => {
    if (teamJokers.troll > 0 && !showResult && !showHint) {
      useJoker(players[0].id, 'troll');
      setShowHint(true);
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
              animate={{ width: `${Math.max(0, nordicProgress)}%` }}
            />
          </div>
        </div>
      )}

      {eventMsg ? (
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center animate-pulse shadow-[0_0_50px_rgba(34,211,238,0.1)]">
          {eventMsg.icon}
          <h2 className="text-3xl font-bold text-white mt-6 mb-2">{eventMsg.title}</h2>
          <p className="text-xl text-slate-300">{eventMsg.desc}</p>
        </div>
      ) : loading ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400 animate-pulse">L'IA prépare la route...</p>
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
            {/* Jokers & Timer Bar */}
            <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-slate-700">
              <div className="flex gap-3">
                <button 
                  onClick={handleFerry} disabled={showResult || teamJokers.ferry === 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${teamJokers.ferry > 0 && !showResult ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                >
                  <Ship className="w-4 h-4" /> {teamJokers.ferry} Ferry
                </button>
                <button 
                  onClick={handleAurora} disabled={showResult || teamJokers.aurora === 0 || hiddenOptions.length > 0}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${teamJokers.aurora > 0 && !showResult ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                >
                  <Sparkles className="w-4 h-4" /> {teamJokers.aurora} Aurore
                </button>
                <button 
                  onClick={handleTroll} disabled={showResult || teamJokers.troll === 0 || showHint}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold ${teamJokers.troll > 0 && !showResult ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-slate-800 text-slate-500 opacity-50'}`}
                >
                  <Eye className="w-4 h-4" /> {teamJokers.troll} Indice
                </button>
              </div>
              
              <div className={`flex items-center font-bold text-lg px-3 py-1 rounded-lg ${timeLeft <= 5 ? 'text-red-400 animate-pulse bg-red-500/20' : 'text-slate-300 bg-slate-800'}`}>
                <Timer className="w-5 h-5 mr-2" /> {timeLeft}s
              </div>
            </div>

            <div className="p-8">
              {pointsMultiplier === 2 && (
                <div className="mb-4 inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Points Doublés
                </div>
              )}
              {pointsMultiplier === -1 && (
                <div className="mb-4 inline-block px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Danger Radar
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
                {questionData?.question}
              </h2>

              {showHint && questionData?.indice && (
                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-3 text-purple-300 text-sm">
                  <Eye className="w-5 h-5 shrink-0 mt-0.5" />
                  <p><strong>Indice du Troll :</strong> {questionData.indice}</p>
                </motion.div>
              )}

              <div className="space-y-3">
                {questionData?.options.map((option: string, idx: number) => {
                  if (hiddenOptions.includes(idx)) return null; // Hide option via Joker

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
