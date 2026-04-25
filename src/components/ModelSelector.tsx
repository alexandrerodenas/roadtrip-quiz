"use client";

import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Bot, Check } from 'lucide-react';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, nvidiaApiKey, setNvidiaApiKey } = useStore();
  const [nvidiaKey, setNvidiaKey] = useState(nvidiaApiKey || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Modèles disponibles
  const models = [
    { id: 'gemini', name: 'Google Gemini', provider: 'Google' },
    { id: 'nvidia', name: 'NVIDIA NIM', provider: 'NVIDIA' },
  ];

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId as any);
  };

  const handleNvidiaKeyChange = (key: string) => {
    setNvidiaKey(key);
  };

  const saveNvidiaKey = () => {
    setNvidiaApiKey(nvidiaKey);
  };

  const verifyNvidiaKey = async () => {
    setIsVerifying(true);
    setVerificationStatus('idle');
    
    try {
      // Ici, vous pouvez implémenter la vérification de la clé API NVIDIA
      // Pour l'instant, nous simulons une vérification réussie
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVerificationStatus('success');
    } catch (error) {
      console.error('Erreur de vérification:', error);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-amber-400" />
          Modèle d'IA
        </h2>
        {verificationStatus === 'success' && (
          <div className="flex items-center text-green-400">
            <Check className="w-5 h-5 mr-1" />
            <span className="text-sm">Clé vérifiée</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => handleModelChange(model.id)}
            className={`p-4 rounded-xl border transition-all ${
              selectedModel === model.id
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-xs text-slate-500 mt-1">{model.provider}</div>
          </button>
        ))}
      </div>

      {selectedModel === 'nvidia' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Clé API NVIDIA NIM
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={nvidiaKey}
                onChange={(e) => handleNvidiaKeyChange(e.target.value)}
                placeholder="nvapi-..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <button
                onClick={saveNvidiaKey}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={verifyNvidiaKey}
                disabled={isVerifying}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isVerifying ? 'Vérification...' : 'Vérifier'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              La clé est stockée localement sur votre appareil.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}