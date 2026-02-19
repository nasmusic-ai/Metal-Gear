
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMissionBriefing = async () => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Write a short, high-tension mission briefing for a Metal Gear style game. The operation is called "Silent Kapten". The target is an underground research facility holding a prototype EMP device. Keep it under 100 words.',
    config: {
        systemInstruction: "You are Colonel Kapten, a veteran military commander. Your tone is gruff, professional, and urgent. Use military terminology."
    }
  });
  return response.text || "Mission briefing unavailable. Proceed with caution.";
};

export const getRadioDialogue = async (context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The operative is in this situation: ${context}. Provide a short tactical tip or story flavor as Colonel Kapten. Keep it under 50 words.`,
    config: {
        systemInstruction: "You are Colonel Kapten. You are providing radio support via Codec. Be helpful but brief."
    }
  });
  return response.text || "Stay low, keep your eyes open.";
};
