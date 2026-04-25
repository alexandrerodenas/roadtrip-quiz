import { useStore } from '../store/useStore';

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

// Fonction pour vérifier la clé API NVIDIA NIM
export async function verifyNvidiaApiKey(apiKey: string): Promise<boolean> {
  try {
    // Appel à l'API NVIDIA NIM pour vérification
    const response = await fetch(`${nvidiaNimConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-4-340b-instruct",
        messages: [
          {
            role: "user",
            content: "Test"
          }
        ]
      })
    });

    return response.ok;
  } catch (error) {
    console.error("Erreur de vérification de la clé NVIDIA:", error);
    return false;
  }
}

// Fonction pour générer une question via l'API NVIDIA NIM
export async function generateQuestionWithNvidia(prompt: string): Promise<any> {
  const { nvidiaApiKey } = useStore.getState();
  
  if (!nvidiaApiKey) {
    throw new Error("Clé API NVIDIA NIM manquante");
  }

  try {
    // Appel à l'API NVIDIA NIM
    const response = await fetch(`${nvidiaNimConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-4-340b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
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