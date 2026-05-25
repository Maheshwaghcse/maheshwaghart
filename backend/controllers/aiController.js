import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Sanitize user-supplied keyword strings to prevent prompt injection
const sanitizeKeyword = (kw) =>
  kw.replace(/[`'"\\{}[\]]/g, '').trim();

// Convert in-memory buffer to the Google Generative AI inline data structure
const bufferToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
};

// Safe file deletion helper — (Not needed for memory storage, kept as no-op for compatibility)
const safeDelete = (filePath) => {};

// @desc    Generate AI Description from image and keywords
// @route   POST /api/ai/generate
// @access  Private/Admin
export const generateDescription = async (req, res) => {
  console.log(`\x1b[35m[AI Route]\x1b[0m Received generation request!`);

  const fileBuffer = req.file?.buffer ?? null;

  try {
    const { keywords } = req.body;
    console.log(`\x1b[35m[AI Route]\x1b[0m Body keywords:`, keywords);
    console.log(`\x1b[35m[AI Route]\x1b[0m File:`, fileBuffer ? 'Received in memory' : 'None');

    // ── 1. Validate uploaded file presence ────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image.' });
    }

    // ── 2. Validate file MIME type ────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      // safeDelete(filePath); // Not needed for memory storage
      return res.status(400).json({
        error: 'Unsupported file type. Please upload a JPEG, PNG, or WebP image.',
      });
    }

    // ── 3. Verify Gemini API Key ──────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      // safeDelete(filePath); // Not needed for memory storage
      return res.status(400).json({
        error:
          'Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your server/.env file.',
      });
    }

    // ── 4. Parse & sanitize keywords ──────────────────────────────────────
    let keywordList = [];
    if (keywords) {
      if (Array.isArray(keywords)) {
        keywordList = keywords.map(sanitizeKeyword).filter((kw) => kw.length > 0);
      } else if (typeof keywords === 'string') {
        keywordList = keywords
          .split(',')
          .map(sanitizeKeyword)
          .filter((kw) => kw.length > 0);
      }
    }

    // ── 5. Initialize Gemini API ──────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-lite-latest',           // ✅ Lightweight model with independent, unused quota
      generationConfig: {
        responseMimeType: 'application/json', // Forces raw JSON — no markdown wrapping
      },
    });

    // ── 6. Build image part (sync from buffer) ─────────────────────────
    const imagePart = bufferToGenerativePart(fileBuffer, req.file.mimetype);

    // ── 7. Build prompt ───────────────────────────────────────────────────
    const keywordsForPrompt =
      keywordList.length > 0 ? keywordList.join(', ') : 'none provided';

    const prompt = `
      You are a professional art sales copywriter for a sketch-selling and handmade artwork website.
      Your task is to carefully analyze the provided image and generate highly emotional, persuasive, organic, and cinematic artwork sales copy based on the image content and the following user keywords: "${keywordsForPrompt}".
      
      CRITICAL VOCABULARY & SPECIFICITY RULE:
      - Do NOT use heavy, fancy, complex, or overly "weighted" words (such as "transcendent", "ethereal", "juxtaposition", "magnificent", "exquisite", etc.). The language must be extremely simple, natural, and easy for anyone to read, yet deeply powerful, human, and moving. Focus on raw emotion rather than intellectual vocabulary.
      - DEITY & SUBJECT SPECIFICITY: If the artwork represents or contains a specific deity, holy character, or named subject (such as "Mahadev", "Shiva", "Krishna", "Ganesha", etc.) in the image or keywords, you must refer to them by their EXACT SPECIFIC NAME (e.g. write "Mahadev" or "Shiva") in your description, title, and tagline. Do NOT call them generic, detached names like "the god", "the deity", or "the divine figure".
      
      You must strictly satisfy all of the following requirements:
      1. TITLE: Must be exactly 4 to 6 words. It should sound clean, powerful, and artistic, using simple language.
      2. TAGLINE (JSON key "shortDescription"): Must be exactly 4 to 7 words. It must define the core emotional theme and soul of the sketch (e.g., love, peace, devotion, romance, strength). It must feel real, memorable, and immediately connect the reader to the drawing.
      3. FULL DESCRIPTION (JSON key "fullDescription"): Must be EXACTLY 60 words in total length.
         Analyze the artwork carefully and generate a deeply emotional, cinematic, and artistic description that captures:
         - The core emotion of the sketch
         - The relationship between characters (if multiple are present)
         - The physical hand-drawn artistic style (pencil, charcoal, line weights, shadow play)
         - The symbolic meaning of the elements
         - The exact moment happening in the artwork
         
         IMPORTANT DIRECTIVE: Do NOT only describe the dry physical objects or characters. Instead, describe the STORY, MOMENT, EXPRESSION, and EMOTION captured inside the sketch. Make the viewer feel a deep emotional connection and feel a powerful desire to own this original handmade masterpiece.
      
      You must return your response as a valid JSON object matching the following structure exactly:
      {
        "title": "A 4-6 word clean artistic title",
        "shortDescription": "A 4-7 word powerful tagline",
        "fullDescription": "A simple, highly emotional, 60-word sales description explaining the story, moment, expression, and emotion of the sketch"
      }
    `;

    // ── 8. Call Gemini API ────────────────────────────────────────────────
    console.log(`\x1b[36m[Gemini AI]\x1b[0m Sending image and keywords to Gemini API...`);
    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    console.log(`\x1b[32m[Gemini AI]\x1b[0m Received structured response from Gemini API.`);

    // ── 9. Parse JSON response ────────────────────────────────────────────
    // responseMimeType: 'application/json' means no markdown — but we sanitize anyway
    let cleanedText = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const generatedData = JSON.parse(cleanedText);

    // ── 10. Validate response shape ───────────────────────────────────────
    if (
      !generatedData.title ||
      !generatedData.shortDescription ||
      !generatedData.fullDescription
    ) {
      throw new Error('Incomplete response structure received from Gemini.');
    }

    // ── 11. Return result ─────────────────────────────────────────────────
    return res.status(200).json({
      title: generatedData.title,
      shortDescription: generatedData.shortDescription,
      fullDescription: generatedData.fullDescription,
    });
  } catch (error) {
    console.error(`\x1b[31m[API Error]\x1b[0m`, error);

    let userMessage = 'An error occurred while generating the description.';
    let statusCode = 500;

    if (
      error.status === 429 ||
      error.message?.includes('429') ||
      error.message?.includes('Quota exceeded') ||
      error.message?.includes('rate limit')
    ) {
      userMessage = '✨ Gemini AI Daily Free Tier Quota Exceeded (20 requests/day limit reached). Please try again tomorrow, or configure a paid plan in your Google AI Studio!';
      statusCode = 429;
    }

    return res.status(statusCode).json({
      error: userMessage,
      details: error.message,
    });
  } finally {
    // ── Memory cleanup happens automatically in Node.js ──
  }
};