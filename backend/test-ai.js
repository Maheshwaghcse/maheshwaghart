import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const fileToGenerativePart = (filePath, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType,
    },
  };
};

async function testAI() {
  console.log('Testing Gemini API with real image...');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: { responseMimeType: 'application/json' },
    });

    // Find a real image in the uploads folder
    const uploadsDir = path.resolve('uploads');
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    
    if (imageFiles.length === 0) {
      console.log('No images found in uploads folder');
      return;
    }
    
    const realImagePath = path.join(uploadsDir, imageFiles[0]);
    console.log('Using image:', realImagePath);

    const imagePart = fileToGenerativePart(realImagePath, 'image/jpeg');
    const prompt = 'Describe this image.';

    console.log('Sending request to Gemini...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response:', text);
  } catch (err) {
    console.error('Error during AI generation:', err);
  }
}

testAI();
