import { GoogleGenerativeAI } from '@google/generative-ai';
import { useStore } from '../store/useStore';
import { generateQuestion as generateNvidiaQuestion } from '../lib/nvidia-nim';

export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    await model.generateContent("Test");
    return true;
  } catch (error) {
    console.error("Erreur de vérification de la clé:", error);
    return false;
  }
}

export async function generateQuestion(mode: string, difficulty: string = 'moyen') {
  const { apiKey } = useStore.getState();
  if (!apiKey) throw new Error("Clé API manquante");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

  let prompt = "";

  if (mode === 'nordic') {
    prompt = `Génère une question de quiz coopératif sur le thème d'un road trip de Nantes aux îles Lofoten (Norvège) avec retour par la Suède.
    Thèmes possibles: géographie, culture viking, vocabulaire norvégien/suédois, cuisine locale, histoire, mythes, faune (rennes, élans...).
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote amusante", "indice": "Un petit indice utile" }`;
  } else if (mode === 'coop') {
    prompt = `Génère une question de culture générale amusante pour deux personnes en roadtrip.
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote courte", "indice": "Un indice" }`;
  } else if (mode === 'duel') {
    prompt = `Génère une question de culture générale compétitive et un peu tordue/piège pour un duel.
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une pique amicale ou anecdote", "indice": "Un indice" }`;
  } else if (mode === 'maitre') {
    prompt = `Génère un concept, un personnage historique ou un lieu célèbre à faire deviner (Jeu du Taboo/Burger Quiz).
    Donne le mot à faire deviner, et 3 mots INTERDITS qu'il ne faut pas prononcer.
    Format JSON exact: { "wordToGuess": "Le mot", "forbiddenWords": ["Mot1", "Mot2", "Mot3"], "hint": "Un indice que le maître du jeu peut donner" }`;
  } else if (mode === 'cuisine') {
    prompt = `Génère une question de cuisine.
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote amusante", "indice": "Un petit indice utile" }`;
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Erreur Gemini détaillée:", error);
    throw error;
  }
}