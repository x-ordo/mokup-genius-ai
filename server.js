import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client (Backend Only)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in environment variables!");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'MockupGenius API is running' });
});

/**
 * Endpoint: /api/generate-image
 * Generates an image using Gemini 3 Pro Image Preview.
 */
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt, size = '1K' } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`[Generate] Prompt: "${prompt}", Size: ${size}`);

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    imageSize: size, // Assuming SDK maps this correctly or we might need to map '1K' -> '1024x1024' depending on actual API spec
                    aspectRatio: "1:1",
                }
            },
        });

        // Extract inline data
        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && part.inlineData) {
            const base64Image = `data:image/png;base64,${part.inlineData.data}`;
            res.json({ image: base64Image });
        } else {
            throw new Error("No image data found in response.");
        }

    } catch (error) {
        console.error("Generate Error:", error);
        res.status(500).json({ error: error.message || 'Failed to generate image' });
    }
});

/**
 * Endpoint: /api/edit-image
 * Edits an image using Gemini 2.5 Flash Image.
 */
app.post('/api/edit-image', async (req, res) => {
    try {
        const { image, prompt } = req.body; // image is base64 string

        if (!image || !prompt) {
            return res.status(400).json({ error: 'Image and Prompt are required' });
        }

        console.log(`[Edit] Prompt: "${prompt}"`);

        // Clean base64 header if present
        const cleanBase64 = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: cleanBase64,
                        },
                    },
                    { text: prompt },
                ],
            },
        });

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && part.inlineData) {
            const base64Image = `data:image/png;base64,${part.inlineData.data}`;
            res.json({ image: base64Image });
        } else {
            throw new Error("No edited image returned.");
        }

    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).json({ error: error.message || 'Failed to edit image' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
