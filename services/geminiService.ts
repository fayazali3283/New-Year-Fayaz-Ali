
import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateGreeting = async (recipient: string, tone: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a beautiful, creative, and inspiring New Year greeting for ${recipient}. The tone should be ${tone}. Keep it under 100 words. Include festive emojis.`,
    config: {
      temperature: 0.8,
    }
  });
  return response.text || "Happy New Year!";
};

export const generateFestiveImage = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-quality, cinematic, festive New Year celebration poster. ${prompt}. Cinematic lighting, 4k, artistic, joyful atmosphere.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const speakGreeting = async (text: string, voice: string = 'Kore'): Promise<Uint8Array | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with excitement: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  return null;
};

export const findLocalEvents = async (lat: number, lng: number): Promise<{ text: string, links: any[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "What are the top New Year's Eve events, parties, and fireworks locations near me?",
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    },
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { text, links: chunks };
};
