import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

// Type definition for the AI Studio window object
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

/**
 * Initializes the Gemini client.
 * For paid features (Veo/Pro Image), ensures we have the latest key.
 */
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Ensures the user has selected a paid API key for Pro features.
 */
const ensurePaidKeySelection = async (): Promise<void> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  } else {
    console.warn("AI Studio client library not found. Assuming dev environment or manual key provision.");
  }
};

/**
 * Generates an image using Gemini 3 Pro Image Preview.
 * Supports High-Quality generation with size selection.
 */
export const generateImagePro = async (
  prompt: string,
  size: ImageSize = '1K'
): Promise<string> => {
  // 1. Ensure Paid Key Selection
  await ensurePaidKeySelection();

  // 2. Create client *after* key selection to ensure env is updated
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1", // Default to square for mockups
        }
      },
    });

    // 3. Extract Image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};

/**
 * Edits an image using Gemini 2.5 Flash Image.
 * Used for "Nano banana" powered editing (e.g., filters, object removal).
 */
export const editImageFlash = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  const ai = getClient();
  
  // Clean base64 string if it contains metadata header
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
     throw new Error("No edited image returned.");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};