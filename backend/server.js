import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// We will connect to Database inside the API handler for serverless, or below for local dev
// connectDB();

const app = express();

// Middleware
app.use(compression()); // Gzip all responses
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads', {
  maxAge: '7d',       // Browser caches images for 7 days
  etag: true,         // ETag for cache validation
  lastModified: true, // Last-Modified header for conditional GETs
}));

import authRoutes from './routes/authRoutes.js';
import sketchRoutes from './routes/sketchRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import academyRoutes from './routes/academyRoutes.js';

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/sketches', sketchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/academy', academyRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Server reload triggered with fresh API Key
// Only listen when running locally (not on Vercel)
if (!process.env.VERCEL) {
    connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
