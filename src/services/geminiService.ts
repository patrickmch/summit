
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are SummitCoach, a world-class training assistant for elite mountain athletes (climbers, ultra runners, alpinists, skimo racers). 
Your tone is professional, encouraging, data-driven, and stoic. 
You understand training methodologies like Uphill Athlete, periodization, and the nuances of mountain sports.
When athletes are tired or tweaked, you provide advice on whether to push or rest based on physiological principles.
Always maintain a premium, helpful, and slightly mysterious "mountain mentor" vibe.
Keep responses concise but high-impact.
`;

export const getCoachResponse = async (userMessage: string, history: { role: 'user' | 'assistant', content: string }[]) => {
  try {
    const chat = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const response = await chat;
    return response.text || "I'm processing the mountain air. Give me a moment.";
  } catch (error) {
    console.error("Coach API Error:", error);
    return "The connection is spotty up here. Let's try that again.";
  }
};
