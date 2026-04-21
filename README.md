# Roadtrip Quiz : En route vers les Lofoten 🇳🇴🚗

Une application web interactive de quiz générés par IA, conçue spécialement pour occuper un long trajet en voiture (particulièrement de Nantes jusqu'aux îles Lofoten).

L'application utilise l'API de Google Gemini pour générer des questions à la volée, évitant ainsi la répétition et garantissant que les questions soient toujours surprenantes et adaptées au contexte du voyage.

## Fonctionnalités

- **🧠 Génération par IA (Gemini)** : Des milliers de questions possibles, sans base de données statique.
- **⚡ Système de Timer** : 20 secondes pour répondre. Les réponses rapides (< 5s) rapportent le double de points !
- **🃏 Jokers Tactiques** :
  - 🚢 **Ferry** : Passe la question en douceur.
  - ✨ **Aurore Boréale** : Élimine 2 mauvaises réponses (50/50).
  - 👁️ **L'œil du Troll** : Donne un petit indice généré par l'IA.
- **🎲 Évènements Aléatoires** : 
  - ❄️ *Tempête de Neige* (-5s au chrono).
  - ☕ *Pause Fika* (gagnez un joker Troll).
  - 🛣️ *Route Scénique* (points doublés).
  - 🚔 *Radar Norvégien* (une mauvaise réponse vous fait reculer sur la route).
  - 🗺️ *Raccourci* (gagnez un joker Aurore).

## Modes de jeu

- **🏔️ Aventure Nordique (Coop)** : L'objectif est d'atteindre 100% (les îles Lofoten) ! Chaque bonne réponse fait avancer la barre de progression.
- **⚔️ Mode Duel** : Les joueurs s'affrontent sur des questions tordues avec un système de vies (celui qui perd ses 3 vies reçoit un gage).
- **🗣️ Maître du Jeu** : Mode "Taboo", un joueur fait deviner un concept nordique à l'autre sans utiliser les mots interdits.

## Technologies Utilisées

- [Next.js](https://nextjs.org) (App Router, React)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Zustand](https://docs.pmnd.rs/zustand/) (avec persistence) pour la gestion d'état
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Gemini 3.1 Flash-Lite)

## Installation & Déploiement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour y jouer.

> **Note**: Pour jouer, vous devrez saisir une clé API Google Gemini valide sur l'écran d'accueil du jeu. La clé est sauvegardée localement dans votre navigateur et n'est jamais transmise à un serveur tiers.

## Déploiement

Ce projet est optimisé pour un déploiement "Zero-config" sur [Vercel](https://vercel.com).
