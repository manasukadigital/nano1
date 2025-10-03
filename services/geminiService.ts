import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export interface EditImageResult {
  image: string | null;
  text: string | null;
}

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<EditImageResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set. Please ensure it is configured.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Add a specific instruction to the user's prompt to guide the model better.
  const fullPrompt = `Please edit the provided image based on the following instruction: "${prompt}"`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let resultImage: string | null = null;
    let resultText: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          resultText = part.text;
        } else if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          resultImage = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
      }
    }

    if (!resultImage) {
        const refusalText = resultText || "The model did not generate an image, possibly due to safety policies or an unclear prompt.";
        throw new Error(refusalText);
    }

    return { image: resultImage, text: resultText };

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during the API call.";
    throw new Error(errorMessage);
  }
};
