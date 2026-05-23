import Feedback from '../models/Feedback.js';
import nodemailer from 'nodemailer';

const sendThankYouEmail = async (userEmail, userName) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Thank You for Your Feedback! - MaheshWagh_Art',
            text: `Hi ${userName},\n\nThank you for sharing your thoughts with us!\nWe truly appreciate your feedback and use it to improve our art gallery experience.\n\nKeep creating and stay inspired!\n\nBest,\nMaheshWagh_Art Team`
        };

        await transporter.sendMail(mailOptions);
        console.log('Thank you email sent to', userEmail);
    } catch (error) {
        console.error('Error sending thank you email:', error);
    }
};

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
    try {
        const { name, email, rating, message, category } = req.body;
        
        const feedback = new Feedback({
            name,
            email,
            rating,
            message,
            category
        });

        const createdFeedback = await feedback.save();
        
        // Send thank you email if email was provided
        if (email) {
            sendThankYouEmail(email, name || 'Art Lover');
        }

        res.status(201).json(createdFeedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedback = async (req, res) => {
    try {
        const feedbackList = await Feedback.find({}).sort({ createdAt: -1 });
        res.json(feedbackList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createFeedback, getFeedback };
