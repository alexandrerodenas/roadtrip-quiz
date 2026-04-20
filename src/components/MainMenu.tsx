"use client";

import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MainMenu() {
  const { players, setMode, setApiKey } = useStore();

  const modes = [
    {
      id: 'nordic',
      title: 'Expédition Nordique',
      desc: 'Nantes ➔ Lofoten ➔ Suède. Un mode spécial coopératif thématisé sur votre trajet !',
      iconPath: '/icons/quiz.svg',
      color: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-cyan-500/20'
    },
    {
      id: 'coop',
      title: 'Pilote & Copilote',
      desc: 'Répondez ensemble pour faire avancer la jauge de voyage.',
      iconPath: '/icons/maitre.svg',
      color: 'from-emerald-500 to-green-400',
      shadow: 'shadow-emerald-500/20'
    },
    {
      id: 'duel',
      title: 'Duel de l\\'Autoroute',
      desc: 'Chacun son tour. 3 vies. Le premier à perdre ses roues de secours a un gage !',
      iconPath: '/icons/duel.svg',
      color: 'from-rose-500 to-orange-400',
      shadow: 'shadow-rose-500/20'
    },
    {
      id: 'maitre',
      title: 'Le Maître du Jeu',
      desc: 'Faites deviner un mot à l\\'autre sans prononcer les mots interdits.',
      iconPath: '/icons/maitre.svg',
      color: 'from-purple-500 to-pink-400',
      shadow: 'shadow-purple-500/20'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex gap-4">
          {players.map((p, i) => (
            <div key={p.id} className="text-center px-4">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">{i === 0 ? 'Conducteur' : 'Copilote'}</div>
              <div className="text-lg font-bold text-white">{p.name}</div>
              <div className="text-sm text-indigo-400">{p.score} pts</div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => { setApiKey(''); }} 
          className="p-3 text-slate-400 hover:text-white bg-slate-700/50 rounded-xl transition-colors"
        >
          <Image src="/icons/settings.svg" alt="Settings" width={20} height={20} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode, i) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setMode(mode.id as any)}
            className={`text-left p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-all shadow-xl hover:-translate-y-1 relative overflow-hidden group btn-animated card-glow`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mode.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${mode.color} text-white mb-4 shadow-lg ${mode.shadow}`}>
              <Image src={mode.iconPath} alt={mode.title} width={32} height={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{mode.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{mode.desc}</p>
          </motion.button>
        ))}`
      </div>
    </div>
  );
}
