import connectDB from '../config/db.js';
import app from '../server.js';

export default async function handler(req, res) {
    try {
        // Ensure DB is connected before handling the request
        await connectDB();
        
        // Hand over the request to the Express app
        return app(req, res);
    } catch (error) {
        console.error("Vercel Serverless Function Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Serverless Function Crashed. Please check Vercel Logs or Environment Variables.",
            error: error.message 
        });
    }
}
