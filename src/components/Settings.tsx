"use client";

import { useState } from 'react';
import { useStore } from '../store/useStore';
import { verifyApiKey } from '../lib/gemini';
import { Settings as SettingsIcon, Car, Key, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  const { apiKey, setApiKey, players, setPlayers, setMode } = useStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const [player1, setPlayer1] = useState(players[0]?.name || '');
  const [player2, setPlayer2] = useState(players[1]?.name || '');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSave = async () => {
    if (!localKey) {
      setError("Il faut une clé API Gemini !");
      return;
    }
    if (!player1 || !player2) {
      setError("Renseignez les noms des deux joueurs.");
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    const isValid = await verifyApiKey(localKey);
    setIsVerifying(false);
    
    if (!isValid) {
      setError("La clé API est invalide ou ne fonctionne pas. Vérifiez-la.");
      return;
    }

    setApiKey(localKey);
    setPlayers([{ name: player1 }, { name: player2 }]);
    setMode('menu');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700"
    >
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/30">
          <Car className="w-10 h-10 text-white" />
        </div>
      </div>
      
      <h2 className="text-3xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
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
            <Users className="w-4 h-4 mr-2 text-indigo-400" />
            Noms des voyageurs
          </label>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Conducteur" 
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <input 
              type="text" 
              placeholder="Copilote" 
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-slate-300 mb-2">
            <Key className="w-4 h-4 mr-2 text-indigo-400" />
            Clé API Google Gemini
          </label>
          <input 
            type="password" 
            placeholder="AIzaSy..." 
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <p className="text-xs text-slate-500 mt-2">
            Stockée uniquement sur votre téléphone en local.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={isVerifying}
          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Démarrer l'aventure"}
        </button>
      </div>
    </motion.div>
  );
}
