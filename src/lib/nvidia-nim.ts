import { GoogleGenerativeAI } from '@google/generative-ai';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour l'API NVIDIA NIM
interface NvidiaNimConfig {
  apiKey: string;
  baseUrl: string;
}

interface NvidiaNimResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Configuration de l'API NVIDIA NIM
const nvidiaNimConfig: NvidiaNimConfig = {
  apiKey: process.env.NVIDIA_NIM_API_KEY || '',
  baseUrl: 'https://integrate.api.nvidia.com/v1',
};

// Fonction pour générer une question via l'API NVIDIA NIM
export async function generateQuestion(prompt: string): Promise<any> {
  try {
    // Vérifier si la clé API NVIDIA NIM est définie
    if (!nvidiaNimConfig.apiKey) {
      throw new Error("Clé API NVIDIA NIM manquante");
    }

    // Appel à l'API NVIDIA NIM
    const response = await fetch(`${nvidiaNimConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nvidiaNimConfig.apiKey}`
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-4-340b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API NVIDIA NIM: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API NVIDIA NIM:", error);
    throw error;
  }
}