import { ImageSize } from "../types";

const API_BASE_URL = 'http://localhost:3002/api';

/**
 * Generates an image by calling the backend proxy.
 */
export const generateImagePro = async (
  prompt: string,
  size: ImageSize = '1K'
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, size }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error');
    }

    const data = await response.json();
    return data.image; // Base64 string
  } catch (error) {
    console.error("Frontend Generate Error:", error);
    throw error;
  }
};

/**
 * Edits an image by calling the backend proxy.
 */
export const editImageFlash = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error');
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error("Frontend Edit Error:", error);
    throw error;
  }
};