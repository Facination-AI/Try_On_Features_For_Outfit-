
import { GoogleGenAI } from "@google/genai";
import { ImageData, GenerationResult } from "../types";

export const generateTryOn = async (
  userImage: ImageData,
  outfitImage: ImageData,
  additionalPrompt?: string
): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemPrompt = `
    Task: Virtual Try-On.
    Input 1: A photo of a person.
    Input 2: A photo of an outfit or garment.
    Goal: Generate a high-quality, realistic image of the person from Input 1 wearing the exact outfit from Input 2.
    Maintain the person's facial features, hair, and general body shape.
    Place them in a clean, stylish background.
    ${additionalPrompt ? `Additional Instructions: ${additionalPrompt}` : ""}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: userImage.base64,
            mimeType: userImage.mimeType,
          },
        },
        {
          inlineData: {
            data: outfitImage.base64,
            mimeType: outfitImage.mimeType,
          },
        },
        {
          text: systemPrompt,
        },
      ],
    },
  });

  let imageUrl = "";
  let textOutput = "";

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      textOutput = part.text;
    }
  }

  if (!imageUrl) {
    throw new Error("Model failed to generate an image.");
  }

  return { imageUrl, text: textOutput };
};

export const editImageWithText = async (
  image: ImageData,
  prompt: string
): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: image.base64,
            mimeType: image.mimeType,
          },
        },
        {
          text: `Please edit this image based on the following instruction: ${prompt}. Return the modified image.`,
        },
      ],
    },
  });

  let imageUrl = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  if (!imageUrl) {
    throw new Error("Model failed to generate an image.");
  }

  return { imageUrl };
};
