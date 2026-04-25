import { generateQuestionWithGemini, verifyGeminiApiKey } from './gemini';
import { generateQuestionWithNvidia, verifyNvidiaApiKey } from './nvidia-nim';
import { useStore } from '../store/useStore';
import { Question } from '../types/quiz';

// Fonction pour vérifier la clé API en fonction du modèle sélectionné
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  const { selectedModel } = useStore.getState();
  
  switch (selectedModel) {
    case 'gemini':
      return await verifyGeminiApiKey(apiKey);
    case 'nvidia':
      return await verifyNvidiaApiKey(apiKey);
    default:
      return await verifyGeminiApiKey(apiKey);
  }
}

// Fonction unifiée pour générer une question en fonction du modèle sélectionné
export async function generateQuestion(mode: string, randomFactor: number = 0, timestamp: number = 0): Promise<Question> {
  const { selectedModel, difficulty } = useStore.getState();
  
  // Construction du prompt en fonction du mode
  let prompt = "";
  
  if (mode === 'nordic') {
    prompt = `Génère une question de quiz coopératif sur le thème d'un road trip de Nantes aux îles Lofoten (Norvège) avec retour par la Suède.
    Thèmes possibles: géographie, culture viking, vocabulaire norvégien/suédois, cuisine locale, histoire, mythes, faune (rennes, élans...).
    Difficulté : ${difficulty}.
    Facteur d'aléatoire : ${randomFactor}. Timestamp : ${timestamp}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote amusante", "indice": "Un petit indice utile" }`;
  } else if (mode === 'coop') {
    prompt = `Génère une question de culture générale amusante pour deux personnes en roadtrip.
    Difficulté : ${difficulty}.
    Facteur d'aléatoire : ${randomFactor}. Timestamp : ${timestamp}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote courte", "indice": "Un indice" }`;
  } else if (mode === 'duel') {
    prompt = `Génère une question de culture générale compétitive et un peu tordue/piège pour un duel.
    Difficulté : ${difficulty}.
    Facteur d'aléatoire : ${randomFactor}. Timestamp : ${timestamp}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une pique amicale ou anecdote", "indice": "Un indice" }`;
  } else if (mode === 'maitre') {
    prompt = `Génère un concept, un personnage historique ou un lieu célèbre à faire deviner (Jeu du Taboo/Burger Quiz).
    Donne le mot à faire deviner, et 3 mots INTERDITS qu'il ne faut pas prononcer.
    Facteur d'aléatoire : ${randomFactor}. Timestamp : ${timestamp}.
    Format JSON exact: { "wordToGuess": "Le mot", "forbiddenWords": ["Mot1", "Mot2", "Mot3"], "hint": "Un indice que le maître du jeu peut donner" }`;
  } else if (mode === 'cuisine') {
    prompt = `Génère une question de cuisine.
    Difficulté : ${difficulty}.
    Facteur d'aléatoire : ${randomFactor}. Timestamp : ${timestamp}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote amusante", "indice": "Un petit indice utile" }`;
  }

  // Génération de la question en fonction du modèle sélectionné
  switch (selectedModel) {
    case 'gemini':
      return await generateQuestionWithGemini(mode, difficulty);
      
    case 'nvidia':
      const nvidiaResponse = await generateQuestionWithNvidia(prompt);
      // Extraction de la réponse au format JSON
      const content = nvidiaResponse.choices[0].message.content;
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanContent);
      
    default:
      // Par défaut, utiliser Gemini
      return await generateQuestionWithGemini(mode, difficulty);
  }
}