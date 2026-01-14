
import { GoogleGenAI, Type } from "@google/genai";
import { TestCategory, TypingStats, AIFeedback } from "../types";
import { GEMINI_MODEL } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTestText = async (category: TestCategory, length: number = 300): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate a very long, high-quality, continuous text for a professional typing test about ${category}. 
                 The text should be approximately ${length} to 500 words long. 
                 It must be educational, engaging, and use a professional vocabulary. 
                 Do not use lists or bullet points. Return ONLY the plain text.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const getAIFeedback = async (stats: TypingStats): Promise<AIFeedback> => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze these typing test stats and provide professional, encouraging feedback:
                 WPM: ${stats.wpm}
                 Accuracy: ${stats.accuracy}%
                 Errors: ${stats.errors}
                 
                 Provide the response in JSON format with two keys: 
                 "tips" (an array of 3 short, actionable typing tips) and 
                 "encouragement" (a short sentence of encouragement).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Professional typing tips based on performance.'
            },
            encouragement: {
              type: Type.STRING,
              description: 'A brief encouraging sentence.'
            }
          },
          required: ["tips", "encouragement"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error getting feedback:", error);
    return {
      tips: ["Focus on rhythm over speed.", "Keep your hands in the home row position.", "Look at the screen, not the keyboard."],
      encouragement: "Great job! Keep practicing to improve your consistency."
    };
  }
};
