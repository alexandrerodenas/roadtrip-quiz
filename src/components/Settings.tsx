"use client";

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Car, Key, Users, Loader2, Palette } from 'lucide-react';
import { verifyApiKey } from '../lib/ai-models';

export default function Settings() {
  const { apiKey, setApiKey, players, setPlayers, setMode, difficulty, setDifficulty, selectedModel, setSelectedModel } = useStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const [player1, setPlayer1] = useState(players[0]?.name || '');
  const [player2, setPlayer2] = useState(players[1]?.name || '');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSave = async () => {
    if (!localKey) {
      setError("Il faut une clé API !");
      return;
    }
    if (!player1) {
      setError("Renseignez le nom du joueur.");
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    // Vérification de la clé API en fonction du modèle sélectionné
    const isValid = await verifyApiKey(localKey);
    if (!isValid) {
      setError("Clé API invalide. Veuillez vérifier votre clé.");
      setIsVerifying(false);
      return;
    }
    
    // Sauvegarde des paramètres
    setApiKey(localKey);
    setPlayers([{ name: player1 }]);
    setMode('menu');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700"
    >
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-amber-500 rounded-full shadow-lg shadow-amber-500/30">
          <Car className="w-10 h-10 text-white" />
        </div>
      </div>
      
      <h2 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
        Préparation du Trajet
      </h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
            <Users className="w-4 h-4 mr-2 text-amber-400" />
            Nom du joueur
          </label>
          <input 
            type="text" 
            placeholder="Votre nom" 
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
            <Key className="w-4 h-4 mr-2 text-amber-400" />
            Clé API
          </label>
          <input 
            type="password" 
            placeholder="Clé API (Gemini ou NVIDIA)" 
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <p className="text-xs text-slate-500 mt-2">
            Stockée uniquement sur votre téléphone en local.
          </p>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
            <Palette className="w-4 h-4 mr-2 text-amber-400" />
            Difficulté
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          >
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </div>

        <button 
          onClick={handleSave}
          disabled={isVerifying}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Démarrer l'aventure"}
        </button>
      </div>
    </motion.div>
  );
}