import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Routes — imports must be at top level in ESM
import authRoutes from './routes/authRoutes.js';
import sketchRoutes from './routes/sketchRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import academyRoutes from './routes/academyRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',  // set FRONTEND_URL in Vercel env vars
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));   // needed for base64 image payloads

// ❌ REMOVED: express.static('uploads') — Vercel has no filesystem

// Routes
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

// Only start the server locally — Vercel handles this in production
if (!process.env.VERCEL) {
    connectDB();                              // ❌ removed the duplicate connectDB() at top
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;