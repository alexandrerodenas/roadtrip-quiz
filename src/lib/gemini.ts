import { GoogleGenerativeAI } from '@google/generative-ai';
import { useStore } from '../store/useStore';

export async function verifyApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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
  // Using gemini-2.5-pro or gemini-1.5-flash-latest based on availability, using standard text generation.
  // We'll use gemini-1.5-flash-latest as it's fast and reliable for simple json generation.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  let prompt = "";

  if (mode === 'nordic') {
    prompt = `Génère une question de quiz coopératif sur le thème d'un road trip de Nantes aux îles Lofoten (Norvège) avec retour par la Suède.
    Thèmes possibles: géographie, culture viking, vocabulaire norvégien/suédois, cuisine locale, histoire, mythes, faune (rennes, élans...).
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote amusante à lire après la réponse" }`;
  } else if (mode === 'coop') {
    prompt = `Génère une question de culture générale amusante pour deux personnes en roadtrip.
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une anecdote courte" }`;
  } else if (mode === 'duel') {
    prompt = `Génère une question de culture générale compétitive et un peu tordue/piège pour un duel.
    Difficulté : ${difficulty}.
    Format JSON exact: { "question": "La question", "options": ["A", "B", "C", "D"], "correctOptionIndex": 0, "funFact": "Une pique amicale ou anecdote" }`;
  } else if (mode === 'maitre') {
    prompt = `Génère un concept, un personnage historique ou un lieu célèbre à faire deviner (Jeu du Taboo/Burger Quiz).
    Donne le mot à faire deviner, et 3 mots INTERDITS qu'il ne faut pas prononcer.
    Format JSON exact: { "wordToGuess": "Le mot", "forbiddenWords": ["Mot1", "Mot2", "Mot3"], "hint": "Un indice que le maître du jeu peut donner" }`;
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean markdown formatting if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Erreur Gemini détaillée:", error);
    throw error;
  }
}
