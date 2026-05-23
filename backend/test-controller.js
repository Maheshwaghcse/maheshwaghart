import dotenv from 'dotenv';
dotenv.config();

import { generateDescription } from './controllers/aiController.js';
import fs from 'fs';
import path from 'path';

// Mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    console.log(`\n\x1b[33m[Mock Response]\x1b[0m Status: ${res.statusCode}`);
    console.log('JSON Data:', JSON.stringify(data, null, 2));
    return res;
  };
  return res;
};

async function runTest() {
  const uploadsDir = path.resolve('uploads');
  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

  if (imageFiles.length === 0) {
    console.error('No image files found in backend/uploads to test with!');
    return;
  }

  // Create a copy of the file since the controller will delete the req.file on completion
  const sourcePath = path.join(uploadsDir, imageFiles[0]);
  const tempPath = path.join(uploadsDir, `test-copy-${Date.now()}.jpg`);
  fs.copyFileSync(sourcePath, tempPath);

  const req = {
    body: {
      keywords: 'vintage, retro, aesthetic'
    },
    file: {
      path: tempPath,
      mimetype: 'image/jpeg'
    }
  };

  const res = mockResponse();

  console.log('Invoking generateDescription controller directly...');
  await generateDescription(req, res);
}

runTest();
