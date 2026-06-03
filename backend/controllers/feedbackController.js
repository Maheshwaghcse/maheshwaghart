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
            text: `Hi ${userName},\n\nThank you for sharing your thoughts with us!\nWe truly appreciate your feedback and use it to improve our art gallery experience.\n\nKeep creating and stay inspired!\n\nBest,\nMaheshWagh_Art`
        };

        await transporter.sendMail(mailOptions);
        console.log('Thank you email sent to', userEmail);
    } catch (error) {
        console.error('Error sending thank you email:', error);
    }
};

const sendFeedbackNotificationEmail = async (feedbackData) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const artistMailOptions = {
            from: `"Maheshwagh Art" <${process.env.EMAIL_USER}>`,
            to: 'maheshwaghart@gmail.com',
            subject: `🚨 New Feedback from ${feedbackData.name || 'Art Lover'}`,
            text: `Hi Mahesh,\n\nYou have received new feedback on Maheshwagh Art!\n\nDetails:\n- Name: ${feedbackData.name || 'Anonymous'}\n- Email: ${feedbackData.email || 'None Provided'}\n- Category: ${feedbackData.category || 'General'}\n- Rating: ${feedbackData.rating || 'N/A'}/5\n\nMessage:\n"${feedbackData.message || 'No custom message'}"\n\nBest,\nMaheshwagh Art System`
        };

        await transporter.sendMail(artistMailOptions);
        console.log('Feedback alert email sent to artist.');
    } catch (error) {
        console.error('Error sending feedback alert email:', error);
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
            await sendThankYouEmail(email, name || 'Art Lover');
        }

        // Send notification email to the artist
        await sendFeedbackNotificationEmail(createdFeedback);

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
