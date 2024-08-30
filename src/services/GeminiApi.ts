import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

import * as dotenv from 'dotenv';
dotenv.config();

interface GeminiResponse {
  image_url: string;
  measure_value: number;
}

export class GeminiApi {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async extractValueFromImage(imagePath: string): Promise<GeminiResponse> {
    const genAI = new GoogleGenerativeAI(this.apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });

    const fileManager = new GoogleAIFileManager(this.apiKey);

    const uploadResponse = await fileManager.uploadFile(imagePath, {
      mimeType: 'image/png',
      displayName: 'Measurement display',
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: 'Extract the numerical value as a integer displayed on the meter in the image, which shows a gas or water measurement. Return only the numerical value shown on the display, without any additional text.',
      },
    ]);

    return { image_url: uploadResponse.file.uri, measure_value: +result.response.text() };
  }
}
